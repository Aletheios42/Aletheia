# Directrices del Proyecto - Blog Estático

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Sin servidor**: Página completamente estática
- **Almacenamiento**: LocalStorage para funcionalidades avanzadas

## Arquitectura de Contenido
- **Formatos múltiples**: Soporte para markdown, LaTeX, Jupyter notebooks, videos, HTML
- **Sistema de etiquetas**: Tags principales y metaetiquetas para categorización
- **Filtrado dinámico**: Búsqueda y filtrado por temática/contenido/formato
- **Estructura similar a Hugo**: Organización jerárquica de contenido

## Funcionalidades Core
- **Navegación**: Sistema de routing sin servidor (hash-based)
- **Filtros avanzados**: Por tags, categorías, fechas, tipo de contenido
- **Búsqueda**: Full-text search en cliente
- **Multiidioma**: Selector de idioma con botón toggle
- **Renderizado dinámico**: Procesadores para LaTeX (MathJax/KaTeX), markdown, notebooks

## Diseño y UX
- **Estética minimalista**: Clean, elegante, sin elementos superfluos
- **Tipografía**: Jerarquía clara, legibilidad óptima para contenido técnico
- **Performance**: Carga rápida, lazy loading para contenido pesado
- **Responsive**: Adaptable a todos los dispositivos

## Escalabilidad
- **Modularidad**: Componentes reutilizables por tipo de contenido
- **Extensibilidad**: Preparado para nuevos formatos y ejercicios técnicos
- **LocalStorage**: Preferencias de idioma, filtros, cache de contenido

## Objetivo
Blog personal multiformat con capacidad de filtrado avanzado, soporte internacional y renderizado de contenido técnico complejo.
