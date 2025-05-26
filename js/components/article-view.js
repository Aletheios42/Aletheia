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
