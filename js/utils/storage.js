// js/utils/storage.js
class Storage {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
}

// js/utils/helpers.js
class Helpers {
    static formatDate(dateString, locale = 'es-ES') {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static truncate(text, length = 150) {
        if (text.length <= length) return text;
        return text.substr(0, length).replace(/\s+\S*$/, '') + '...';
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static getReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    static filterByDate(posts, period) {
        if (!period) return posts;
        
        const now = new Date();
        const filterDate = new Date();
        
        switch(period) {
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return posts;
        }
        
        return posts.filter(post => new Date(post.date) >= filterDate);
    }

    static highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${Helpers.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static loadJSON(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }

    static loadText(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            });
    }
}

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
