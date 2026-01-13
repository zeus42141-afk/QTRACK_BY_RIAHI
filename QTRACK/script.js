/**
 * @class QualityManagementApp
 * @description Application de Management de la Qualité Q-TRACK
 * @implements ISO 9001 - Documentation et traçabilité
 * @implements Lean - Élimination du gaspillage
 * @implements DMAIC - Cycle d'amélioration continue
 */
class QualityManagementApp {
    /**
     * @constructor
     * @description Initialise l'application de gestion de la qualité
     * @implements PDCA - Plan
     */
    constructor() {
        // Configuration centralisée (Lean - Standardisation)
        this.config = {
            APP_NAME: "Q-TRACK",
            APP_VERSION: "1.0.0",
            MAX_RETRIES: 3,
            TIMEOUT: 5000,
            PERFORMANCE_METRICS: {
                MAX_LOAD_TIME: 3000,
                MAX_RESPONSE_TIME: 2000
            },
            CHART_CONFIG: {
                DISTRIBUTION: {
                    BAR_WIDTH: 60,
                    BAR_SPACING: 40,
                    START_X: 50,
                    START_Y: 150,
                    RADIUS: 80
                }
            }
        };

        this.state = {
            currentUser: null,
            nonConformites: [],
            isLoggedIn: false,
            isLoading: false,
            error: null,
            notifications: []
        };

        // Logger pour traçabilité (ISO 9001)
        this.logger = new Logger(this.config.APP_NAME, this.config.APP_VERSION);

        // Validation pour contrôle de qualité (ISO 9001)
        this.validator = new Validator();

        // Initialisation de l'application
        this.init();
    }

    /**
     * @method init
     * @description Initialise l'application et configure les écouteurs d'événements
     * @implements PDCA - Do
     */
    init() {
        try {
            this.logger.info("Initialisation de l'application", {
                timestamp: new Date().toISOString(),
                version: this.config.APP_VERSION
            });

            // Mesure du temps d'initialisation (DMAIC - Measure)
            const startTime = performance.now();

            this.setupEventListeners();
            this.loadInitialData();

            // Mesure du temps d'initialisation (DMAIC - Measure)
            const initTime = performance.now() - startTime;
            this.logger.info("Initialisation terminée", { initTime });

            if (initTime > this.config.PERFORMANCE_METRICS.MAX_LOAD_TIME) {
                this.logger.warn("Temps d'initialisation élevé", { initTime });
            }

        } catch (error) {
            this.handleError("Initialisation échouée", error);
        }
    }

    /**
     * @method setupEventListeners
     * @description Configure les écouteurs d'événements pour l'interface utilisateur
     * @implements ISO 9001 - Standardisation des processus
     */
    setupEventListeners() {
        try {
            // Gestion du menu sidebar (Lean - Élimination du gaspillage)
            this.setupSidebarEvents();

            // Gestion des items de navigation
            this.setupNavigationEvents();

            // Gestion du formulaire de NC
            this.setupNcFormEvents();

            // Gestion du formulaire de connexion
            this.setupLoginEvents();

        } catch (error) {
            this.handleError("Configuration des événements échouée", error);
        }
    }

    /**
     * @method setupSidebarEvents
     * @description Configure les événements du sidebar
     * @implements Lean - Élimination du gaspillage (code réutilisable)
     */
    setupSidebarEvents() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar(sidebar);
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar(sidebar);
            });
        }
    }

    /**
     * @method setupNavigationEvents
     * @description Configure les événements de navigation
     * @implements Lean - Élimination du gaspillage (code réutilisable)
     */
    setupNavigationEvents() {
        const navItems = document.querySelectorAll('.sidebar-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigationClick(item);
            });
        });
    }

    /**
     * @method setupNcFormEvents
     * @description Configure les événements du formulaire de NC
     * @implements Lean - Élimination du gaspillage (code réutilisable)
     */
    setupNcFormEvents() {
        const newNcButton = document.querySelector('.btn-primary');
        const ncForm = document.getElementById('nc-form');
        const closeNcButton = document.getElementById('close-nc-form');

        if (newNcButton) {
            newNcButton.addEventListener('click', () => {
                this.openNcForm(ncForm);
            });
        }

        if (closeNcButton) {
            closeNcButton.addEventListener('click', () => {
                this.closeNcForm(ncForm);
            });
        }

        // Gestion de la soumission du formulaire
        const declarationForm = document.getElementById('declaration-form');
        if (declarationForm) {
            declarationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmitNcForm(declarationForm);
            });
        }
    }

    /**
     * @method setupLoginEvents
     * @description Configure les événements de connexion
     * @implements Lean - Élimination du gaspillage (code réutilisable)
     */
    setupLoginEvents() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
    }

    /**
     * @method loadInitialData
     * @description Charge les données initiales de l'application
     * @implements DMAIC - Measure (suivi des performances)
     */
    async loadInitialData() {
        try {
            this.setState({ isLoading: true });

            // Mesure du temps de chargement (DMAIC - Measure)
            const startTime = performance.now();

            await Promise.all([
                this.loadMetrics(),
                this.loadCharts(),
                this.loadTableData()
            ]);

            // Mesure du temps de chargement (DMAIC - Measure)
            const loadTime = performance.now() - startTime;
            this.logger.info("Chargement des données initiales terminé", { loadTime });

            if (loadTime > this.config.PERFORMANCE_METRICS.MAX_LOAD_TIME) {
                this.logger.warn("Temps de chargement des données élevé", { loadTime });
            }

        } catch (error) {
            this.handleError("Chargement des données initiales échoué", error);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    /**
     * @method loadMetrics
     * @description Charge et affiche les métriques de qualité
     * @implements ISO 9001 - Contrôle de la qualité
     */
    loadMetrics() {
        try {
            // Validation des données (ISO 9001 - Contrôle de la qualité)
            if (!this.state.nonConformites) {
                throw new Error("Données de non-conformités non disponibles");
            }

            const metrics = this.calculateMetrics();

            const metricsContainer = document.querySelector('.metrics-container');
            if (metricsContainer) {
                metricsContainer.innerHTML = '';
                metrics.forEach(metric => {
                    const metricCard = this.createMetricCard(metric);
                    metricsContainer.appendChild(metricCard);
                });
            }

        } catch (error) {
            this.handleError("Chargement des métriques échoué", error);
        }
    }

    /**
     * @method calculateMetrics
     * @description Calcule les métriques de qualité
     * @returns {Array} Tableau des métriques
     * @implements Lean - Standardisation des calculs
     */
    calculateMetrics() {
        const { nonConformites } = this.state;

        return [
            {
                title: 'Total NC',
                value: nonConformites.length.toString(),
                subtitle: 'Toutes périodes',
                color: 'bg-blue-500',
                icon: 'fas fa-info-circle'
            },
            {
                title: 'NC Ouvertes',
                value: nonConformites.filter(nc => nc.statut === 'Ouvert').length.toString(),
                subtitle: 'En attente',
                color: 'bg-orange-500',
                icon: 'fas fa-clock'
            },
            {
                title: 'NC Critiques',
                value: nonConformites.filter(nc => nc.gravite === 'Critique').length.toString(),
                subtitle: 'Priorité haute',
                color: 'bg-red-500',
                icon: 'fas fa-exclamation-circle'
            },
            {
                title: 'NC Clôturées',
                value: nonConformites.filter(nc => nc.statut === 'Clos').length.toString(),
                subtitle: 'Traitées',
                color: 'bg-green-500',
                icon: 'fas fa-check-circle'
            }
        ];
    }

    /**
     * @method createMetricCard
     * @description Crée une carte de métrique
     * @param {Object} metric - Objet de métrique
     * @returns {HTMLElement} Élément DOM de la carte de métrique
     * @implements Lean - Standardisation des composants
     */
    createMetricCard(metric) {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-title">${metric.title}</div>
            <div class="metric-value">${metric.value}</div>
            <div class="metric-subtitle">${metric.subtitle}</div>
            <div class="metric-icon ${metric.color}">
                <i class="${metric.icon}"></i>
            </div>
        `;
        return card;
    }

    /**
     * @method loadCharts
     * @description Charge et affiche les graphiques de qualité
     * @implements ISO 9001 - Visualisation des données
     */
    loadCharts() {
        try {
            this.loadDistributionChart();
            this.loadRepartitionChart();
        } catch (error) {
            this.handleError("Chargement des graphiques échoué", error);
        }
    }

    /**
     * @method loadDistributionChart
     * @description Charge et affiche le graphique de distribution
     * @implements ISO 9001 - Visualisation des données
     */
    loadDistributionChart() {
        try {
            const chartContainer = document.querySelector('.distribution-chart');
            if (!chartContainer) return;

            // Création du canvas pour le graphique
            const canvas = this.createChartCanvas(chartContainer);
            const ctx = canvas.getContext('2d');

            // Récupération des données
            const data = this.getDistributionData();
            const { labels, colors, maxValue } = this.getChartConfig(data);

            // Dessin du graphique
            this.drawBarChart(ctx, canvas, data, labels, colors, maxValue);

        } catch (error) {
            this.handleError("Chargement du graphique de distribution échoué", error);
        }
    }

    /**
     * @method loadRepartitionChart
     * @description Charge et affiche le graphique de répartition
     * @implements ISO 9001 - Visualisation des données
     */
    loadRepartitionChart() {
        try {
            const chartContainer = document.querySelector('.repartition-chart');
            if (!chartContainer) return;

            // Création du canvas pour le graphique
            const canvas = this.createChartCanvas(chartContainer);
            const ctx = canvas.getContext('2d');

            // Récupération des données
            const data = this.getRepartitionData();
            const { labels, colors, total } = this.getRepartitionConfig(data);

            // Dessin du graphique
            this.drawPieChart(ctx, canvas, data, labels, colors, total);

        } catch (error) {
            this.handleError("Chargement du graphique de répartition échoué", error);
        }
    }

    /**
     * @method createChartCanvas
     * @description Crée un canvas pour les graphiques
     * @param {HTMLElement} container - Conteneur du graphique
     * @returns {HTMLCanvasElement} Canvas pour le graphique
     * @implements Lean - Standardisation des composants
     */
    createChartCanvas(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        container.innerHTML = '';
        container.appendChild(canvas);
        return canvas;
    }

    /**
     * @method getDistributionData
     * @description Récupère les données pour le graphique de distribution
     * @returns {Array} Données pour le graphique
     * @implements Lean - Standardisation des calculs
     */
    getDistributionData() {
        const { nonConformites } = this.state;
        return [
            nonConformites.filter(nc => nc.statut === 'Ouvert').length,
            nonConformites.filter(nc => nc.gravite === 'Critique').length,
            nonConformites.filter(nc => nc.statut === 'Clos').length
        ];
    }

    /**
     * @method getRepartitionData
     * @description Récupère les données pour le graphique de répartition
     * @returns {Array} Données pour le graphique
     * @implements Lean - Standardisation des calculs
     */
    getRepartitionData() {
        const { nonConformites } = this.state;
        return [
            nonConformites.filter(nc => nc.statut === 'Ouvert').length,
            nonConformites.filter(nc => nc.gravite === 'Critique').length,
            nonConformites.filter(nc => nc.statut === 'Clos').length
        ];
    }

    /**
     * @method getChartConfig
     * @description Récupère la configuration pour le graphique de distribution
     * @param {Array} data - Données du graphique
     * @returns {Object} Configuration du graphique
     * @implements Lean - Standardisation des configurations
     */
    getChartConfig(data) {
        const labels = ['Ouvert', 'Critique', 'Clos'];
        const colors = ['#3b82f6', '#f97316', '#10b981'];
        const maxValue = Math.max(...data, 4);

        return { labels, colors, maxValue };
    }

    /**
     * @method getRepartitionConfig
     * @description Récupère la configuration pour le graphique de répartition
     * @param {Array} data - Données du graphique
     * @returns {Object} Configuration du graphique
     * @implements Lean - Standardisation des configurations
     */
    getRepartitionConfig(data) {
        const labels = ['Ouvert', 'Critique', 'Clos'];
        const colors = ['#3b82f6', '#f97316', '#10b981'];
        const total = data.reduce((sum, value) => sum + value, 0);

        return { labels, colors, total };
    }

    /**
     * @method drawBarChart
     * @description Dessine un graphique à barres
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {HTMLCanvasElement} canvas - Canvas du graphique
     * @param {Array} data - Données du graphique
     * @param {Array} labels - Étiquettes du graphique
     * @param {Array} colors - Couleurs du graphique
     * @param {number} maxValue - Valeur maximale pour l'axe Y
     * @implements Lean - Standardisation des dessins
     */
    drawBarChart(ctx, canvas, data, labels, colors, maxValue) {
        const chartConfig = this.config.CHART_CONFIG.DISTRIBUTION;

        // Dessin des axes
        this.drawAxes(ctx, canvas, chartConfig, maxValue);

        // Dessin des barres
        data.forEach((value, index) => {
            const x = chartConfig.START_X + index * (chartConfig.BAR_WIDTH + chartConfig.BAR_SPACING);
            const height = (value / maxValue) * 120;
            const y = chartConfig.START_Y - height;

            ctx.fillStyle = colors[index];
            ctx.fillRect(x, y, chartConfig.BAR_WIDTH, height);

            // Ajout des labels
            this.drawBarLabels(ctx, x, y, height, labels[index], value, chartConfig);
        });
    }

    /**
     * @method drawPieChart
     * @description Dessine un graphique en camembert
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {HTMLCanvasElement} canvas - Canvas du graphique
     * @param {Array} data - Données du graphique
     * @param {Array} labels - Étiquettes du graphique
     * @param {Array} colors - Couleurs du graphique
     * @param {number} total - Total des données
     * @implements Lean - Standardisation des dessins
     */
    drawPieChart(ctx, canvas, data, labels, colors, total) {
        const chartConfig = this.config.CHART_CONFIG.DISTRIBUTION;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        let currentAngle = -Math.PI / 2;

        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, chartConfig.RADIUS, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index];
            ctx.fill();

            currentAngle += sliceAngle;
        });

        // Ajout de la légende
        this.drawPieLegend(ctx, canvas, data, labels, colors);
    }

    /**
     * @method drawAxes
     * @description Dessine les axes du graphique
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {HTMLCanvasElement} canvas - Canvas du graphique
     * @param {Object} config - Configuration du graphique
     * @param {number} maxValue - Valeur maximale pour l'axe Y
     * @implements Lean - Standardisation des dessins
     */
    drawAxes(ctx, canvas, config, maxValue) {
        ctx.beginPath();
        ctx.moveTo(config.START_X, config.START_Y);
        ctx.lineTo(config.START_X + (config.BAR_WIDTH + config.BAR_SPACING) * 3, config.START_Y);
        ctx.moveTo(config.START_X, config.START_Y);
        ctx.lineTo(config.START_X, config.START_Y - 150);
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        // Ajout des valeurs sur les axes
        this.drawAxisLabels(ctx, config, maxValue);
    }

    /**
     * @method drawBarLabels
     * @description Dessine les labels des barres
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} height - Hauteur de la barre
     * @param {string} label - Étiquette de la barre
     * @param {number} value - Valeur de la barre
     * @param {Object} config - Configuration du graphique
     * @implements Lean - Standardisation des dessins
     */
    drawBarLabels(ctx, x, y, height, label, value, config) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + config.BAR_WIDTH / 2, config.START_Y + 20);

        // Ajout des valeurs sur les axes
        ctx.fillText('0', config.START_X - 20, config.START_Y + 5);
        ctx.fillText('1', config.START_X - 20, config.START_Y - 30);
        ctx.fillText('2', config.START_X - 20, config.START_Y - 60);
        ctx.fillText('3', config.START_X - 20, config.START_Y - 90);
        ctx.fillText('4', config.START_X - 20, config.START_Y - 120);
    }

    /**
     * @method drawAxisLabels
     * @description Dessine les labels des axes
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {Object} config - Configuration du graphique
     * @param {number} maxValue - Valeur maximale pour l'axe Y
     * @implements Lean - Standardisation des dessins
     */
    drawAxisLabels(ctx, config, maxValue) {
        for (let i = 0; i <= 4; i++) {
            ctx.fillText(i.toString(), config.START_X - 20, config.START_Y - (i * 30));
        }
    }

    /**
     * @method drawPieLegend
     * @description Dessine la légende du graphique en camembert
     * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
     * @param {HTMLCanvasElement} canvas - Canvas du graphique
     * @param {Array} data - Données du graphique
     * @param {Array} labels - Étiquettes du graphique
     * @param {Array} colors - Couleurs du graphique
     * @implements Lean - Standardisation des dessins
     */
    drawPieLegend(ctx, canvas, data, labels, colors) {
        const legendContainer = document.createElement('div');
        legendContainer.className = 'mt-4 space-y-2';
        canvas.parentNode.appendChild(legendContainer);

        data.forEach((value, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center justify-between';
            legendItem.innerHTML = `
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style="background-color: ${colors[index]}"></div>
                    <span className="text-sm text-gray-600">${labels[index]}</span>
                </div>
                <span className="text-sm font-semibold">${value}</span>
            `;
            legendContainer.appendChild(legendItem);
        });
    }

    /**
     * @method loadTableData
     * @description Charge et affiche les données de la table
     * @implements ISO 9001 - Visualisation des données
     */
    loadTableData() {
        try {
            const tableBody = document.querySelector('.table tbody');
            if (!tableBody) return;

            tableBody.innerHTML = '';

            if (this.state.nonConformites.length === 0) {
                this.createEmptyTableRow(tableBody);
                return;
            }

            this.state.nonConformites.forEach(nc => {
                const row = this.createTableRow(nc);
                tableBody.appendChild(row);
            });

        } catch (error) {
            this.handleError("Chargement des données de table échoué", error);
        }
    }

    /**
     * @method createEmptyTableRow
     * @description Crée une ligne vide pour la table
     * @param {HTMLElement} tableBody - Corps de la table
     * @implements Lean - Standardisation des composants
     */
    createEmptyTableRow(tableBody) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" className="text-center py-8 text-gray-500">
                Aucune non-conformité enregistrée
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }

    /**
     * @method createTableRow
     * @description Crée une ligne pour la table
     * @param {Object} nc - Non-conformité
     * @returns {HTMLElement} Ligne de table
     * @implements Lean - Standardisation des composants
     */
    createTableRow(nc) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${nc.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${nc.type_defaut}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${nc.gravite}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${nc.statut}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${nc.id_declarant || 'Inconnu'}</td>
        `;
        return row;
    }

    /**
     * @method loadModuleContent
     * @description Charge le contenu du module sélectionné
     * @param {string} moduleId - ID du module
     * @implements DMAIC - Improve (chargement dynamique)
     */
    loadModuleContent(moduleId) {
        try {
            this.logger.info("Chargement du module", { moduleId });
            // Implémenter le chargement du contenu spécifique à chaque module
            // Exemple: charger les composants React correspondants

        } catch (error) {
            this.handleError("Chargement du module échoué", error);
        }
    }

    /**
     * @method openNcForm
     * @description Ouvre le formulaire de déclaration de NC
     * @param {HTMLElement} ncForm - Formulaire de NC
     * @implements Lean - Amélioration de l'UX
     */
    openNcForm(ncForm) {
        try {
            if (ncForm && document.getElementById('dashboard')) {
                ncForm.style.display = 'block';
                document.getElementById('dashboard').style.display = 'none';
            }
        } catch (error) {
            this.handleError("Ouverture du formulaire échouée", error);
        }
    }

    /**
     * @method closeNcForm
     * @description Ferme le formulaire de déclaration de NC
     * @param {HTMLElement} ncForm - Formulaire de NC
     * @implements Lean - Amélioration de l'UX
     */
    closeNcForm(ncForm) {
        try {
            if (ncForm && document.getElementById('dashboard')) {
                ncForm.style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('declaration-form').reset();
            }
        } catch (error) {
            this.handleError("Fermeture du formulaire échouée", error);
        }
    }

    /**
     * @method handleSubmitNcForm
     * @description Gère la soumission du formulaire de NC
     * @param {HTMLFormElement} form - Formulaire de déclaration
     * @implements ISO 9001 - Contrôle de la qualité
     */
    async handleSubmitNcForm(form) {
        try {
            // Validation des données (ISO 9001 - Contrôle de la qualité)
            const formData = this.getFormData(form);
            const validation = this.validator.validateNcForm(formData);

            if (!validation.isValid) {
                this.showErrorMessage(validation.errors);
                return;
            }

            this.setState({ isLoading: true });

            // Soumission des données
            await this.submitNcDeclaration(formData);

            // Mise à jour de l'affichage
            this.updateDisplay();

            // Fermeture du formulaire
            this.closeNcForm(document.getElementById('nc-form'));

            // Affichage du message de succès
            this.showSuccessMessage('Non-Conformité déclarée avec succès');

        } catch (error) {
            this.handleError("Soumission du formulaire échouée", error);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    /**
     * @method getFormData
     * @description Récupère les données du formulaire
     * @param {HTMLFormElement} form - Formulaire
     * @returns {Object} Données du formulaire
     * @implements Lean - Standardisation des traitements
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * @method submitNcDeclaration
     * @description Soumet une nouvelle déclaration de NC
     * @param {Object} ncData - Données de la NC
     * @implements DMAIC - Improve (gestion des données)
     */
    async submitNcDeclaration(ncData) {
        try {
            // Simulation de l'ajout de la NC
            const newNc = {
                ...ncData,
                id: this.state.nonConformites.length + 1,
                date_creation: new Date().toISOString(),
                statut: 'Ouvert'
            };

            this.setState(prevState => ({
                nonConformites: [...prevState.nonConformites, newNc]
            }));

            this.logger.info("Nouvelle NC ajoutée", { ncId: newNc.id, ncData });

        } catch (error) {
            this.handleError("Ajout de la NC échoué", error);
            throw error;
        }
    }

    /**
     * @method updateDisplay
     * @description Met à jour l'affichage de l'application
     * @implements DMAIC - Control (mise à jour des données)
     */
    updateDisplay() {
        this.loadMetrics();
        this.loadCharts();
        this.loadTableData();
    }

    /**
     * @method showSuccessMessage
     * @description Affiche un message de succès
     * @param {string} message - Message de succès
     * @implements ISO 9001 - Communication avec l'utilisateur
     */
    showSuccessMessage(message) {
        this.showNotification('success', message);
    }

    /**
     * @method showErrorMessage
     * @description Affiche un message d'erreur
     * @param {string|Object} message - Message d'erreur
     * @implements ISO 9001 - Communication avec l'utilisateur
     */
    showErrorMessage(message) {
        this.showNotification('error', message);
    }

    /**
     * @method showNotification
     * @description Affiche une notification
     * @param {string} type - Type de notification (success, error, warning, info)
     * @param {string|Object} message - Message de notification
     * @implements ISO 9001 - Communication avec l'utilisateur
     */
    showNotification(type, message) {
        const notification = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString()
        };

        this.setState(prevState => ({
            notifications: [notification, ...prevState.notifications]
        }));

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    }

    /**
     * @method removeNotification
     * @description Supprime une notification
     * @param {number} id - ID de la notification
     * @implements DMAIC - Control (gestion des notifications)
     */
    removeNotification(id) {
        this.setState(prevState => ({
            notifications: prevState.notifications.filter(n => n.id !== id)
        }));
    }

    /**
     * @method handleNavigationClick
     * @description Gère le clic sur un item de navigation
     * @param {HTMLElement} item - Item de navigation cliqué
     * @implements Lean - Élimination du gaspillage (code réutilisable)
     */
    handleNavigationClick(item) {
        try {
            // Mise à jour de l'état actif
            document.querySelectorAll('.sidebar-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Chargement du contenu du module
            const moduleId = item.dataset.module;
            this.loadModuleContent(moduleId);

        } catch (error) {
            this.handleError("Gestion de la navigation échouée", error);
        }
    }

    /**
     * @method toggleSidebar
     * @description Ouvre/ferme le sidebar
     * @param {HTMLElement} sidebar - Sidebar à toggle
     * @implements Lean - Amélioration de l'UX
     */
    toggleSidebar(sidebar) {
        sidebar.classList.toggle('open');
    }

    /**
     * @method closeSidebar
     * @description Ferme le sidebar
     * @param {HTMLElement} sidebar - Sidebar à fermer
     * @implements Lean - Amélioration de l'UX
     */
    closeSidebar(sidebar) {
        sidebar.classList.remove('open');
    }

    /**
     * @method handleLogin
     * @description Gère la connexion de l'utilisateur
     * @param {HTMLFormElement} form - Formulaire de connexion
     * @implements ISO 9001 - Contrôle d'accès
     */
    async handleLogin(form) {
        try {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            // Validation des identifiants (ISO 9001 - Contrôle d'accès)
            if (!username || !password) {
                this.showErrorMessage('Veuillez remplir tous les champs');
                return;
            }

            const user = await this.login(username, password);

            if (user) {
                this.setState({ currentUser: user, isLoggedIn: true });
                this.showDashboard();
                this.showSuccessMessage('Connexion réussie');
            } else {
                this.showErrorMessage('Identifiants incorrects');
            }

        } catch (error) {
            this.handleError("Connexion échouée", error);
        }
    }

    /**
     * @method login
     * @description Authentifie un utilisateur
     * @param {string} username - Nom d'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object|null} Utilisateur authentifié ou null
     * @implements ISO 9001 - Contrôle d'accès
     */
    async login(username, password) {
        try {
            // Simulation de l'authentification
            if (username === 'admin' && password === 'admin123') {
                return { id: 1, username: 'admin', role: 'admin' };
            }
            return null;

        } catch (error) {
            this.handleError("Authentification échouée", error);
            return null;
        }
    }

    /**
     * @method showDashboard
     * @description Affiche le dashboard
     * @implements Lean - Amélioration de l'UX
     */
    showDashboard() {
        try {
            const loginForm = document.getElementById('login-form');
            const dashboard = document.getElementById('dashboard');

            if (loginForm && dashboard) {
                loginForm.style.display = 'none';
                dashboard.style.display = 'block';
            }
        } catch (error) {
            this.handleError("Affichage du dashboard échoué", error);
        }
    }

    /**
     * @method closeNc
     * @description Clôture une NC
     * @param {number} ncId - ID de la NC à clôturer
     * @implements DMAIC - Improve (gestion des NC)
     */
    closeNc(ncId) {
        try {
            const ncIndex = this.state.nonConformites.findIndex(nc => nc.id === ncId);

            if (ncIndex !== -1) {
                this.setState(prevState => {
                    const updatedNcs = [...prevState.nonConformites];
                    updatedNcs[ncIndex] = { ...updatedNcs[ncIndex], statut: 'Clos' };
                    return { nonConformites: updatedNcs };
                });

                this.updateDisplay();
                this.showSuccessMessage('NC clôturée avec succès');
            }

        } catch (error) {
            this.handleError("Clôture de la NC échouée", error);
        }
    }

    /**
     * @method updateNc
     * @description Met à jour une NC
     * @param {number} ncId - ID de la NC à mettre à jour
     * @param {Object} updates - Mises à jour à appliquer
     * @implements DMAIC - Improve (gestion des NC)
     */
    updateNc(ncId, updates) {
        try {
            const ncIndex = this.state.nonConformites.findIndex(nc => nc.id === ncId);

            if (ncIndex !== -1) {
                this.setState(prevState => {
                    const updatedNcs = [...prevState.nonConformites];
                    updatedNcs[ncIndex] = { ...updatedNcs[ncIndex], ...updates };
                    return { nonConformites: updatedNcs };
                });

                this.updateDisplay();
                this.showSuccessMessage('NC mise à jour avec succès');
            }

        } catch (error) {
            this.handleError("Mise à jour de la NC échouée", error);
        }
    }

    /**
     * @method setState
     * @description Met à jour l'état de l'application
     * @param {Object} newState - Nouvel état
     * @implements DMAIC - Control (gestion de l'état)
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * @method handleError
     * @description Gère les erreurs de l'application
     * @param {string} message - Message d'erreur
     * @param {Error} error - Objet d'erreur
     * @implements ISO 9001 - Gestion des non-conformités
     */
    handleError(message, error) {
        this.logger.error(message, error);
        this.showErrorMessage(message);
    }
}

/**
 * @class Logger
 * @description Système de logging pour l'application
 * @implements ISO 9001 - Traçabilité
 */
class Logger {
    constructor(appName, appVersion) {
        this.appName = appName;
        this.appVersion = appVersion;
    }

    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data: {
                ...data,
                appName: this.appName,
                appVersion: this.appVersion,
                userAgent: navigator.userAgent
            }
        };

        console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));

        // Envoyer les logs à un système de monitoring
        if (level === 'error') {
            this.sendToMonitoring(logEntry);
        }
    }

    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }

    sendToMonitoring(logEntry) {
        // Implémenter l'envoi vers un système de monitoring (Sentry, LogRocket, etc.)
        console.log('Sending to monitoring:', logEntry);
    }
}

/**
 * @class Validator
 * @description Système de validation pour l'application
 * @implements ISO 9001 - Contrôle de la qualité
 */
class Validator {
    validateNcForm(formData) {
        const errors = {};

        if (!formData.type_defaut || formData.type_defaut.trim() === '') {
            errors.type_defaut = 'Le type de défaut est requis';
        }

        if (!formData.gravite || formData.gravite.trim() === '') {
            errors.gravite = 'La gravité est requise';
        }

        if (!formData.description || formData.description.trim() === '') {
            errors.description = 'La description est requise';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// Initialisation de l'application (PDCA - Plan)
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new QualityManagementApp();

        // Exposer l'application globalement pour le débogage (ISO 9001 - Traçabilité)
        window.qTrackApp = app;

        // Mesure du temps de chargement initial (DMAIC - Measure)
        const loadTime = performance.now();
        console.log(`Q-TRACK initialisé en ${loadTime}ms`);

    } catch (error) {
        console.error("Initialisation de Q-TRACK échouée", error);
    }
});

// Composants React pour les modules (à intégrer avec l'application)
const OperationsQualite = ({ app }) => {
    const [ncs, setNcs] = React.useState([]);
    const [selectedNc, setSelectedNc] = React.useState(null);

    React.useEffect(() => {
        // Charger les NC existantes depuis l'application
        if (app && app.state.nonConformites) {
            setNcs(app.state.nonConformites);
        }
    }, [app]);

    const handleNcClick = (nc) => {
        setSelectedNc(nc);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Opérations Qualité</h1>
            </header>
            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Liste des Non-Conformités</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DÉFAUT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRAVITÉ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ncs.map(nc => (
                                        <tr key={nc.id} onClick={() => handleNcClick(nc)} className="cursor-pointer hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nc.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nc.type_defaut}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nc.gravite}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nc.statut}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        app.updateNc(nc.id, { statut: 'Clos' });
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                                >
                                                    📝
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        app.closeNc(nc.id);
                                                    }}
                                                    className="text-green-500 hover:text-green-700"
                                                >
                                                    ✅
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        {selectedNc && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold mb-4">Détails de la NC #{selectedNc.id}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-medium">Type:</span> {selectedNc.type_defaut}
                                    </div>
                                    <div>
                                        <span className="font-medium">Gravité:</span> {selectedNc.gravite}
                                    </div>
                                    <div>
                                        <span className="font-medium">Statut:</span> {selectedNc.statut}
                                    </div>
                                    <div>
                                        <span className="font-medium">Description:</span>
                                        <p className="mt-1">{selectedNc.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const AnalysePilotage = () => {
    const [analysisData, setAnalysisData] = React.useState([]);

    React.useEffect(() => {
        // Charger les données d'analyse
        loadAnalysisData();
    }, []);

    const loadAnalysisData = () => {
        // Charger les données depuis la base de données
        console.log('Chargement des données d\'analyse...');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Analyse & Pilotage</h1>
            </header>
            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">5 Pourquoi</h2>
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <p className="font-medium">Pourquoi 1:</p>
                                <p className="text-gray-600">Description du problème</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <p className="font-medium">Pourquoi 2:</p>
                                <p className="text-gray-600">Cause racine</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <p className="font-medium">Pourquoi 3:</p>
                                <p className="text-gray-600">Cause profonde</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Ishikawa</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Homme</h3>
                                <p className="text-gray-600">Facteurs humains</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Méthode</h3>
                                <p className="text-gray-600">Processus et procédures</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Matière</h3>
                                <p className="text-gray-600">Matériaux et ressources</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Rapports = () => {
    const generateMonthlyReport = () => {
        // Générer un rapport mensuel
        console.log('Génération du rapport mensuel...');
    };

    const generateActionReport = () => {
        // Générer un rapport des actions
        console.log('Génération du rapport des actions...');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Rapports</h1>
            </header>
            <main className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={generateMonthlyReport}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                    >
                        📊 Rapport Mensuel
                    </button>
                    <button
                        onClick={generateActionReport}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                    >
                        📝 Rapport Actions
                    </button>
                </div>
            </main>
        </div>
    );
};