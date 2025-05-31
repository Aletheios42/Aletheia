// js/filters.js
class Filters {
    static applyFilters(posts, filters) {
        let filteredPosts = [...posts];

        // Filtro de búsqueda
        if (filters.search) {
            filteredPosts = Search.search(filteredPosts, filters.search);
        }

        // Filtro de tags
        if (filters.tags && filters.tags.length > 0) {
            filteredPosts = filteredPosts.filter(post => 
                filters.tags.some(tag => post.tags.includes(tag))
            );
        }

        // Filtro de formatos
        if (filters.formats && filters.formats.length > 0) {
            filteredPosts = filteredPosts.filter(post => 
                filters.formats.includes(post.format)
            );
        }

        // Filtro de fecha
        if (filters.date) {
            filteredPosts = Helpers.filterByDate(filteredPosts, filters.date);
        }

        // Filtro de idioma
        if (filters.language) {
            filteredPosts = filteredPosts.filter(post => 
                post.language === filters.language
            );
        }

        return filteredPosts;
    }

    static getAvailableTags(posts) {
        const tagCounts = {};
        
        posts.forEach(post => {
            post.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]) // Ordenar por frecuencia
            .map(([tag, count]) => ({ tag, count }));
    }

    static getAvailableFormats(posts) {
        const formatCounts = {};
        
        posts.forEach(post => {
            formatCounts[post.format] = (formatCounts[post.format] || 0) + 1;
        });

        return Object.entries(formatCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([format, count]) => ({ format, count }));
    }

    static getDateRanges(posts) {
        if (posts.length === 0) return {};

        const dates = posts.map(post => new Date(post.date)).sort((a, b) => b - a);
        const now = new Date();
        
        const ranges = {
            week: dates.filter(date => (now - date) <= 7 * 24 * 60 * 60 * 1000).length,
            month: dates.filter(date => (now - date) <= 30 * 24 * 60 * 60 * 1000).length,
            year: dates.filter(date => (now - date) <= 365 * 24 * 60 * 60 * 1000).length,
            all: dates.length
        };

        return ranges;
    }

    static sortPosts(posts, sortBy = 'date', order = 'desc') {
        const sorted = [...posts].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'title':
                    aValue = window.i18n.getLocalizedContent(a.title).toLowerCase();
                    bValue = window.i18n.getLocalizedContent(b.title).toLowerCase();
                    break;
                case 'readTime':
                    aValue = a.readTime || 0;
                    bValue = b.readTime || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }


    clearFilters() {
        this.currentPage = 1;

        // Limpiar controles
        const searchInputs = document.querySelectorAll('#search-input, #search-input-sidebar');
        searchInputs.forEach(input => input.value = '');
        
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) dateFilter.value = '';
        
        const checkboxes = document.querySelectorAll('#tag-filters input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        this.updateContentGrid();
        this.updateActiveFilters();
    }


    async loadText(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
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


    static getFilterSummary(filters) {
        const summary = [];

        if (filters.search) {
            summary.push(`Búsqueda: "${filters.search}"`);
        }

        if (filters.tags && filters.tags.length > 0) {
            summary.push(`Tags: ${filters.tags.join(', ')}`);
        }

        if (filters.formats && filters.formats.length > 0) {
            summary.push(`Formatos: ${filters.formats.join(', ')}`);
        }

        if (filters.date) {
            const dateLabels = {
                week: 'Última semana',
                month: 'Último mes',
                year: 'Último año'
            };
            summary.push(`Fecha: ${dateLabels[filters.date]}`);
        }

        return summary;
    }
}


    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;

        let filtersHTML = '';

        // Búsqueda
        if (this.currentFilters.search) {
            filtersHTML += `<div class="filter-chip">🔍 "${this.currentFilters.search}" <span class="remove" data-filter="search">✕</span></div>`;
        }

        // Tags
        this.currentFilters.tags.forEach(tag => {
            filtersHTML += `<div class="filter-chip">🏷️ ${tag} <span class="remove" data-filter="tag" data-value="${tag}">✕</span></div>`;
        });

        // Fecha
        if (this.currentFilters.date) {
            const dateLabel = window.i18n.t(`filters.dateOptions.${this.currentFilters.date}`);
            filtersHTML += `<div class="filter-chip">📅 ${dateLabel} <span class="remove" data-filter="date">✕</span></div>`;
        }

        activeFiltersContainer.innerHTML = filtersHTML;

        // Event listeners para remover filtros
        activeFiltersContainer.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                const value = e.target.dataset.value;
                this.removeFilter(filterType, value);
            });
        });
    }

    removeFilter(filterType, value) {
        switch(filterType) {
            case 'search':
                this.currentFilters.search = '';
                const searchInputs = document.querySelectorAll('#search-input, #search-input-sidebar');
                searchInputs.forEach(input => input.value = '');
                break;
            case 'tag':
                this.currentFilters.tags = this.currentFilters.tags.filter(t => t !== value);
                const tagCheckbox = document.querySelector(`#tag-filters input[value="${value}"]`);
                if (tagCheckbox) tagCheckbox.checked = false;
                break;
            case 'date':
                this.currentFilters.date = '';
                const dateFilter = document.getElementById('date-filter');
                if (dateFilter) dateFilter.value = '';
                break;
        }
        
        this.currentPage = 1;
        this.updateContentGrid();
        this.updateActiveFilters();
    }

    filterByDate(posts, period) {
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
}

// Inicializar la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    window.blogApp = new BlogApp();
});
