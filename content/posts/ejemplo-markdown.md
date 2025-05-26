// content/posts/ejemplo-markdown.md
# Introducción a JavaScript Moderno

Este es un artículo de ejemplo sobre las características modernas de JavaScript que todo desarrollador debería conocer.

## Arrow Functions

Las funciones flecha proporcionan una sintaxis más concisa:

```javascript
// Función tradicional
function suma(a, b) {
    return a + b;
}

// Arrow function
const suma = (a, b) => a + b;
```

## Destructuring

Permite extraer valores de arrays u objetos:

```javascript
const persona = { nombre: 'Juan', edad: 30 };
const { nombre, edad } = persona;

const numeros = [1, 2, 3];
const [primero, segundo] = numeros;
```

## Async/Await

Simplifica el trabajo con promesas:

```javascript
async function obtenerDatos() {
    try {
        const respuesta = await fetch('/api/datos');
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Matemáticas con LaTeX

También podemos incluir fórmulas matemáticas: $f(x) = x^2 + 2x + 1$

Y ecuaciones en bloque:

$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

---

Este es solo un ejemplo de cómo combinar código, texto y matemáticas en un solo documento.

// content/posts/ejemplo-latex.tex
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}

\begin{document}

\section{Cálculo Diferencial}

El cálculo diferencial es una rama fundamental de las matemáticas que estudia las tasas de cambio y las pendientes de curvas.

\subsection{Definición de Derivada}

La derivada de una función $f(x)$ en un punto $x = a$ se define como:

\[
f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}
\]

\subsection{Reglas de Derivación}

\textbf{Regla del producto:} Si $f(x) = u(x) \cdot v(x)$, entonces:
\[
f'(x) = u'(x) \cdot v(x) + u(x) \cdot v'(x)
\]

\textbf{Regla de la cadena:} Si $f(x) = g(h(x))$, entonces:
\[
f'(x) = g'(h(x)) \cdot h'(x)
\]

\subsection{Aplicaciones}

Las derivadas tienen múltiples aplicaciones:

\begin{itemize}
    \item Encontrar máximos y mínimos de funciones
    \item Calcular velocidades instantáneas
    \item Determinar la concavidad de curvas
    \item Resolver problemas de optimización
\end{itemize}

\subsection{Ejemplo Práctico}

Consideremos la función $f(x) = x^3 - 3x^2 + 2x + 1$.

Su derivada es:
\[
f'(x) = 3x^2 - 6x + 2
\]

Para encontrar los puntos críticos, resolvemos $f'(x) = 0$:
\[
3x^2 - 6x + 2 = 0
\]

Usando la fórmula cuadrática:
\[
x = \frac{6 \pm \sqrt{36 - 24}}{6} = \frac{6 \pm \sqrt{12}}{6} = \frac{6 \pm 2\sqrt{3}}{6} = 1 \pm \frac{\sqrt{3}}{3}
\]

\end{document}

// .gitignore
node_modules/
.DS_Store
*.log
dist/
build/
.env
.cache/
.temp/

// README.md
# Blog Técnico Estático

Blog personal multiformat con soporte para markdown, LaTeX, Jupyter notebooks y videos.

## Características

- **Formatos múltiples**: Markdown, LaTeX, Jupyter, Video, HTML
- **Búsqueda avanzada**: Full-text search en contenido
- **Filtrado dinámico**: Por tags, formato, fecha
- **Multiidioma**: Español/Inglés
- **Responsive**: Adaptable a todos los dispositivos
- **Sin servidor**: Completamente estático

## Estructura

```
├── index.html              # Página principal
├── css/                    # Estilos
│   ├── main.css
│   ├── components.css
│   └── responsive.css
├── js/                     # JavaScript
│   ├── main.js
│   ├── router.js
│   ├── search.js
│   ├── filters.js
│   ├── components/
│   ├── utils/
│   └── renderers/
├── content/                # Contenido
│   ├── posts/
│   └── pages/
├── data/                   # Datos y configuración
│   ├── posts.json
│   └── tags.json
├── config/                 # Configuración
│   └── languages.json
└── assets/                 # Recursos
    ├── images/
    └── videos/
```

## Instalación

1. Clona el repositorio
2. Ejecuta el script de estructura (opcional)
3. Sirve los archivos con un servidor web local

## Uso

### Añadir contenido

1. Crea tu archivo en `content/posts/`
2. Actualiza `data/posts.json` con los metadatos
3. El contenido aparecerá automáticamente

### Formatos soportados

- **Markdown** (.md): Texto con formato y matemáticas
- **LaTeX** (.tex): Documentos matemáticos complejos  
- **Jupyter** (.ipynb): Notebooks con código y visualizaciones
- **Video**: URLs de YouTube o archivos locales
- **HTML**: Contenido HTML directo

## Configuración

Edita `data/config.json` para personalizar:
- Título del sitio
- Posts por página
- Configuración de renderizado
- Idiomas soportados

## Tecnologías

- HTML5/CSS3/JavaScript ES6+
- Marked.js (Markdown)
- KaTeX (LaTeX)
- LocalStorage (persistencia)
- Hash-based routing

// package.json
{
  "name": "blog-tecnico",
  "version": "1.0.0",
  "description": "Blog técnico estático multiformat",
  "main": "index.html",
  "scripts": {
    "serve": "python -m http.server 8000",
    "serve-node": "npx http-server -p 8000",
    "build": "echo 'No build step required - static site'"
  },
  "keywords": [
    "blog",
    "static",
    "markdown",
    "latex",
    "jupyter",
    "mathematics",
    "programming"
  ],
  "author": "Tu Nombre",
  "license": "MIT",
  "devDependencies": {
    "http-server": "^14.1.1"
  },
  "dependencies": {}
}

// Ejemplo de archivo de configuración mínimo
// data/config.json (versión simplificada)
{
  "site": {
    "title": "Mi Blog Técnico",
    "defaultLanguage": "es",
    "postsPerPage": 6
  },
  "formats": {
    "markdown": { "enabled": true },
    "latex": { "enabled": true },
    "notebook": { "enabled": true },
    "video": { "enabled": true }
  }
}

// config/languages.json (versión simplificada)
{
  "es": {
    "nav": { "home": "Inicio", "articles": "Artículos", "search": "Buscar..." },
    "filters": { "title": "Filtros", "clear": "Limpiar" },
    "content": { "loading": "Cargando...", "noResults": "Sin resultados" }
  },
  "en": {
    "nav": { "home": "Home", "articles": "Articles", "search": "Search..." },
    "filters": { "title": "Filters", "clear": "Clear" },
    "content": { "loading": "Loading...", "noResults": "No results" }
  }
}

// data/posts.json (ejemplo mínimo)
{
  "posts": [
    {
      "id": "ejemplo-1",
      "title": { "es": "Mi Primer Post", "en": "My First Post" },
      "description": { "es": "Descripción del post", "en": "Post description" },
      "format": "markdown",
      "file": "content/posts/ejemplo-markdown.md",
      "date": "2025-05-26",
      "tags": ["javascript", "tutorial"],
      "language": "es"
    }
  ]
}
