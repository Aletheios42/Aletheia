// js/utils/i18n.js
export class I18n {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {};
        this.observers = [];
    }

    async init() {
        try {
            const response = await fetch('config/languages.json');
            this.translations = await response.json();
            console.log('i18n Initialized');
        } catch (error) {
            console.log('Error i18n', error);
            this.translations = {
                es: {},
                en: {}
            };
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.notifyObservers();
            return true;
        }
        return false;
    }

    getLanguage() {
        return this.currentLanguage;
    }

    translate(key, defaultValue = key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        return value !== undefined ? value : defaultValue;
    }

    getLocalizedContent(content) {
        if (typeof content === 'string')
            return content;
        return content[this.currentLanguage] || content.es || '';
    }

    observe(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(cb => cb(this.currentLanguage));
    }
}
