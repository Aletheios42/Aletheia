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
}
