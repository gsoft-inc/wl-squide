import type { RegisterRoutesOptions } from "@squide/core";
import type { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

const IndexToken = "$index$";

function concatenatePaths(x: string, y: string) {
    if (x.endsWith("/") && y.startsWith("/")) {
        return `${x}${y.substring(1)}`;
    }

    if (x.endsWith("/") || y.startsWith("/")) {
        return `${x}${y}`;
    }

    return `${x}/${y}`;
}

// Enclose the path between separator to ensure we look for a full url segment.
// Ex: /foo -> /foo/
function isPathAlreadyIncluded(target: string, path: string) {
    return target.includes(`${path}${path.endsWith("/") ? "" : "/"}`);
}

function normalizePath(routePath: string) {
    if (routePath !== "/" && routePath.endsWith("/")) {
        return routePath.substring(0, routePath.length - 1);
    }

    return routePath;
}

function replaceTokens(routePath: string) {
    return routePath.replace(`/${IndexToken}`, "");
}

export function createIndexKey(route: Route, parentPath: string) {
    let routePath = route.path!;

    if (route.index) {
        routePath = IndexToken;
    } else {
        // Do not concatenate if the route path already includes the parent path.
        if (isPathAlreadyIncluded(routePath, parentPath)) {
            return normalizePath(routePath);
        }
    }

    return normalizePath(concatenatePaths(parentPath, routePath));
}

// IMPORTANT: Do not create a copy of route instance otherwise it will save a different copy
// in the index and breaks deeply nested routes support.
function tryAppendParentPathToNestedRoutePath(nestedRoute: Route, parentPath: string) {
    if (nestedRoute.index) {
        return nestedRoute;
    }

    const nestedPath = nestedRoute.path!;
    const _parentPath = replaceTokens(parentPath);

    // Do not concatenate if the route path already includes the parent path.
    if (isPathAlreadyIncluded(nestedPath, _parentPath)) {
        nestedRoute.path = normalizePath(nestedPath);
    } else {
        nestedRoute.path = normalizePath(concatenatePaths(_parentPath, nestedPath));
    }

    return nestedRoute;
}

export class RouteRegistry {
    #routes: RootRoute[];

    // Using an index to speed up the look up of parent routes.
    readonly #routesIndex: Map<string, RootRoute | Route> = new Map();

    constructor() {
        this.#routes = [];
    }

    add(routes: RootRoute[] | Route[], { parentPath }: RegisterRoutesOptions = {}) {
        if (parentPath) {
            this.#addNestedRoutes(routes, parentPath);
        } else {
            this.#addRootRoutes(routes);
        }
    }

    #addRootRoutes(routes: RootRoute[]) {
        // Add index entries to speed up the registration of future nested routes.
        routes.forEach(x => {
            const key = createIndexKey(x, "/");

            this.#routesIndex.set(key, x);
        });

        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ...routes];
    }

    // TODO: in docs if looking to append to an index route, add "/index" at the end.
    #addNestedRoutes(routes: Route[], parentPath: string) {
        const indexKey = normalizePath(parentPath);
        const parentRoute = this.#routesIndex.get(indexKey);

        if (!parentRoute) {
            throw new Error(`[squide] No route has been registered for the parentPath: ${parentPath}. Make sure to register the module including the parent route before registring a nested route for that route.`);
        }

        // Register new nested routes as children of their parent route.
        parentRoute.children = [
            ...(parentRoute.children ?? []),
            ...routes.map(x => tryAppendParentPathToNestedRoutePath(x, parentPath))
        ];

        // Add index entries to speed up the registration of future nested routes.
        routes.forEach(x => {
            const key = createIndexKey(x, parentPath);

            this.#routesIndex.set(key, x);
        });

        // Create a new array since the routes array is immutable and a nested
        // object has been updated.
        this.#routes = [...this.#routes];
    }

    get routes() {
        return this.#routes;
    }
}
