import type { RegisterRoutesOptions } from "@squide/core";
import type { IndexRouteObject, NonIndexRouteObject } from "react-router-dom";

export type RouteVisibility = "public" | "authenticated";

export type RouteType = "root";

export interface IndexRoute extends IndexRouteObject {
    name?: string;
}

export interface NonIndexRoute extends Omit<NonIndexRouteObject, "children"> {
    name?: string;
    children?: Route[];
}

export type Route = IndexRoute | NonIndexRoute;

export type RootRoute = Route & {
    hoist?: boolean;
    visibility?: RouteVisibility;
    type?: RouteType;
};

function normalizePath(routePath?: string) {
    if (routePath && routePath !== "/" && routePath.endsWith("/")) {
        return routePath.substring(0, routePath.length - 1);
    }

    return routePath;
}

export function createIndexKey(route: Route) {
    if (route.path) {
        return normalizePath(route.path);
    }

    if (route.name) {
        return route.name;
    }

    return undefined;
}

export type RouteRegistrationStatus = "pending" | "registered";

export interface AddRouteReturnType {
    registrationStatus: RouteRegistrationStatus;
    completedPendingRegistrations?: Route[];
}

export class RouteRegistry {
    #routes: RootRoute[];

    // Using an index to speed up the look up of parent routes.
    // <indexKey, RootRoute | Route>
    readonly #routesIndex: Map<string, RootRoute | Route> = new Map();

    // A collection of pending routes to registered once their layout is registered.
    // <parentPath | parentName, Route[]>
    readonly #pendingRegistrations: Map<string, Route[]> = new Map();

    constructor() {
        this.#routes = [];
    }

    add(routes: RootRoute[] | Route[], { parentPath, parentName }: RegisterRoutesOptions = {}) {
        if (parentPath) {
            // The normalized path cannot be undefined because it's been provided by the consumer
            // (e.g. it cannot be a pathless route).
            return this.#addNestedRoutes(routes, normalizePath(parentPath)!);
        }

        if (parentName) {
            return this.#addNestedRoutes(routes, parentName);
        }

        return this.#addRootRoutes(routes);
    }

    #addIndex(route: Route) {
        const key = createIndexKey(route);

        if (key) {
            if (this.#routesIndex.has(key)) {
                throw new Error(`[squide] A route index has already been registered for the key: "${key}". Did you register 2 routes with the same "path" or "name" property?`);
            }

            this.#routesIndex.set(key, route);
        }

        return key;
    }

    #recursivelyAddIndexes(route: Route) {
        const newIndexes: string[] = [];
        const key = this.#addIndex(route);

        if (key) {
            newIndexes.push(key);
        }

        if (route.children) {
            route.children.forEach(x => {
                const indexes = this.#recursivelyAddIndexes(x);

                newIndexes.push(...indexes);
            });
        }

        return newIndexes;
    }

    #addRootRoutes(routes: RootRoute[]): AddRouteReturnType {
        // Creates a copy of the route objects and a type to each route to indicate
        // that it's a root route.
        const _routes: RootRoute[] = routes.map(x => ({
            ...x,
            visibility: x.visibility ?? "authenticated",
            type: "root"
        }));

        const newIndexes: string[] = [];

        // Add index entries to speed up the registration of future nested routes.
        // This is done recursively to also register indexes for the nested routes if there are any.
        _routes.forEach(x => {
            const indexes = this.#recursivelyAddIndexes(x);

            newIndexes.push(...indexes);
        });

        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ..._routes];

        const completedPendingRegistrations: Route[] = [];

        // Use the new indexes to retrieve the route pending registrations and complete their registration.
        newIndexes.forEach(x => {
            const pendingRegistrations = this.#tryRegisterPendingRoutes(x);

            completedPendingRegistrations.push(...pendingRegistrations);
        });

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    #addNestedRoutes(routes: Route[], parentId: string): AddRouteReturnType {
        // Creates a copy of the route objects.
        const _routes: Route[] = routes.map(x => ({ ...x }));

        const layoutRoute = this.#routesIndex.get(parentId);

        if (!layoutRoute) {
            const pendingRegistration = this.#pendingRegistrations.get(parentId);

            if (pendingRegistration) {
                pendingRegistration.push(..._routes);
            } else {
                this.#pendingRegistrations.set(parentId, [..._routes]);
            }

            return {
                registrationStatus: "pending"
            };
        }

        // Register new nested routes as children of their layout route.
        layoutRoute.children = [
            ...(layoutRoute.children ?? []),
            ..._routes
        ];

        const newIndexes: string[] = [];

        // Add index entries to speed up the registration of future nested routes.
        // This is done recursively to also register indexes for the nested routes if there are any.
        _routes.forEach(x => {
            const indexes = this.#recursivelyAddIndexes(x);

            newIndexes.push(...indexes);
        });

        // Create a new array since the routes array is immutable and a nested
        // object has been updated.
        this.#routes = [...this.#routes];

        const completedPendingRegistrations: Route[] = [];

        // Use the new indexes to retrieve the route pending registrations and complete their registration.
        newIndexes.forEach(x => {
            const pendingRegistrations = this.#tryRegisterPendingRoutes(x);

            completedPendingRegistrations.push(...pendingRegistrations);
        });

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    #tryRegisterPendingRoutes(parentId: string) {
        const pendingRegistrations = this.#pendingRegistrations.get(parentId);

        if (pendingRegistrations) {
            // Try to register the pending routes.
            this.#addNestedRoutes(pendingRegistrations, parentId);

            // Remove the pending registrations.
            this.#pendingRegistrations.delete(parentId);

            return pendingRegistrations;
        }

        return [];
    }

    get routes() {
        return this.#routes;
    }

    get pendingRegistrations() {
        return this.#pendingRegistrations;
    }
}
