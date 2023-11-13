import { AbstractRuntime, RootMenuId, type RegisterNavigationItemOptions, type RegisterRouteOptions } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { ManagedRoutes, ManagedRoutesOutletName } from "./outlets.ts";
import { RouteRegistry, type Route } from "./routeRegistry.ts";

function translateManagedRoutesParentId(parentId?: string) {
    if (parentId === ManagedRoutesOutletName) {
        return "managed-routes-placeholder";
    }

    return parentId;
}

export class ReactRouterRuntime extends AbstractRuntime<Route, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoute(route: Route, options: RegisterRouteOptions = {}) {
        const result = this.#routeRegistry.add(route, options);

        const parentId = translateManagedRoutesParentId(result.parentId);

        if (result.registrationStatus === "registered") {
            const parentLog = parentId ? ` as a children of the "${parentId}" route` : "";

            this._logger.debug(
                `[squide] The following route has been %cregistered%c${parentLog}.`, "color: white; background-color: green;", "%s",
                "Newly registered item:",
                route,
                "All registered routes:", this.#routeRegistry.routes
            );

            if (result.completedPendingRegistrations.length > 0) {
                this._logger.debug(
                    `[squide] The pending registration of the following route${result.completedPendingRegistrations.length !== 1 ? "s" : ""} has been %ccompleted%c.`, "color: white; background-color: green;", "%s",
                    "Newly registered routes:", result.completedPendingRegistrations,
                    "All registered routes:", this.#routeRegistry.routes
                );
            }
        } else {
            this._logger.debug(
                `[squide] The following route registration is %cpending%c until "${parentId}" is registered.`, "color: black; background-color: yellow;", "%s",
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
            `[squide] The following navigation item has been %cregistered%c to the "${menuId}" menu for a total of ${items.length} item${items.length !== 1 ? "s" : ""}.`, "color: white; background-color: green;", "%s",
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
            if (pendingRegistrations.has(ManagedRoutes.$name!)) {
                // eslint-disable-next-line max-len
                throw new Error("[squide] The ManagedRoutes placeholder is missing from the router configuration. The ManagedRoutes placeholder must be defined as a children of an hoisted route. Did you include a ManagedRoutes placeholder and hoist the ManagedRoutes placeholder's parent route?");
            }

            let message = `[squide] ${pendingRegistrations.size} parent route${pendingRegistrations.size !== 1 ? "s" : ""} were expected to be registered but ${pendingRegistrations.size !== 0 ? "are" : "is"} missing:\r\n\r\n`;
            let index = 0;

            // It's easier to use for ... of with a Map object.
            for (const [parentId, nestedRoutes] of pendingRegistrations) {
                index++;

                message += `${index}/${pendingRegistrations.size} Missing parent route with the following path or name: "${parentId}"\r\n`;
                message += "    Pending registrations:\r\n";

                for (const x of nestedRoutes) {
                    message += `        - "${x.path ?? x.$name ?? "(no identifier)"}"\r\n`;
                }

                message += "\r\n";
            }

            message += `If you are certain that the parent route${pendingRegistrations.size !== 1 ? "s" : ""} has been registered, make sure that the following conditions are met:\r\n`;
            message += "- The missing parent routes \"path\" or \"name\" property perfectly match the provided \"parentPath\" or \"parentName\" (make sure that there's no leading or trailing \"/\" that differs).\r\n";
            message += "- The missing parent routes has been registered with the runtime.registerRoute function. A route cannot be registered under a parent route that has not be registered with the runtime.registerRoute function.\r\n";
            message += "For more information about nested routes, refers to https://gsoft-inc.github.io/wl-squide/reference/runtime/runtime-class/#register-nested-routes-under-an-existing-route.\r\n";
            message += "For more information about the ManagedRoutes placeholder, refers to https://gsoft-inc.github.io/wl-squide/reference/routing/managedroutes.";

            if (this._mode === "development") {
                throw new Error(message);
            } else {
                this._logger.error(message);
            }
        }

        super._completeRegistration();
    }
}
