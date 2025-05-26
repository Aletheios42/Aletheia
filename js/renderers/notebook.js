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
