// main.js - Archivo principal de la aplicación
import I18n from './utils/i18n.js';

class BlogApp {
    constructor() {
        window.i18n = new I18n();

        this.router = new Router();
        this.posts = [];
        this.tags = {};
        this.config = {};
        this.currentFilters = {
            search: '',
            tags: [],
            categories: [],
            date: ''
        };
        this.currentSort = {
            by: 'date',
            order: 'desc'
        };
        this.currentPage = 1;
        this.postsPerPage = 9;
        
        this.initializeApp();
    }

    async initializeApp() {

        try {
            // AÑADE ESTA LÍNEA AL INICIO:
            await window.i18n.init();

            // Cargar datos
            await this.loadData();
            
            // Configurar rutas
            this.setupRoutes();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar componentes
            this.initializeComponents();
            
            // Inicializar Navbar después de i18n
            Navbar.init();

            console.log('Blog initialized successfully');
        } catch (error) {
            console.error('Error initializing blog:', error);
            this.showError('Error initializing application: ' + error.message);
        }
    }

    async loadData() {
        try {
            // Intentar cargar posts desde JSON
            const response = await fetch('data/posts.json');
            if (response.ok) {
                const postsData = await response.json();
                this.posts = postsData.posts || [];
                console.log(`Loaded ${this.posts.length} posts from JSON`);
            } else {
                throw new Error('Could not load posts.json');
            }
        } catch (error) {
            console.log('No posts.json found, using default data');
        }

        try {
            // Intentar cargar tags desde JSON
            const response = await fetch('data/tags.json');
            if (response.ok) {
                this.tags = await response.json();
            } else {
                throw new Error('Could not load tags.json');
            }
        } catch (error) {
            console.log('No tags.json found, using default tags');
        }
        console.log(`Loaded ${this.posts.length} posts and ${Object.keys(this.tags).length} tags`);
    }

    setupEventListeners() {
        // Navegación
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('href') || link.dataset.route;
                this.router.navigate(route);
            }
        });

        // Búsqueda original (sincronizar)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = this.debounce((query) => {
                this.currentFilters.search = query;
                this.currentPage = 1;
                // Sincronizar con sidebar
                if (searchInputSidebar) searchInputSidebar.value = query;
                this.updateContentGrid();
                this.updateActiveFilters();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Dropdown de idioma
        const langToggle = document.getElementById('lang-toggle');
        const langDropdown = document.getElementById('lang-dropdown');
        
        if (langToggle && langDropdown) {
            langToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('hidden');
                langToggle.classList.toggle('open');
            });

            langDropdown.addEventListener('click', (e) => {
                const option = e.target.closest('.lang-option');
                if (option) {
                    const newLang = option.dataset.lang;
                    window.i18n.setLanguage(newLang);
                    langDropdown.classList.add('hidden');
                    langToggle.classList.remove('open');
                }
            });

            document.addEventListener('click', () => {
                langDropdown.classList.add('hidden');
                langToggle.classList.remove('open');
            });
        }

        // Sort dropdown
        const sortToggle = document.getElementById('sort-toggle');
        const sortOptions = document.getElementById('sort-options');
        if (sortToggle && sortOptions) {
            sortToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sortOptions.classList.toggle('hidden');
            });

            sortOptions.addEventListener('click', (e) => {
                const option = e.target.closest('.sort-option');
                if (option) {
                    const sortBy = option.dataset.sort;
                    const order = option.dataset.order;
                    this.updateSort(sortBy, order);
                    sortOptions.classList.add('hidden');
                }
            });

            document.addEventListener('click', () => {
                sortOptions.classList.add('hidden');
            });
        }

        // Filtros
        this.setupFilterListeners();
    }

    setupFilterListeners() {
        // Filtro de fecha
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilters.date = e.target.value;
                this.currentPage = 1;
                this.updateContentGrid();
                this.updateActiveFilters();
            });
        }

        // Limpiar filtros
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    initializeComponents() {
        this.updateLanguage();
        this.updateContentGrid();
        this.updateTagFilters();
    }

    // Rutas
    showHome() {
        this.updateBreadcrumbs([]);
        this.showContentGrid();
        this.updateActiveNavigation('/');
    }

    showArticles() {
        this.updateBreadcrumbs([
            { text: window.i18n.t('nav.articles'), url: '#/articles' }
        ]);
        this.showContentGrid();
        this.updateActiveNavigation('/articles');
    }

    async showArticle(id) {
        console.log('Showing article:', id);
        const post = this.posts.find(p => p.id === id);
        if (!post) {
            console.log('Post not found:', id);
            this.showNotFound();
            return;
        }

        console.log('Found post:', post);

        this.updateBreadcrumbs([
            { text: window.i18n.t('nav.articles'), url: '#/articles' },
            { text: window.i18n.getLocalizedContent(post.title) }
        ]);

        this.hideContentGrid();
        await this.showArticleView(post);
    }

    showTag(tag) {
        this.currentFilters.tags = [tag];
        this.currentPage = 1;
        this.updateBreadcrumbs([
            { text: window.i18n.t('nav.articles'), url: '#/articles' },
            { text: `Tag: ${tag}` }
        ]);
        this.showContentGrid();
        this.updateContentGrid();
    }

    async showAbout() {
        this.updateBreadcrumbs([
            { text: window.i18n.t('nav.about'), url: '#/about' }
        ]);
        this.hideContentGrid();
        await this.showStaticPage('content/pages/about.md');
        this.updateActiveNavigation('/about');
    }

    async showContact() {
        this.updateBreadcrumbs([
            { text: window.i18n.t('nav.contact'), url: '#/contact' }
        ]);
        this.hideContentGrid();
        await this.showStaticPage('content/pages/contact.md');
        this.updateActiveNavigation('/contact');
    }

    async showStaticPage(filePath) {
        const articleView = document.getElementById('article-view');
        if (!articleView) return;

        articleView.style.display = 'block';
        articleView.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                ${window.i18n.t('content.loading')}
            </div>
        `;

        try {
            const content = await this.loadText(filePath);
            const renderedContent = await this.renderMarkdown(content);
            
            articleView.innerHTML = `
                <div class="article-content rendered-content">
                    ${renderedContent}
                </div>
                
                <div class="article-nav">
                    <button class="nav-button secondary" onclick="window.blogApp.router.navigate('/articles')">
                        ← ${window.i18n.t('content.backToList')}
                    </button>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading static page:', error);
            articleView.innerHTML = `
                <div class="empty-state">
                    <h3>Error</h3>
                    <p>No se pudo cargar la página: ${error.message}</p>
                    <button onclick="window.blogApp.router.navigate('/articles')" class="nav-button">
                        ${window.i18n.t('content.backToList')}
                    </button>
                </div>
            `;
        }
    }

    showNotFound() {
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="empty-state">
                    <h2>404 - Página no encontrada</h2>
                    <p>La página que buscas no existe.</p>
                    <a href="#/" class="nav-button">Volver al inicio</a>
                </div>
            `;
        }
    }




    showError(message) {
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="empty-state">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    updateActiveNavigation(route) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + route) {
                link.classList.add('active');
            }
        });
    }

    updateContentGrid() {
        // Implementación básica de filtros
        let filteredPosts = [...this.posts];

        // Filtro de búsqueda
        if (this.currentFilters.search) {
            const query = this.currentFilters.search.toLowerCase();
            filteredPosts = filteredPosts.filter(post => {
                const title = window.i18n.getLocalizedContent(post.title).toLowerCase();
                const description = window.i18n.getLocalizedContent(post.description).toLowerCase();
                const tags = post.tags.join(' ').toLowerCase();
                return title.includes(query) || description.includes(query) || tags.includes(query);
            });
        }

        // Filtro de categorías (quick filters)
        if (this.currentFilters.categories && this.currentFilters.categories.length > 0) {
            filteredPosts = filteredPosts.filter(post => {
                return this.currentFilters.categories.some(category => {
                    return this.getPostCategories(post).includes(category);
                });
            });
        }

        // Filtro de tags
        if (this.currentFilters.tags && this.currentFilters.tags.length > 0) {
            filteredPosts = filteredPosts.filter(post => 
                this.currentFilters.tags.some(tag => post.tags.includes(tag))
            );
        }

        // Filtro de fecha
        if (this.currentFilters.date) {
            filteredPosts = this.filterByDate(filteredPosts, this.currentFilters.date);
        }

        // Aplicar ordenamiento
        filteredPosts = this.sortPosts(filteredPosts, this.currentSort.by, this.currentSort.order);
        
        this.renderContentGrid(filteredPosts);
    }

    renderContentGrid(posts) {
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

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        contentGrid.innerHTML = '';

        paginatedPosts.forEach(post => {
            const card = this.createPostCard(post);
            contentGrid.appendChild(card);
        });
    }


    updateBreadcrumbs(breadcrumbs) {
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        if (!breadcrumbsEl) return;

        if (breadcrumbs.length === 0) {
            breadcrumbsEl.innerHTML = '';
            return;
        }

        const html = breadcrumbs.map((crumb, index) => {
            if (crumb.url) {
                return `<a href="${crumb.url}">${crumb.text}</a>`;
            } else {
                return `<span>${crumb.text}</span>`;
            }
        }).join(' / ');

        breadcrumbsEl.innerHTML = html;
    }


    async showArticleView(post) {
        console.log('Rendering article view for:', post);
        const articleView = document.getElementById('article-view');
        const contentGrid = document.getElementById('content-grid');
        
        if (contentGrid) contentGrid.style.display = 'none';
        if (!articleView) {
            console.error('Article view element not found');
            return;
        }

        articleView.style.display = 'block';
        articleView.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                ${window.i18n.t('content.loading')}
            </div>
        `;

        try {
            console.log('Rendering content for format:', post.format);
            console.log('Content type:', typeof post.content);
            const renderedContent = await this.renderContent(post.content, post.format);
            console.log('Content rendered successfully');
            
            const title = window.i18n.getLocalizedContent(post.title);
            const formattedDate = new Date(post.date).toLocaleDateString(
                window.i18n.getLanguage() === 'es' ? 'es-ES' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
            );
            
            articleView.innerHTML = `
                <div class="article-header">
                    <h1 class="article-title">${this.escapeHtml(title)}</h1>
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
                </div>
            `;

            // Eventos para tags del artículo
            articleView.querySelectorAll('.tag').forEach(tagEl => {
                tagEl.addEventListener('click', (e) => {
                    this.router.navigate(`/tag/${e.target.dataset.tag}`);
                });
            });
            
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

    updateSort(sortBy, order) {
        this.currentSort = { by: sortBy, order };
        
        // Actualizar UI
        document.querySelectorAll('.sort-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-sort="${sortBy}"][data-order="${order}"]`).classList.add('active');
        
        this.updateContentGrid();
    }

    sortPosts(posts, sortBy, order) {
        return [...posts].sort((a, b) => {
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
    }
}
