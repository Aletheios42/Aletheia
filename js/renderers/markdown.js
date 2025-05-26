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

// js/renderers/notebook.js
class NotebookRenderer {
    static async render(content) {
        try {
            const notebook = typeof content === 'string' ? JSON.parse(content) : content;
            
            let html = '<div class="notebook-container">';
            
            if (notebook.cells) {
                for (let i = 0; i < notebook.cells.length; i++) {
                    const cell = notebook.cells[i];
                    html += await this.renderCell(cell, i);
                }
            }
            
            html += '</div>';
            return html;
        } catch (error) {
            console.error('Error rendering notebook:', error);
            return `<p>Error rendering notebook: ${error.message}</p>`;
        }
    }

    static async renderCell(cell, index) {
        const cellType = cell.cell_type;
        let html = `<div class="notebook-cell cell-${cellType}" data-cell="${index}">`;
        
        switch (cellType) {
            case 'code':
                html += await this.renderCodeCell(cell);
                break;
            case 'markdown':
                html += await this.renderMarkdownCell(cell);
                break;
            case 'raw':
                html += this.renderRawCell(cell);
                break;
            default:
                html += `<div class="cell-unknown">Unknown cell type: ${cellType}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    static async renderCodeCell(cell) {
        let html = '<div class="cell-input">';
        html += `<div class="cell-prompt">In [${cell.execution_count || ' '}]:</div>`;
        html += '<div class="cell-code">';
        html += `<pre><code class="language-python">${Helpers.escapeHtml(cell.source.join(''))}</code></pre>`;
        html += '</div></div>';

        if (cell.outputs && cell.outputs.length > 0) {
            html += '<div class="cell-output">';
            html += '<div class="cell-prompt">Out:</div>';
            html += '<div class="cell-output-content">';
            
            for (const output of cell.outputs) {
                html += this.renderOutput(output);
            }
            
            html += '</div></div>';
        }

        return html;
    }

    static async renderMarkdownCell(cell) {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        const rendered = await MarkdownRenderer.render(source);
        return `<div class="cell-markdown">${rendered}</div>`;
    }

    static renderRawCell(cell) {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        return `<div class="cell-raw"><pre>${Helpers.escapeHtml(source)}</pre></div>`;
    }

    static renderOutput(output) {
        let html = '';
        
        switch (output.output_type) {
            case 'stream':
                html += `<pre class="output-stream output-${output.name}">${Helpers.escapeHtml(output.text.join(''))}</pre>`;
                break;
            case 'display_data':
            case 'execute_result':
                if (output.data) {
                    if (output.data['text/html']) {
                        html += `<div class="output-html">${output.data['text/html'].join('')}</div>`;
                    } else if (output.data['image/png']) {
                        html += `<img class="output-image" src="data:image/png;base64,${output.data['image/png']}" alt="Output image">`;
                    } else if (output.data['text/plain']) {
                        html += `<pre class="output-text">${Helpers.escapeHtml(output.data['text/plain'].join(''))}</pre>`;
                    }
                }
                break;
            case 'error':
                html += `<div class="output-error">`;
                html += `<div class="error-name">${output.ename}: ${output.evalue}</div>`;
                if (output.traceback) {
                    html += `<pre class="error-traceback">${Helpers.escapeHtml(output.traceback.join('\n'))}</pre>`;
                }
                html += `</div>`;
                break;
        }
        
        return html;
    }
}
