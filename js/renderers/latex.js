// js/renderers/latex.js
class LaTeXRenderer {
    static async render(content) {
        try {
            // Extraer el contenido del documento LaTeX
            const bodyMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
            const bodyContent = bodyMatch ? bodyMatch[1] : content;

            // Procesar comandos LaTeX básicos
            let processed = this.processBasicCommands(bodyContent);
            
            // Renderizar matemáticas
            processed = this.renderMath(processed);
            
            // Convertir a HTML
            return this.convertToHTML(processed);
        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            return `<p>Error rendering LaTeX: ${error.message}</p>`;
        }
    }

    static processBasicCommands(content) {
        return content
            // Secciones
            .replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>')
            .replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>')
            .replace(/\\subsubsection\{([^}]+)\}/g, '<h4>$1</h4>')
            
            // Texto
            .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
            .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
            .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
            
            // Listas
            .replace(/\\begin\{itemize\}/g, '<ul>')
            .replace(/\\end\{itemize\}/g, '</ul>')
            .replace(/\\begin\{enumerate\}/g, '<ol>')
            .replace(/\\end\{enumerate\}/g, '</ol>')
            .replace(/\\item\s*/g, '<li>')
            
            // Párrafos
            .replace(/\n\s*\n/g, '</p><p>')
            
            // Código
            .replace(/\\verb\|([^|]+)\|/g, '<code>$1</code>')
            .replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>');
    }

    static renderMath(content) {
        // Matemáticas display
        content = content.replace(/\\\[([^\\]*?)\\\]/g, (match, math) => {
            try {
                return katex.renderToString(math, { displayMode: true });
            } catch (e) {
                return match;
            }
        });

        // Matemáticas inline
        content = content.replace(/\\\(([^\\]*?)\\\)/g, (match, math) => {
            try {
                return katex.renderToString(math, { displayMode: false });
            } catch (e) {
                return match;
            }
        });

        // Entornos matemáticos
        content = content.replace(/\\begin\{(equation|align|gather)\}([^\\]*?)\\end\{\1\}/g, (match, env, math) => {
            try {
                return katex.renderToString(math, { displayMode: true });
            } catch (e) {
                return match;
            }
        });

        return content;
    }

    static convertToHTML(content) {
        // Envolver en párrafos
        const paragraphs = content.split('</p><p>');
        let html = '<div class="latex-content">';
        
        for (let para of paragraphs) {
            if (para.trim()) {
                if (!para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<ol')) {
                    html += `<p>${para}</p>`;
                } else {
                    html += para;
                }
            }
        }
        
        html += '</div>';
        return html;
    }
}
