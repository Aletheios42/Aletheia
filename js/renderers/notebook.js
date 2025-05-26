// js/renderers/notebook.js
class NotebookRenderer {
    static pyodide = null;
    static isInitializing = false;

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
            
            // Inicializar Pyodide después de renderizar
            this.initializePyodide();
            
            return html;
        } catch (error) {
            console.error('Error rendering notebook:', error);
            return `<p>Error rendering notebook: ${error.message}</p>`;
        }
    }

    static async initializePyodide() {
        if (this.pyodide || this.isInitializing) return;
        
        this.isInitializing = true;
        try {
            console.log('Initializing Pyodide...');
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            
            // Cargar paquetes básicos
            await this.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
            
            console.log('Pyodide initialized successfully');
            this.updateExecuteButtons(true);
        } catch (error) {
            console.error('Failed to initialize Pyodide:', error);
            this.updateExecuteButtons(false);
        } finally {
            this.isInitializing = false;
        }
    }

    static updateExecuteButtons(enabled) {
        document.querySelectorAll('.execute-btn').forEach(btn => {
            btn.disabled = !enabled;
            btn.textContent = enabled ? '▶️ Run' : 'Loading...';
        });
    }

    static async renderCell(cell, index) {
        const cellType = cell.cell_type;
        let html = `<div class="notebook-cell cell-${cellType}" data-cell="${index}">`;
        
        switch (cellType) {
            case 'code':
                html += await this.renderCodeCell(cell, index);
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

    static async renderCodeCell(cell, index) {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        
        let html = '<div class="cell-input">';
        html += `<div class="cell-header">`;
        html += `<div class="cell-prompt">In [${cell.execution_count || ' '}]:</div>`;
        html += `<button class="execute-btn" data-cell-index="${index}" onclick="NotebookRenderer.executeCell(${index})">⏳ Loading...</button>`;
        html += `</div>`;
        html += '<div class="cell-code">';
        html += `<pre><code class="language-python">${this.escapeHtml(source)}</code></pre>`;
        html += '</div></div>';

        html += `<div class="cell-output" id="output-${index}">`;
        
        if (cell.outputs && cell.outputs.length > 0) {
            html += '<div class="cell-prompt">Out:</div>';
            html += '<div class="cell-output-content">';
            
            for (const output of cell.outputs) {
                html += this.renderOutput(output);
            }
            
            html += '</div>';
        }
        
        html += '</div>';

        return html;
    }

    static async executeCell(cellIndex) {
        if (!this.pyodide) {
            console.log('Pyodide not ready yet');
            return;
        }

        const cellElement = document.querySelector(`[data-cell="${cellIndex}"]`);
        const codeElement = cellElement.querySelector('.cell-code code');
        const outputElement = document.getElementById(`output-${cellIndex}`);
        const executeBtn = cellElement.querySelector('.execute-btn');
        
        const code = codeElement.textContent;
        
        executeBtn.disabled = true;
        executeBtn.textContent = '⏳ Running...';
        
        outputElement.innerHTML = '<div class="cell-prompt">Out:</div><div class="cell-output-content">';
        
        try {
            // Capturar stdout
            this.pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()
            `);
            
            // Ejecutar código
            const result = this.pyodide.runPython(code);
            
            // Obtener output capturado
            const capturedOutput = this.pyodide.runPython(`
captured = captured_output.getvalue()
sys.stdout = old_stdout
captured
            `);
            
            let outputHtml = '';
            
            // Mostrar output de print
            if (capturedOutput) {
                outputHtml += `<pre class="output-stream output-stdout">${this.escapeHtml(capturedOutput)}</pre>`;
            }
            
            // Mostrar resultado si existe y no es None
            if (result !== undefined && result !== null) {
                outputHtml += `<pre class="output-text">${this.escapeHtml(String(result))}</pre>`;
            }
            
            outputElement.querySelector('.cell-output-content').innerHTML = outputHtml || '<div class="output-empty">No output</div>';
            
        } catch (error) {
            outputElement.querySelector('.cell-output-content').innerHTML = `
                <div class="output-error">
                    <div class="error-name">${error.name || 'Error'}: ${error.message}</div>
                </div>
            `;
        }
        
        outputElement.innerHTML += '</div>';
        executeBtn.disabled = false;
        executeBtn.textContent = '▶️ Run';
    }

    static async renderMarkdownCell(cell) {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        
        // Si está disponible el renderer de markdown, usarlo
        if (typeof MarkdownRenderer !== 'undefined') {
            const rendered = await MarkdownRenderer.render(source);
            return `<div class="cell-markdown">${rendered}</div>`;
        } else {
            // Fallback básico
            const basicHtml = source
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n\n/g, '</p><p>');
            
            return `<div class="cell-markdown"><p>${basicHtml}</p></div>`;
        }
    }

    static renderRawCell(cell) {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        return `<div class="cell-raw"><pre>${this.escapeHtml(source)}</pre></div>`;
    }

    static renderOutput(output) {
        let html = '';
        
        switch (output.output_type) {
            case 'stream':
                const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                html += `<pre class="output-stream output-${output.name}">${this.escapeHtml(text)}</pre>`;
                break;
            case 'display_data':
            case 'execute_result':
                if (output.data) {
                    if (output.data['text/html']) {
                        const htmlData = Array.isArray(output.data['text/html']) ? 
                            output.data['text/html'].join('') : output.data['text/html'];
                        html += `<div class="output-html">${htmlData}</div>`;
                    } else if (output.data['image/png']) {
                        html += `<img class="output-image" src="data:image/png;base64,${output.data['image/png']}" alt="Output image">`;
                    } else if (output.data['text/plain']) {
                        const textData = Array.isArray(output.data['text/plain']) ? 
                            output.data['text/plain'].join('') : output.data['text/plain'];
                        html += `<pre class="output-text">${this.escapeHtml(textData)}</pre>`;
                    }
                }
                break;
            case 'error':
                html += `<div class="output-error">`;
                html += `<div class="error-name">${output.ename}: ${output.evalue}</div>`;
                if (output.traceback) {
                    const traceback = Array.isArray(output.traceback) ? 
                        output.traceback.join('\n') : output.traceback;
                    html += `<pre class="error-traceback">${this.escapeHtml(traceback)}</pre>`;
                }
                html += `</div>`;
                break;
        }
        
        return html;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Hacer disponible globalmente
window.NotebookRenderer = NotebookRenderer;
