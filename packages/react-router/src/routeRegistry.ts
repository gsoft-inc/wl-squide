import type { RegisterRoutesOptions } from "@squide/core";
import type { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

const IndexToken = "$index$";

function normalizePath(routePath: string) {
    if (routePath !== "/" && routePath.endsWith("/")) {
        return routePath.substring(0, routePath.length - 1);
    }

    return routePath;
}

function replaceTokens(routePath: string) {
    return routePath.replace(`/${IndexToken}`, "");
}

function createIndexRoutePath(parentPath: string) {
    return parentPath.endsWith("/") ? `${parentPath}${IndexToken}` : `${parentPath}/${IndexToken}`;
}

export function createIndexKey(route: Route, layoutPath: string) {
    if (route.index) {
        // This is useful in the case a nested index route is registered for a layout index route.
        // This use case doesn't really make sense thought as both the layout route and the nested route
        // would respond to the same path, keeping the code for now.
        const _layoutPath = replaceTokens(layoutPath);

        return createIndexRoutePath(_layoutPath);
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

    add(routes: RootRoute[] | Route[], { layoutPath }: RegisterRoutesOptions = {}) {
        if (layoutPath) {
            this.#addNestedRoutes(routes, layoutPath);
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

    #addNestedRoutes(routes: Route[], layoutPath: string) {
        const indexKey = normalizePath(layoutPath);
        const layoutRoute = this.#routesIndex.get(indexKey);

        if (!layoutRoute) {
            // Indentation with template literals is still weird.
            // View: https://stackoverflow.com/questions/25924057/multiline-strings-that-dont-break-indentation.
            const message = `
[squide] No route has been registered for the layout path: "${layoutPath}". Make sure to register the "${layoutPath}" route before registering the ${routes.map(x => `"${x.path ?? createIndexRoutePath(layoutPath)}"`).join(",")} route${routes.length > 1 ? "s" : ""}.
If you are certain that "${layoutPath}" has been registered before the route${routes.length > 1 ? "s" : ""}, make sure that the following conditions are met:
    - The "layoutPath" perfectly match the nested layout route path (make sure that there's no leading or trailing "/" that differs).
    - The nested layout route path has been registered with the "registerRoutes" function. A @squide route cannot be registered under a nested layout route that has not registered with the "registerRoutes" function.`;

            throw new Error(message);
        }

        // Register new nested routes as children of their layout route.
        layoutRoute.children = [
            ...(layoutRoute.children ?? []),
            ...routes
        ];

        // Add index entries to speed up the registration of future nested routes.
        routes.forEach(x => {
            const key = createIndexKey(x, layoutPath);

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
