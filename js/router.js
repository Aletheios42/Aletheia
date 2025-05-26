// js/router.js
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.params = {};
        
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, search] = hash.split('?');
        
        this.params = this.parseSearch(search);
        this.currentRoute = path;
        
        // Buscar ruta exacta
        if (this.routes[path]) {
            this.routes[path](this.params);
            return;
        }
        
        // Buscar ruta con parámetros
        for (const route in this.routes) {
            const match = this.matchRoute(route, path);
            if (match) {
                this.params = { ...this.params, ...match.params };
                this.routes[route](this.params);
                return;
            }
        }
        
        // Ruta no encontrada
        this.routes['/404'] && this.routes['/404']();
    }

    matchRoute(route, path) {
        const routeParts = route.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length !== pathParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
                return null;
            }
        }
        
        return { params };
    }

    parseSearch(search) {
        if (!search) return {};
        
        const params = {};
        const pairs = search.split('&');
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        }
        
        return params;
    }

    buildUrl(path, params = {}) {
        let url = path;
        const searchParams = new URLSearchParams(params);
        const search = searchParams.toString();
        
        if (search) {
            url += '?' + search;
        }
        
        return '#' + url;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getParams() {
        return this.params;
    }
}
