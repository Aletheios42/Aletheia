// js/renderers/markdown.js
class MarkdownRenderer {
    static async render(content) {
        try {
            // Configurar marked
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                highlight: function(code, lang) {
                    return `<pre><code class="language-${lang}">${Helpers.escapeHtml(code)}</code></pre>`;
                }
            });

            const html = marked.parse(content);
            return this.processMath(html);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<p>Error rendering content: ${error.message}</p>`;
        }
    }

    static processMath(html) {
        // Procesar matemáticas inline y display
        return html
            .replace(/\$\$([^$]+)\$\$/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: true });
                } catch (e) {
                    return match;
                }
            })
            .replace(/\$([^$]+)\$/g, (match, math) => {
                try {
                    return katex.renderToString(math, { displayMode: false });
                } catch (e) {
                    return match;
                }
            });
    }
}
