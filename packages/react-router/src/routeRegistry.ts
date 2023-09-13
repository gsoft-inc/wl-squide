import type { RegisterRoutesOptions } from "@squide/core";
import type { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

const IndexToken = "$index$";

// TODO: simplify or make it shareable?!?!
function concatenatePaths(x: string, y: string) {
    if (x.endsWith("/") && y.startsWith("/")) {
        return `${x}${y.substring(1)}`;
    }

    if (x.endsWith("/") || y.startsWith("/")) {
        return `${x}${y}`;
    }

    return `${x}/${y}`;
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
    if (route.index) {
        // That would be usefull if nested index route is registered for a parent index route.
        // The use case doesn't really make sense as both the parent route and the nested route would
        // respond to the same path.
        // Still, keeping the code for now.
        const _parentPath = replaceTokens(parentPath);

        return concatenatePaths(_parentPath, IndexToken);
    }

    return normalizePath(route.path!);
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
            ...routes
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
