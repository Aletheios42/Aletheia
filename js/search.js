// js/search.js
class Search {
    static search(posts, query) {
        if (!query || query.trim() === '') {
            return posts;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        return posts.filter(post => {
            const searchableText = this.getSearchableText(post).toLowerCase();
            
            return searchTerms.every(term => 
                searchableText.includes(term)
            );
        });
    }

    static getSearchableText(post) {
        const title = window.i18n.getLocalizedContent(post.title);
        const description = window.i18n.getLocalizedContent(post.description);
        const tags = post.tags.join(' ');
        
        return `${title} ${description} ${tags} ${post.format}`;
    }

    static highlightMatches(text, query) {
        if (!query || query.trim() === '') {
            return text;
        }

        const searchTerms = query.trim().split(/\s+/);
        let highlightedText = text;

        searchTerms.forEach(term => {
            if (term.length > 1) {
                const regex = new RegExp(`(${Helpers.escapeRegex(term)})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
            }
        });

        return highlightedText;
    }

    static async searchInContent(posts, query) {
        if (!query || query.trim() === '') {
            return posts;
        }

        const results = [];
        
        for (const post of posts) {
            try {
                // Solo buscar en contenido de texto (markdown, latex)
                if (post.format === 'markdown' || post.format === 'latex') {
                    const content = await Helpers.loadText(post.file);
                    const searchableContent = content.toLowerCase();
                    
                    if (searchableContent.includes(query.toLowerCase())) {
                        results.push({
                            ...post,
                            contentMatch: true,
                            snippet: this.extractSnippet(content, query)
                        });
                    }
                }
            } catch (error) {
                console.warn(`Could not search in content for post ${post.id}:`, error);
            }
        }

        return results;
    }

    static extractSnippet(content, query, maxLength = 200) {
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        
        if (index === -1) {
            return content.substring(0, maxLength) + '...';
        }
        
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + maxLength);
        
        let snippet = content.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return snippet;
    }
}
