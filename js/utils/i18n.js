// js/utils/i18n.js
class I18n {
    constructor() {
        this.currentLanguage = Storage.get('language', 'es');
        this.translations = {};
        this.observers = [];
    }

    async init() {
        try {
            this.translations = await Helpers.loadJSON('config/languages.json');
            this.notifyObservers();
        } catch (error) {
            console.warn('Error loading translations, using defaults:', error);
            // Traducciones por defecto
            this.translations = {
                es: {
                    nav: { home: "Inicio", articles: "Artículos", search: "Buscar..." },
                    filters: { title: "Filtros", clear: "Limpiar" },
                    content: { loading: "Cargando...", noResults: "Sin resultados" },
                    formats: { markdown: "Markdown", latex: "LaTeX", video: "Video", notebook: "Notebook" }
                },
                en: {
                    nav: { home: "Home", articles: "Articles", search: "Search..." },
                    filters: { title: "Filters", clear: "Clear" },
                    content: { loading: "Loading...", noResults: "No results" },
                    formats: { markdown: "Markdown", latex: "LaTeX", video: "Video", notebook: "Notebook" }
                }
            };
            this.notifyObservers();
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            Storage.set('language', lang);
            this.notifyObservers();
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    t(key, defaultValue = key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value || defaultValue;
    }

    observe(callback) {
        this.observers.push(callback);
        return () => {
            const index = this.observers.indexOf(callback);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLanguage));
    }

    getLocalizedContent(content, fallback = 'es') {
        if (typeof content === 'string') return content;
        return content[this.currentLanguage] || content[fallback] || '';
    }
}

// Instancia global - se crea cuando se carga el script
window.i18n = new I18n();
