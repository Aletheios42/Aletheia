// js/components/sidebar.js
class Sidebar {
    static updateFilters(tags, currentFilters) {
        this.updateFormatFilters(currentFilters.formats);
        this.updateTagFilters(tags, currentFilters.tags);
        this.updateDateFilter(currentFilters.date);
        this.updateTexts();
    }

    static updateFormatFilters(selectedFormats) {
        const formatFilters = document.getElementById('format-filters');
        if (!formatFilters) return;

        const formats = ['markdown', 'latex', 'notebook', 'video', 'html'];
        formatFilters.innerHTML = '';

        formats.forEach(format => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = format;
            checkbox.checked = selectedFormats.includes(format);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + window.i18n.t(`formats.${format}`)));
            formatFilters.appendChild(label);
        });
    }

    static updateTagFilters(tags, selectedTags) {
        const tagFilters = document.getElementById('tag-filters');
        if (!tagFilters) return;

        tagFilters.innerHTML = '';

        Object.keys(tags).forEach(tagKey => {
            const tag = tags[tagKey];
            if (!tag.children || tag.children.length === 0) {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tagKey;
                checkbox.checked = selectedTags.includes(tagKey);

                checkbox.addEventListener('change', (e) => {
                    if (window.blogApp) {
                        if (e.target.checked) {
                            window.blogApp.currentFilters.tags.push(tagKey);
                        } else {
                            const index = window.blogApp.currentFilters.tags.indexOf(tagKey);
                            if (index > -1) {
                                window.blogApp.currentFilters.tags.splice(index, 1);
                            }
                        }
                        window.blogApp.currentPage = 1;
                        window.blogApp.updateContentGrid();
                    }
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(' ' + window.i18n.getLocalizedContent(tag.name)));
                tagFilters.appendChild(label);
            }
        });
    }

    static updateDateFilter(selectedDate) {
        const dateFilter = document.getElementById('date-filter');
        if (!dateFilter) return;

        dateFilter.innerHTML = `
            <option value="">${window.i18n.t('filters.dateOptions.all')}</option>
            <option value="week" ${selectedDate === 'week' ? 'selected' : ''}>${window.i18n.t('filters.dateOptions.week')}</option>
            <option value="month" ${selectedDate === 'month' ? 'selected' : ''}>${window.i18n.t('filters.dateOptions.month')}</option>
            <option value="year" ${selectedDate === 'year' ? 'selected' : ''}>${window.i18n.t('filters.dateOptions.year')}</option>
        `;
    }

    static updateTexts() {
        const filterTitle = document.querySelector('.filter-section h3');
        if (filterTitle) {
            filterTitle.textContent = window.i18n.t('filters.title');
        }

        const filterGroupTitles = document.querySelectorAll('.filter-group h4');
        filterGroupTitles.forEach((title, index) => {
            switch(index) {
                case 0:
                    title.textContent = window.i18n.t('filters.format');
                    break;
                case 1:
                    title.textContent = window.i18n.t('filters.tags');
                    break;
                case 2:
                    title.textContent = window.i18n.t('filters.date');
                    break;
            }
        });

        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.textContent = window.i18n.t('filters.clear');
        }
    }
}
