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

export function createIndexKey(route: Route, layoutPath: string) {
    if (route.index) {
        return layoutPath.endsWith("/") ? `${layoutPath}${IndexToken}` : `${layoutPath}/${IndexToken}`;
    }

    return normalizePath(route.path!);
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
    // <layoutPath, Route[]>
    readonly #pendingRegistrations: Map<string, Route[]> = new Map();

    constructor() {
        this.#routes = [];
    }

    add(routes: RootRoute[] | Route[], { layoutPath }: RegisterRoutesOptions = {}) {
        if (layoutPath) {
            return this.#addNestedRoutes(routes, layoutPath);
        }

        return this.#addRootRoutes(routes);
    }

    #addRootRoutes(routes: RootRoute[]): AddRouteReturnType {
        // Add index entries to speed up the registration of future nested routes.
        routes.forEach(x => {
            const key = createIndexKey(x, "/");

            this.#routesIndex.set(key, x);
        });

        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ...routes];

        let completedPendingRegistrations;

        routes.forEach(x => {
            // Since the layoutPath is used as the key for pending routes and the
            // layoutPath is the same as the index key, an index key for the route must be created
            // to retrieve the route pending registrations.
            const key = createIndexKey(x, "/");

            completedPendingRegistrations = this.#tryRegisterPendingRoutes(key);
        });

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    #addNestedRoutes(routes: Route[], layoutPath: string): AddRouteReturnType {
        const indexKey = normalizePath(layoutPath);
        const layoutRoute = this.#routesIndex.get(indexKey);

        if (!layoutRoute) {
            const pendingRegistration = this.#pendingRegistrations.get(layoutPath);

            if (pendingRegistration) {
                pendingRegistration.push(...routes);
            } else {
                this.#pendingRegistrations.set(layoutPath, [...routes]);
            }

            return {
                registrationStatus: "pending"
            };
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

        let completedPendingRegistrations;

        routes.forEach(x => {
            // Since the layoutPath is used as the key for pending routes and the
            // layoutPath is the same as the index key, an index key for the route must be created
            // to retrieve the route pending registrations.
            const key = createIndexKey(x, "/");

            this.#tryRegisterPendingRoutes(key);
        });

        return {
            registrationStatus: "registered",
            completedPendingRegistrations
        };
    }

    #tryRegisterPendingRoutes(layoutPath: string) {
        const pendingRegistrations = this.#pendingRegistrations.get(layoutPath);

        if (pendingRegistrations) {
            // Try to register the pending routes.
            this.#addNestedRoutes(pendingRegistrations, layoutPath);

            // Remove the pending registrations.
            this.#pendingRegistrations.delete(layoutPath);

            return pendingRegistrations;
        }

        return undefined;
    }

    get routes() {
        return this.#routes;
    }

    ensureAllRoutesAreRegistered() {
        if (this.#pendingRegistrations.size > 0) {
            let message = `[squide] ${this.#pendingRegistrations.size} layout route${this.#pendingRegistrations.size !== 1 ? "s" : ""} were expected to be registered but ${this.#pendingRegistrations.size !== 1 ? "are" : "is"} missing:\r\n\r\n`;

            let index = 0;

            // It's easier to use for ... of with a Map object.
            for (const [layoutPath, nestedRoutes] of this.#pendingRegistrations) {
                index++;

                message += `${index}/${this.#pendingRegistrations.size} Missing layout path: "${layoutPath}"\r\n`;
                message += "    Pending registrations:\r\n";

                for (const x of nestedRoutes) {
                    message += `        - "${x.index ? `${layoutPath} (index)` : x.path}"\r\n`;
                }

                message += "\r\n";
            }

            message += `If you are certain that the layout route${this.#pendingRegistrations.size !== 1 ? "s" : ""} has been registered, make sure that the following conditions are met:\r\n`;
            message += "- The missing nested layout routes path property perfectly match the provided \"layoutPath\" (make sure that there's no leading or trailing \"/\" that differs).\r\n";
            message += "- The missing nested layout routes has been registered with the \"registerRoutes()\" function. A route cannot be registered under a nested layout route that has not be registered with the \"registerRoutes()\" function.\r\n";
            message += "- If a nested layout route is an index route, make sure that \"/$index$\" string has been appended to the \"layoutPath\".\r\n\r\n";
            message += "For more information about nested layout routes, refers to https://gsoft-inc.github.io/wl-squide/reference/runtime/runtime-class/#register-routes-under-a-specific-nested-layout-route.\r\n";

            throw new Error(message);
        }
    }
}
