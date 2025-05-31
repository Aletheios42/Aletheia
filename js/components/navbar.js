// js/components/navbar.js
class Navbar {
    static init() {
        // Actualizar textos al cargar
        this.updateNavbarTexts();
        
        // Configurar eventos de idioma
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const currentLang = window.i18n.getLanguage();
                const newLang = currentLang === 'es' ? 'en' : 'es';
                window.i18n.setLanguage(newLang);
            });
        }
    }

    static updateLanguageButton() {
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            const currentLang = window.i18n.getLanguage();
            langBtn.textContent = currentLang.toUpperCase() + '/' + (currentLang === 'es' ? 'EN' : 'ES');
        }
    }

    static updateSearchPlaceholder() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = window.i18n.t('nav.search');
        }
    }

    static updateNavbarTexts() {
        // 1. Actualizar enlaces de navegación
        document.querySelectorAll('.nav-links a[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });

        // 2. Actualizar placeholder de búsqueda
        this.updateSearchPlaceholder();
        
        // 3. Actualizar botón de idioma
        this.updateLanguageButton();
        
        // 4. Actualizar opciones de ordenación
        document.querySelectorAll('.sort-option[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });
    }
}
