import type { RegisterRoutesOptions } from "@squide/core";
import type { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

export class RouteRegistry {
    #routes: RootRoute[];

    // Using a denormalized routes structure to speed up the look up for parent routes
    // as we expect that 99% of the time, the parent will be a root route.
    #denormalizedRoutes: Map<string, RootRoute | Route>;

    constructor() {
        this.#routes = [];
        this.#denormalizedRoutes = new Map();
    }

    add(routes: RootRoute[] | Route[], { parentPath }: RegisterRoutesOptions = {}) {
        if (parentPath) {
            this.#addNestedRoutes(routes, parentPath);
        } else {
            this.#addRootRoutes(routes);
        }
    }

    #addRootRoutes(routes: RootRoute[]) {
        // Save denormalized entries to speed up the registration future of nested routes.
        routes.forEach(x => {
            const key = x.index ? "/index" : x.path!;

            this.#denormalizedRoutes.set(key, x);
        });

        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ...routes];
    }

    // TODO: in docs if looking to append to an index route, add "/index" at the end.
    #addNestedRoutes(routes: Route[], parentPath: string) {
        const parentRoute = this.#denormalizedRoutes.get(parentPath);

        if (!parentRoute) {
            throw new Error(`[squide] No route has been registered for the parentPath: ${parentPath}. Make sure to register the module including the parent route before registring a nested route for that route.`);
        }

        // Register new nested routes as children of their parent route.
        parentRoute.children = [
            ...(parentRoute.children ?? []),
            ...routes
        ];

        // Save denormalized entries for future usage.
        routes.forEach(x => {
            const key = `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${x.index ? "index" : x.path}`;

            this.#denormalizedRoutes.set(key, x);
        });

        // Create a new array since the routes array is immutable and a nested
        // object has been updated.
        this.#routes = [...this.#routes];
    }

    get routes() {
        return this.#routes;
    }
}
