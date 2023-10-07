import { AbstractRuntime, RootMenuId, type RegisterNavigationItemOptions, type RegisterRouteOptions } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { ManagedRoutesOutlet, RouteRegistry, type RootRoute, type Route } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute | Route, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoute(route: RootRoute, options: RegisterRouteOptions = {}) {
        const result = this.#routeRegistry.add(route, options);

        if (result.registrationStatus === "registered") {
            const parentId = options.parentPath ?? options.parentName;
            const parentLog = parentId ? ` as children of the "${parentId}" route` : "";

            this._logger.debug(
                `[squide] The following route has been %cregistered%c${parentLog}.`, "color: white; background-color: green;", "%s",
                "Newly registered route:", route,
                "All registered routes:", this.#routeRegistry.routes
            );

            if (result.completedPendingRegistrations) {
                this._logger.debug(
                    `[squide] The pending registration of the following route${result.completedPendingRegistrations.length !== 1 ? "s" : ""} has been %ccompleted%c.`, "color: white; background-color: #26bfa5;", "%s",
                    "Newly registered routes:", result.completedPendingRegistrations,
                    "All registered routes:", this.#routeRegistry.routes
                );
            }
        } else {
            const parentId = options.parentPath ?? options.parentName;

            this._logger.debug(
                `[squide] The following route registration is %cpending%c until "${parentId}" is registered.`, "color: white; background-color: #007acc;", "%s",
                "Pending registration:", route,
                "All registered routes:", this.#routeRegistry.routes
            );
        }
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItem(navigationItem: RootNavigationItem, { menuId = RootMenuId }: RegisterNavigationItemOptions = {}) {
        this.#navigationItemRegistry.add(menuId, navigationItem);

        const items = this.#navigationItemRegistry.getItems(menuId)!;

        this._logger.debug(
            `[squide] The following navigation item has been registered to the "${menuId}" menu for a total of ${items.length} item${items.length !== 1 ? "s" : ""}.`,
            "Newly registered item:", navigationItem,
            "All registered items:", this.#navigationItemRegistry.getItems(menuId)
        );
    }

    getNavigationItems(menuId: string = RootMenuId) {
        return this.#navigationItemRegistry.getItems(menuId) ?? [];
    }

    _completeRegistration() {
        const pendingRegistrations = this.#routeRegistry.pendingRegistrations;

        if (pendingRegistrations.size > 0) {
            if (pendingRegistrations.has(ManagedRoutesOutlet.name!)) {
                throw new Error("[squide] The \"ManagedRoutesOutlet\" route is missing from the router configuration. The \"ManagedRoutesOutlet\" route must be added as children of an hoisted route. Did you forget to hoist the parent route that includes the \"ManagedRoutesOutlet\" route?");
            }

            let message = `[squide] ${pendingRegistrations.size} parent route${pendingRegistrations.size !== 1 ? "s" : ""} were expected to be registered but ${pendingRegistrations.size !== 1 ? "are" : "is"} missing:\r\n\r\n`;
            let index = 0;

            // It's easier to use for ... of with a Map object.
            for (const [parentId, nestedRoutes] of pendingRegistrations) {
                index++;

                message += `${index}/${pendingRegistrations.size} Missing parent route with the following path or name: "${parentId}"\r\n`;
                message += "    Pending registrations:\r\n";

                for (const x of nestedRoutes) {
                    message += `        - "${x.path ?? x.name ?? "(no identifier)"}"\r\n`;
                }

                message += "\r\n";
            }

            message += `If you are certain that the parent route${pendingRegistrations.size !== 1 ? "s" : ""} has been registered, make sure that the following conditions are met:\r\n`;
            message += "- The missing parent routes \"path\" or \"name\" property perfectly match the provided \"parentPath\" or \"parentName\" (make sure that there's no leading or trailing \"/\" that differs).\r\n";
            message += "- The missing parent routes has been registered with the \"registerRoute()\" function. A route cannot be registered under a parent route that has not be registered with the \"registerRoute()\" function.\r\n";
            message += "For more information about nested routes, refers to https://gsoft-inc.github.io/wl-squide/reference/runtime/runtime-class/#register-routes-under-a-specific-nested-layout-route.";

            if (this._mode === "development") {
                throw new Error(message);
            } else {
                this._logger.error(message);
            }
        }

        super._completeRegistration();
    }
}
