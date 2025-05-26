// main.js - Archivo principal de la aplicación
class BlogApp {
    constructor() {
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
            // Crear i18n básico si no existe
            this.setupI18n();
            
            // Inicializar i18n
            await window.i18n.init();
            
            // Cargar datos
            await this.loadData();
            
            // Configurar rutas
            this.setupRoutes();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar componentes
            this.initializeComponents();
            
            console.log('Blog initialized successfully');
        } catch (error) {
            console.error('Error initializing blog:', error);
            this.showError('Error initializing application: ' + error.message);
        }
    }

    setupI18n() {
        if (!window.i18n) {
            window.i18n = {
                currentLanguage: 'es',
                translations: {
                    es: {
                        nav: { articles: "Artículos", about: "Acerca de", contact: "Contacto", search: "Buscar..." },
                        filters: { 
                            title: "Filtros", 
                            format: "Formato",
                            tags: "Tags", 
                            date: "Fecha",
                            clear: "Limpiar filtros",
                            moreFilters: "🔽 Más filtros",
                            dateOptions: {
                                all: "Todas",
                                week: "Última semana",
                                month: "Último mes",
                                year: "Último año"
                            }
                        },
                        quickFilters: {
                            mathematics: "🏷️ Matemáticas",
                            programming: "💻 Programación",
                            dataScience: "📊 Datos",
                            physics: "🔬 Física"
                        },
                        sort: {
                            orderBy: "🔽 Ordenar por",
                            dateRecent: "📅 Fecha (reciente)",
                            dateOld: "📅 Fecha (antiguo)",
                            titleAZ: "🔤 Título A-Z",
                            titleZA: "🔤 Título Z-A",
                            readTime: "⏱️ Tiempo lectura"
                        },
                        content: { 
                            loading: "Cargando...", 
                            noResults: "Sin resultados",
                            backToList: "Volver a la lista",
                            readMore: "Leer más"
                        },
                        formats: { 
                            markdown: "Markdown", 
                            latex: "LaTeX", 
                            video: "Video", 
                            notebook: "Notebook",
                            html: "HTML"
                        }
                    },
                    en: {
                        nav: { articles: "Articles", about: "About", contact: "Contact", search: "Search..." },
                        filters: { 
                            title: "Filters", 
                            format: "Format",
                            tags: "Tags", 
                            date: "Date",
                            clear: "Clear filters",
                            moreFilters: "🔽 More filters",
                            dateOptions: {
                                all: "All",
                                week: "Last week", 
                                month: "Last month",
                                year: "Last year"
                            }
                        },
                        quickFilters: {
                            mathematics: "🏷️ Mathematics",
                            programming: "💻 Programming",
                            dataScience: "📊 Data",
                            physics: "🔬 Physics"
                        },
                        sort: {
                            orderBy: "🔽 Sort by",
                            dateRecent: "📅 Date (recent)",
                            dateOld: "📅 Date (old)",
                            titleAZ: "🔤 Title A-Z",
                            titleZA: "🔤 Title Z-A",
                            readTime: "⏱️ Read time"
                        },
                        content: { 
                            loading: "Loading...", 
                            noResults: "No results",
                            backToList: "Back to list",
                            readMore: "Read more"
                        },
                        formats: { 
                            markdown: "Markdown", 
                            latex: "LaTeX", 
                            video: "Video", 
                            notebook: "Notebook",
                            html: "HTML"
                        }
                    }
                },
                observers: [],
                
                async init() {
                    console.log('I18n initialized');
                },
                
                setLanguage(lang) {
                    if (this.translations[lang]) {
                        this.currentLanguage = lang;
                        this.notifyObservers();
                    }
                },
                
                getLanguage() {
                    return this.currentLanguage;
                },
                
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
                },
                
                observe(callback) {
                    this.observers.push(callback);
                },
                
                notifyObservers() {
                    this.observers.forEach(callback => callback(this.currentLanguage));
                },
                
                getLocalizedContent(content, fallback = 'es') {
                    if (typeof content === 'string') return content;
                    return content[this.currentLanguage] || content[fallback] || '';
                }
            };
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
            // Datos por defecto si no se puede cargar el JSON
            this.posts = [
                {
                    id: "ejemplo-markdown",
                    title: { es: "Ejemplo de Markdown", en: "Markdown Example" },
                    description: { es: "Post de ejemplo con contenido Markdown y matemáticas", en: "Example post with Markdown content and math" },
                    format: "markdown",
                    content: `# Ejemplo de Markdown

Este es un **ejemplo** de contenido Markdown con diferentes elementos.

## Lista de características

- Texto en **negrita** y *cursiva*
- Listas numeradas y con viñetas  
- Código inline: \`console.log('Hola')\`
- Enlaces y referencias

## Código JavaScript

\`\`\`javascript
function saludar(nombre) {
    return \`Hola, \${nombre}!\`;
}

const mensaje = saludar('Mundo');
console.log(mensaje);
\`\`\`

## Matemáticas con LaTeX

Fórmula inline: $f(x) = x^2 + 2x + 1$

Ecuación centrada:
$$\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

## Tabla de ejemplo

| Función | Derivada |
|---------|----------|
| $x^2$ | $2x$ |
| $\\sin x$ | $\\cos x$ |
| $e^x$ | $e^x$ |

> Este es un ejemplo de cómo el sistema puede renderizar contenido técnico complejo.`,
                    date: "2025-05-26",
                    tags: ["ejemplo", "markdown", "tutorial"],
                    language: "es",
                    readTime: 5
                }
            ];
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
            this.tags = {
                ejemplo: { name: { es: "Ejemplo", en: "Example" }, color: "#3498db" },
                markdown: { name: { es: "Markdown", en: "Markdown" }, color: "#27ae60" },
                tutorial: { name: { es: "Tutorial", en: "Tutorial" }, color: "#f39c12" },
                matematicas: { name: { es: "Matemáticas", en: "Mathematics" }, color: "#e74c3c" },
                calculo: { name: { es: "Cálculo", en: "Calculus" }, color: "#9b59b6" },
                latex: { name: { es: "LaTeX", en: "LaTeX" }, color: "#e74c3c" }
            };
        }

        console.log(`Loaded ${this.posts.length} posts and ${Object.keys(this.tags).length} tags`);
    }

    setupRoutes() {
        this.router.addRoute('/', () => this.showHome());
        this.router.addRoute('/articles', () => this.showArticles());
        this.router.addRoute('/article/:id', (params) => this.showArticle(params.id));
        this.router.addRoute('/tag/:tag', (params) => this.showTag(params.tag));
        this.router.addRoute('/about', () => this.showAbout());
        this.router.addRoute('/contact', () => this.showContact());
        this.router.addRoute('/404', () => this.showNotFound());
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

        // Búsqueda en sidebar
        const searchInputSidebar = document.getElementById('search-input-sidebar');
        if (searchInputSidebar) {
            const debouncedSearch = this.debounce((query) => {
                this.currentFilters.search = query;
                this.currentPage = 1;
                this.updateContentGrid();
                this.updateActiveFilters();
            }, 300);

            searchInputSidebar.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

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

        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.toggleQuickFilter(category);
            });
        });

        // Toggle más filtros
        const toggleFilters = document.getElementById('toggle-filters');
        const expandedFilters = document.getElementById('expanded-filters');
        if (toggleFilters && expandedFilters) {
            toggleFilters.addEventListener('click', () => {
                expandedFilters.classList.toggle('hidden');
                toggleFilters.textContent = expandedFilters.classList.contains('hidden') 
                    ? window.i18n.t('filters.moreFilters')
                    : '🔼 ' + window.i18n.t('filters.lessFilters', 'Menos filtros');
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

    // Métodos de interfaz
    updateLanguage() {
        const currentLang = window.i18n.getLanguage();
        document.documentElement.lang = currentLang;
        
        // Actualizar botón de idioma
        const currentLangSpan = document.getElementById('current-lang');
        if (currentLangSpan) {
            currentLangSpan.textContent = currentLang.toUpperCase();
        }

        // Actualizar opciones activas
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === currentLang);
        });
        
        // Actualizar navbar
        this.updateNavbarTexts();
        
        // Actualizar sidebar
        this.updateSidebarTexts();
        
        // Actualizar grid
        this.updateContentGrid();
    }

    updateNavbarTexts() {
        // Actualizar enlaces de navegación
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });

        // Actualizar placeholder de búsqueda
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const placeholderKey = searchInput.getAttribute('data-i18n-placeholder');
            if (placeholderKey) {
                searchInput.placeholder = window.i18n.t(placeholderKey);
            }
        }
    }

    updateSidebarTexts() {
        // Actualizar títulos de filtros
        document.querySelectorAll('.filter-section [data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });

        // Actualizar opciones de fecha
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            const selectedValue = dateFilter.value;
            dateFilter.innerHTML = `
                <option value="">${window.i18n.t('filters.dateOptions.all')}</option>
                <option value="week">${window.i18n.t('filters.dateOptions.week')}</option>
                <option value="month">${window.i18n.t('filters.dateOptions.month')}</option>
                <option value="year">${window.i18n.t('filters.dateOptions.year')}</option>
            `;
            dateFilter.value = selectedValue;
        }

        // Re-generar filtros de tags para actualizar textos
        this.updateTagFilters();
    }

    clearFilters() {
        this.currentFilters = {
            search: '',
            tags: [],
            categories: [],
            date: ''
        };
        this.currentPage = 1;

        // Limpiar controles
        const searchInputs = document.querySelectorAll('#search-input, #search-input-sidebar');
        searchInputs.forEach(input => input.value = '');
        
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) dateFilter.value = '';
        
        const checkboxes = document.querySelectorAll('#tag-filters input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        const quickFilters = document.querySelectorAll('.quick-filter-btn');
        quickFilters.forEach(btn => btn.classList.remove('active'));

        this.updateContentGrid();
        this.updateActiveFilters();
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

    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'content-card fade-in';
        card.dataset.postId = post.id;

        const title = window.i18n.getLocalizedContent(post.title);
        const description = window.i18n.getLocalizedContent(post.description);
        const formattedDate = new Date(post.date).toLocaleDateString(
            window.i18n.getLanguage() === 'es' ? 'es-ES' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
        );

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${this.escapeHtml(title)}</h3>
                    <div class="card-meta">
                        <span class="card-date">${formattedDate}</span>
                        ${post.readTime ? `<span>${post.readTime} min</span>` : ''}
                    </div>
                </div>
                <span class="card-format ${post.format}">${window.i18n.t(`formats.${post.format}`)}</span>
            </div>
            <p class="card-description">${this.escapeHtml(description)}</p>
            <div class="card-tags">
                ${post.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
        `;

        // Eventos
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tag')) {
                this.router.navigate(`/article/${post.id}`);
            }
        });

        // Eventos para tags
        card.querySelectorAll('.tag').forEach(tagEl => {
            tagEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.router.navigate(`/tag/${e.target.dataset.tag}`);
            });
        });

        return card;
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

    showContentGrid() {
        const contentGrid = document.getElementById('content-grid');
        const articleView = document.getElementById('article-view');
        
        if (contentGrid) contentGrid.style.display = 'grid';
        if (articleView) articleView.style.display = 'none';
    }

    hideContentGrid() {
        const contentGrid = document.getElementById('content-grid');
        if (contentGrid) contentGrid.style.display = 'none';
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

    async renderContent(content, format) {
        console.log('=== RENDER CONTENT DEBUG ===');
        console.log('Format:', format);
        console.log('Content type:', typeof content);
        console.log('Content preview:', content);
        
        switch (format) {
            case 'markdown':
                return await this.renderMarkdown(content);
            case 'latex':
                return await this.renderLaTeX(content);
            case 'notebook':
                console.log('Processing notebook...');
                // Verificar si NotebookRenderer está disponible
                if (typeof NotebookRenderer !== 'undefined') {
                    console.log('NotebookRenderer available');
                    // Si el content es un objeto, pasarlo directamente
                    // Si es string, intentar parsearlo
                    let notebookData = content;
                    if (typeof content === 'string') {
                        console.log('Content is string, attempting to parse JSON');
                        try {
                            notebookData = JSON.parse(content);
                            console.log('JSON parsed successfully');
                        } catch (e) {
                            console.error('Error parsing notebook JSON:', e);
                            return `<p>Error: No se pudo procesar el notebook JSON: ${e.message}</p>`;
                        }
                    } else {
                        console.log('Content is already an object');
                    }
                    console.log('Calling NotebookRenderer.render...');
                    try {
                        const result = await NotebookRenderer.render(notebookData);
                        console.log('NotebookRenderer.render completed successfully');
                        return result;
                    } catch (e) {
                        console.error('Error in NotebookRenderer.render:', e);
                        return `<p>Error en el renderizado del notebook: ${e.message}</p>`;
                    }
                } else {
                    console.error('NotebookRenderer not available');
                    return `<p>Error: NotebookRenderer no está disponible</p>`;
                }
            case 'video':
                return this.renderVideo(content);
            case 'html':
                return content;
            default:
                console.log('Using fallback renderer');
                const displayContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
                return `<pre>${this.escapeHtml(displayContent)}</pre>`;
        }
    }

    async renderMarkdown(content) {
        console.log('Rendering markdown, marked available:', typeof marked !== 'undefined');
        try {
            // Configurar marked si está disponible
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    breaks: true,
                    gfm: true
                });
                let html = marked.parse(content);
                console.log('Markdown parsed, length:', html.length);
                
                // Procesar matemáticas si KaTeX está disponible
                if (typeof katex !== 'undefined') {
                    console.log('Processing math with KaTeX');
                    html = this.processMath(html);
                }
                
                return html;
            } else {
                console.log('Marked not available, using fallback');
                // Fallback básico si marked no está disponible
                return this.basicMarkdownFallback(content);
            }
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<p>Error rendering content: ${error.message}</p>`;
        }
    }

    basicMarkdownFallback(content) {
        // Procesamiento básico de markdown
        let html = content
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return `<div class="markdown-content"><p>${html}</p></div>`;
    }

    processMath(html) {
        if (typeof katex === 'undefined') {
            console.log('KaTeX not available');
            return html;
        }
        
        try {
            console.log('Processing math with KaTeX');
            // Matemáticas display
            html = html.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: true });
                } catch (e) {
                    console.warn('KaTeX error for display math:', e);
                    return match;
                }
            });

            // Matemáticas inline
            html = html.replace(/\$([^$]+)\$/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: false });
                } catch (e) {
                    console.warn('KaTeX error for inline math:', e);
                    return match;
                }
            });
        } catch (error) {
            console.error('Error processing math:', error);
        }
        
        return html;
    }

    async renderLaTeX(content) {
        try {
            console.log('Rendering LaTeX content');
            // Procesar comandos LaTeX básicos
            let processed = content
                .replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>')
                .replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>')
                .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
                .replace(/\\begin\{align\}/g, '')
                .replace(/\\end\{align\}/g, '')
                .replace(/\\\\/g, '<br>')
                .replace(/\n\s*\n/g, '</p><p>');

            // Procesar matemáticas si KaTeX está disponible
            if (typeof katex !== 'undefined') {
                processed = this.processLaTeXMath(processed);
            }
            
            return `<div class="latex-content"><p>${processed}</p></div>`;
        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            return `<p>Error rendering LaTeX: ${error.message}</p>`;
        }
    }

    processLaTeXMath(content) {
        try {
            // Matemáticas display con \[ \]
            content = content.replace(/\\\[([^\\]*?)\\\]/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: true });
                } catch (e) {
                    console.warn('KaTeX error for LaTeX display math:', e);
                    return match;
                }
            });

            // Matemáticas inline con $ $
            content = content.replace(/\$([^$]+)\$/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: false });
                } catch (e) {
                    console.warn('KaTeX error for LaTeX inline math:', e);
                    return match;
                }
            });
        } catch (error) {
            console.error('Error processing LaTeX math:', error);
        }
        
        return content;
    }

    renderVideo(url) {
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

    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    updateTagFilters() {
        // Implementación básica de filtros de tags
        const tagFilters = document.getElementById('tag-filters');
        if (!tagFilters) return;

        tagFilters.innerHTML = '';

        Object.keys(this.tags).forEach(tagKey => {
            const tag = this.tags[tagKey];
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tagKey;
            checkbox.checked = this.currentFilters.tags.includes(tagKey);

            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentFilters.tags.push(tagKey);
                } else {
                    const index = this.currentFilters.tags.indexOf(tagKey);
                    if (index > -1) {
                        this.currentFilters.tags.splice(index, 1);
                    }
                }
                this.currentPage = 1;
                this.updateContentGrid();
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + window.i18n.getLocalizedContent(tag.name)));
            tagFilters.appendChild(label);
        });
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

    // Métodos para nueva funcionalidad
    getPostCategories(post) {
        const categories = [];
        
        // Mapear tags a categorías
        if (post.tags.some(tag => ['calculus', 'algebra', 'statistics', 'mathematics'].includes(tag))) {
            categories.push('mathematics');
        }
        if (post.tags.some(tag => ['javascript', 'python', 'programming', 'algorithms'].includes(tag))) {
            categories.push('programming');
        }
        if (post.tags.some(tag => ['data-science', 'machine-learning', 'analysis'].includes(tag))) {
            categories.push('data-science');
        }
        if (post.tags.some(tag => ['physics', 'mechanics', 'quantum'].includes(tag))) {
            categories.push('physics');
        }
        
        return categories;
    }

    toggleQuickFilter(category) {
        const btn = document.querySelector(`[data-category="${category}"]`);
        
        if (this.currentFilters.categories.includes(category)) {
            // Remover categoría
            this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== category);
            btn.classList.remove('active');
        } else {
            // Agregar categoría
            this.currentFilters.categories.push(category);
            btn.classList.add('active');
        }
        
        this.currentPage = 1;
        this.updateContentGrid();
        this.updateActiveFilters();
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

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;

        let filtersHTML = '';

        // Búsqueda
        if (this.currentFilters.search) {
            filtersHTML += `<div class="filter-chip">🔍 "${this.currentFilters.search}" <span class="remove" data-filter="search">✕</span></div>`;
        }

        // Categorías
        this.currentFilters.categories.forEach(category => {
            const label = window.i18n.t(`quickFilters.${category}`);
            filtersHTML += `<div class="filter-chip">${label} <span class="remove" data-filter="category" data-value="${category}">✕</span></div>`;
        });

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
            case 'category':
                this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== value);
                document.querySelector(`[data-category="${value}"]`).classList.remove('active');
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
}

// Inicializar la aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    window.blogApp = new BlogApp();
});
