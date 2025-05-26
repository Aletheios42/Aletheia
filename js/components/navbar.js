// js/components/navbar.js
class Navbar {
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
}

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

// js/components/content-grid.js
class ContentGrid {
    static show() {
        const contentGrid = document.getElementById('content-grid');
        const articleView = document.getElementById('article-view');
        
        if (contentGrid) contentGrid.style.display = 'grid';
        if (articleView) articleView.style.display = 'none';
    }

    static hide() {
        const contentGrid = document.getElementById('content-grid');
        if (contentGrid) contentGrid.style.display = 'none';
    }

    static render(posts, currentPage, postsPerPage) {
        const contentGrid = document.getElementById('content-grid');
        if (!contentGrid) return;

        if (posts.length === 0) {
            contentGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>${window.i18n.t('content.noResults')}</h3>
                    <p>No se encontraron artículos que coincidan con los filtros.</p>
                </div>
            `;
            return;
        }

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        contentGrid.innerHTML = '';

        paginatedPosts.forEach(post => {
            const card = this.createPostCard(post);
            contentGrid.appendChild(card);
        });

        this.updatePagination(posts.length, currentPage, postsPerPage);
    }

    static createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'content-card fade-in';
        card.dataset.postId = post.id;

        const title = window.i18n.getLocalizedContent(post.title);
        const description = window.i18n.getLocalizedContent(post.description);
        const formattedDate = Helpers.formatDate(post.date, window.i18n.getLanguage() === 'es' ? 'es-ES' : 'en-US');

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${Helpers.escapeHtml(title)}</h3>
                    <div class="card-meta">
                        <span class="card-date">${formattedDate}</span>
                        ${post.readTime ? `<span>${post.readTime} min</span>` : ''}
                    </div>
                </div>
                <span class="card-format ${post.format}">${window.i18n.t(`formats.${post.format}`)}</span>
            </div>
            <p class="card-description">${Helpers.escapeHtml(description)}</p>
            <div class="card-tags">
                ${post.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
        `;

        // Eventos
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tag')) {
                window.blogApp.router.navigate(`/article/${post.id}`);
            }
        });

        // Eventos para tags
        card.querySelectorAll('.tag').forEach(tagEl => {
            tagEl.addEventListener('click', (e) => {
                e.stopPropagation();
                window.blogApp.router.navigate(`/tag/${e.target.dataset.tag}`);
            });
        });

        return card;
    }

    static updatePagination(totalPosts, currentPage, postsPerPage) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalPosts / postsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Botón anterior
        html += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">←</button>`;

        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += '<span>...</span>';
            }
        }

        // Botón siguiente
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">→</button>`;

        pagination.innerHTML = html;

        // Eventos
        pagination.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (page && window.blogApp) {
                    window.blogApp.currentPage = page;
                    window.blogApp.updateContentGrid();
                    window.scrollTo(0, 0);
                }
            }
        });
    }
}

// js/components/article-view.js
class ArticleView {
    static async show(post) {
        const articleView = document.getElementById('article-view');
        const contentGrid = document.getElementById('content-grid');
        
        if (contentGrid) contentGrid.style.display = 'none';
        if (!articleView) return;

        articleView.style.display = 'block';
        articleView.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                ${window.i18n.t('content.loading')}
            </div>
        `;

        try {
            const content = await this.loadPostContent(post);
            const renderedContent = await this.renderContent(content, post.format);
            
            articleView.innerHTML = this.createArticleHTML(post, renderedContent);
            this.setupArticleEvents(post);
            
        } catch (error) {
            console.error('Error loading article:', error);
            articleView.innerHTML = `
                <div class="empty-state">
                    <h3>Error</h3>
                    <p>No se pudo cargar el artículo: ${error.message}</p>
                    <button onclick="window.blogApp.router.navigate('/articles')" class="nav-button">
                        ${window.i18n.t('content.backToList')}
                    </button>
                </div>
            `;
        }
    }

    static async loadPostContent(post) {
        // Si el contenido está embebido en el post, usarlo directamente
        if (post.content) {
            return post.content;
        }
        
        // Si es video, manejar de forma especial  
        if (post.format === 'video') {
            return post.file || post.content; // URL o ID de video
        }
        
        // Intentar cargar desde archivo
        try {
            return await Helpers.loadText(post.file);
        } catch (error) {
            console.warn(`Could not load file ${post.file}, using embedded content`);
            return post.content || `Error: No se pudo cargar el contenido del post "${post.id}"`;
        }
    }

    static async renderContent(content, format) {
        switch (format) {
            case 'markdown':
                return await MarkdownRenderer.render(content);
            case 'latex':
                return await LaTeXRenderer.render(content);
            case 'notebook':
                return await NotebookRenderer.render(content);
            case 'video':
                return this.renderVideo(content);
            case 'html':
                return content;
            default:
                return `<pre>${Helpers.escapeHtml(content)}</pre>`;
        }
    }

    static renderVideo(url) {
        // Detectar tipo de video
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            return `
                <div class="video-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        } else {
            // Video local
            return `
                <div class="video-container">
                    <video controls>
                        <source src="${url}" type="video/mp4">
                        Tu navegador no soporta el elemento video.
                    </video>
                </div>
            `;
        }
    }

    static extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    static createArticleHTML(post, renderedContent) {
        const title = window.i18n.getLocalizedContent(post.title);
        const formattedDate = Helpers.formatDate(post.date, window.i18n.getLanguage() === 'es' ? 'es-ES' : 'en-US');

        return `
            <div class="article-header">
                <h1 class="article-title">${Helpers.escapeHtml(title)}</h1>
                <div class="article-meta">
                    <div class="article-date">📅 ${formattedDate}</div>
                    <div class="article-format ${post.format}">${window.i18n.t(`formats.${post.format}`)}</div>
                </div>
            </div>
            
            <div class="article-content rendered-content">
                ${renderedContent}
            </div>
            
            <div class="article-tags">
                <h4>Tags:</h4>
                ${post.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
            
            <div class="article-nav">
                <button class="nav-button secondary" onclick="window.blogApp.router.navigate('/articles')">
                    ← ${window.i18n.t('content.backToList')}
                </button>
                <div>
                    ${this.getNavigationButtons(post)}
                </div>
            </div>
        `;
    }

    static getNavigationButtons(currentPost) {
        if (!window.blogApp || !window.blogApp.posts) return '';

        const posts = window.blogApp.posts;
        const currentIndex = posts.findIndex(p => p.id === currentPost.id);
        
        let html = '';
        
        if (currentIndex > 0) {
            const prevPost = posts[currentIndex - 1];
            html += `<a href="#/article/${prevPost.id}" class="nav-button secondary">← ${window.i18n.t('content.previousPost')}</a>`;
        }
        
        if (currentIndex < posts.length - 1) {
            const nextPost = posts[currentIndex + 1];
            html += `<a href="#/article/${nextPost.id}" class="nav-button">${window.i18n.t('content.nextPost')} →</a>`;
        }
        
        return html;
    }

    static setupArticleEvents(post) {
        // Eventos para tags
        document.querySelectorAll('.article-tags .tag').forEach(tagEl => {
            tagEl.addEventListener('click', (e) => {
                window.blogApp.router.navigate(`/tag/${e.target.dataset.tag}`);
            });
        });

        // Scroll suave para enlaces internos
        document.querySelectorAll('.article-content a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}
