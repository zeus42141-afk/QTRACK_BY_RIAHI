/**
 * @class DatabaseManager
 * @description Gestionnaire de base de données pour l'application QTrack
 * @implements ISO 9001 - Documentation et traçabilité
 * @implements Lean - Élimination du gaspillage (erreurs, temps)
 */
class DatabaseManager {
    /**
     * @constructor
     * @description Initialise le gestionnaire de base de données
     * @implements PDCA - Plan
     */
    constructor() {
        this.db = null;
        this.dbVersion = 1;
        this.dbName = "QTrackDB";
        this.initializationPromise = null;
        this.initDatabase();
    }

    /**
     * @method initDatabase
     * @description Initialise la base de données IndexedDB
     * @implements ISO 9001 - Contrôle de la qualité
     * @implements DMAIC - Measure (suivi des erreurs)
     */
    async initDatabase() {
        try {
            // Vérification de la compatibilité (Lean - Prévention des erreurs)
            if (!window.indexedDB) {
                throw new Error("IndexedDB non supporté par ce navigateur");
            }

            // Mesure de la performance d'initialisation
            const startTime = performance.now();

            // Utilisation de promesses pour meilleure gestion asynchrone (Lean - Élimination du gaspillage)
            const dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = (event) => {
                    const error = new Error(`Erreur d'ouverture DB: ${event.target.error.message}`);
                    this.logError('DB_INIT_ERROR', error);
                    reject(error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.logInfo('DB_INIT_SUCCESS', {
                        dbName: this.dbName,
                        version: this.dbVersion,
                        executionTime: performance.now() - startTime
                    });
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                    this.logInfo('DB_UPGRADE_NEEDED', {
                        oldVersion: event.oldVersion,
                        newVersion: event.newVersion
                    });
                    this.createTables();
                };
            });

            this.initializationPromise = dbPromise;
            await dbPromise;
            await this.createTables(); // S'assurer que les tables sont créées

        } catch (error) {
            this.logError('DB_INITIALIZATION_FAILED', error);
            throw error;
        }
    }

    /**
     * @method createTables
     * @description Crée les tables de la base de données si elles n'existent pas
     * @implements ISO 9001 - Documentation des structures de données
     * @implements Lean - Standardisation
     */
    createTables() {
        if (!this.db) {
            throw new Error("Base de données non initialisée");
        }

        const tables = [
            {
                name: "users",
                columns: [
                    { name: "id", key: true, autoIncrement: true },
                    { name: "username", unique: true, validation: "string" },
                    { name: "password", encrypted: true, validation: "string" },
                    { name: "role", default: "utilisateur", validation: "string" },
                    { name: "email", validation: "email" }
                ]
            },
            {
                name: "non_conformites",
                columns: [
                    { name: "id", key: true, autoIncrement: true },
                    { name: "type_defaut", validation: "string" },
                    { name: "poste", validation: "string" },
                    { name: "gravite", options: ["Mineure", "Majeure", "Critique"], validation: "enum" },
                    { name: "description", validation: "string" },
                    { name: "statut", default: "Ouvert", validation: "string" },
                    { name: "date_creation", default: "CURRENT_TIMESTAMP", validation: "timestamp" },
                    { name: "id_declarant", validation: "number" }
                ]
            },
            {
                name: "actions_correctives",
                columns: [
                    { name: "id", key: true, autoIncrement: true },
                    { name: "description", validation: "string" },
                    { name: "responsable", validation: "string" },
                    { name: "delai", validation: "number" },
                    { name: "statut", default: "Non démarré", validation: "string" },
                    { name: "id_nc", validation: "number" }
                ]
            }
        ];

        try {
            const transaction = this.db.transaction(["users", "non_conformites", "actions_correctives"], "versionchange");

            tables.forEach(table => {
                if (!this.db.objectStoreNames.contains(table.name)) {
                    const objectStore = this.db.createObjectStore(table.name, { keyPath: "id" });

                    table.columns.forEach(column => {
                        if (column.key) return;

                        const options = {
                            unique: column.unique || false
                        };

                        if (column.options) options.options = column.options;
                        if (column.encrypted) options.encrypt = true;

                        objectStore.createIndex(column.name, column.name, options);
                    });

                    this.logInfo('TABLE_CREATED', { tableName: table.name, columns: table.columns.length });
                }
            });

            transaction.oncomplete = () => {
                this.logInfo('TABLES_INITIALIZATION_COMPLETE', { tables: tables.length });
            };

            transaction.onerror = (event) => {
                throw new Error(`Erreur lors de la création des tables: ${event.target.error.message}`);
            };

        } catch (error) {
            this.logError('TABLES_CREATION_FAILED', error);
            throw error;
        }
    }

    /**
     * @method validateData
     * @description Valide les données selon les règles définies
     * @implements ISO 9001 - Contrôle de la qualité
     * @implements Lean - Prévention des défauts
     */
    validateData(data, schema) {
        const errors = [];

        schema.forEach(column => {
            const value = data[column.name];

            // Vérification des champs obligatoires
            if (column.required && (value === undefined || value === null || value === '')) {
                errors.push(`${column.name} est requis`);
            }

            // Validation des types
            if (value !== undefined && value !== null) {
                switch (column.validation) {
                    case "string":
                        if (typeof value !== 'string') {
                            errors.push(`${column.name} doit être une chaîne de caractères`);
                        }
                        break;
                    case "number":
                        if (typeof value !== 'number') {
                            errors.push(`${column.name} doit être un nombre`);
                        }
                        break;
                    case "email":
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            errors.push(`${column.name} n'est pas un email valide`);
                        }
                        break;
                    case "enum":
                        if (!column.options.includes(value)) {
                            errors.push(`${column.name} doit être l'une des valeurs: ${column.options.join(', ')}`);
                        }
                        break;
                    case "timestamp":
                        if (isNaN(Date.parse(value))) {
                            errors.push(`${column.name} doit être une date valide`);
                        }
                        break;
                }
            }
        });

        if (errors.length > 0) {
            throw new Error(`Validation échouée: ${errors.join(', ')}`);
        }
    }

    /**
     * @method executeTransaction
     * @description Exécute une transaction de manière standardisée
     * @implements ISO 9001 - Standardisation des processus
     * @implements Lean - Élimination du gaspillage (duplication de code)
     */
    async executeTransaction(storeNames, mode, operation) {
        if (!this.db) {
            throw new Error("Base de données non initialisée");
        }

        if (!this.initializationPromise) {
            await this.initDatabase();
        }

        try {
            const transaction = this.db.transaction(storeNames, mode);
            const result = await operation(transaction);
            return result;
        } catch (error) {
            this.logError('TRANSACTION_FAILED', error);
            throw error;
        }
    }

    // Fonctions CRUD pour les utilisateurs
    async addUser(user) {
        try {
            // Validation des données (ISO 9001 - Contrôle de la qualité)
            this.validateData(user, [
                { name: "username", required: true, validation: "string" },
                { name: "password", required: true, validation: "string" },
                { name: "role", required: false, validation: "string" },
                { name: "email", required: false, validation: "email" }
            ]);

            // Hashage du mot de passe (Sécurité - ISO 27001)
            if (user.password) {
                user.password = await this.hashPassword(user.password);
            }

            return await this.executeTransaction(["users"], "readwrite", async (transaction) => {
                const store = transaction.objectStore("users");
                const request = store.add(user);

                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            });

        } catch (error) {
            this.logError('USER_ADD_FAILED', error);
            throw error;
        }
    }

    async getUser(username) {
        return await this.executeTransaction(["users"], "readonly", async (transaction) => {
            const store = transaction.objectStore("users");
            const index = store.index("username");
            const request = index.get(username);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    // Fonctions CRUD pour les NC
    async addNonConformite(nc) {
        try {
            this.validateData(nc, [
                { name: "type_defaut", required: true, validation: "string" },
                { name: "poste", required: true, validation: "string" },
                { name: "gravite", required: true, validation: "enum" },
                { name: "description", required: true, validation: "string" },
                { name: "id_declarant", required: true, validation: "number" }
            ]);

            return await this.executeTransaction(["non_conformites"], "readwrite", async (transaction) => {
                const store = transaction.objectStore("non_conformites");
                const request = store.add(nc);

                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            });

        } catch (error) {
            this.logError('NC_ADD_FAILED', error);
            throw error;
        }
    }

    async getNonConformites() {
        return await this.executeTransaction(["non_conformites"], "readonly", async (transaction) => {
            const store = transaction.objectStore("non_conformites");
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    // Fonctions CRUD pour les actions correctives
    async addActionCorrective(action) {
        try {
            this.validateData(action, [
                { name: "description", required: true, validation: "string" },
                { name: "responsable", required: true, validation: "string" },
                { name: "delai", required: true, validation: "number" },
                { name: "id_nc", required: true, validation: "number" }
            ]);

            return await this.executeTransaction(["actions_correctives"], "readwrite", async (transaction) => {
                const store = transaction.objectStore("actions_correctives");
                const request = store.add(action);

                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            });

        } catch (error) {
            this.logError('ACTION_ADD_FAILED', error);
            throw error;
        }
    }

    /**
     * @method hashPassword
     * @description Hashage sécurisé du mot de passe
     * @implements ISO 27001 - Sécurité de l'information
     */
    async hashPassword(password) {
        // Utilisation de l'API SubtleCrypto pour le hashage sécurisé
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * @method logInfo
     * @description Logging structuré des informations
     * @implements ISO 9001 - Traçabilité
     * @implements PDCA - Check (suivi des performances)
     */
    logInfo(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            data,
            level: 'INFO'
        };

        console.log(JSON.stringify(logEntry));
        // Ici, vous pourriez envoyer les logs à un système de monitoring
    }

    /**
     * @method logError
     * @description Logging structuré des erreurs
     * @implements ISO 9001 - Analyse des non-conformités
     * @implements DMAIC - Analyze (analyse des causes racines)
     */
    logError(event, error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            error: error.message,
            stack: error.stack,
            level: 'ERROR'
        };

        console.error(JSON.stringify(logEntry));
        // Ici, vous pourriez envoyer les erreurs à un système de monitoring
    }

    /**
     * @method getDatabaseStatus
     * @description Renvoie le statut de la base de données
     * @implements PDCA - Check (mesure des performances)
     */
    getDatabaseStatus() {
        return {
            initialized: !!this.db,
            dbName: this.dbName,
            version: this.dbVersion,
            storeNames: this.db ? Array.from(this.db.objectStoreNames) : []
        };
    }
}

// Exporter l'instance de la base de données avec pattern Singleton
const dbManager = new DatabaseManager();
export default dbManager;