import { AbstractRuntime, RootMenuId, type RegisterNavigationItemsOptions, type RegisterRoutesOptions } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { RouteRegistry, type RootRoute, type Route } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute | Route, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[] | Route[], options: RegisterRoutesOptions = {}) {
        const result = this.#routeRegistry.add(routes, options);

        if (result.registrationStatus === "registered") {
            const parentLog = options.layoutPath ? ` as children of the "${options.layoutPath}" route` : "";

            this._logger.debug(
                `[squide] The following route${routes.length !== 1 ? "s" : ""} has been %cregistered%c${parentLog} for a total of ${this.#routeRegistry.routes.length} route${this.#routeRegistry.routes.length !== 1 ? "s" : ""}.`, "color: white; background-color: green;", "%s",
                "Newly registered routes:", routes,
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
            this._logger.debug(
                `[squide] The following route${routes.length !== 1 ? "s" : ""} registration are %cpending%c until "${options.layoutPath}" is registered.`, "color: white; background-color: #007acc;", "%s",
                "Pending registration:", routes,
                "All registered routes:", this.#routeRegistry.routes
            );
        }
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[], { menuId = RootMenuId }: RegisterNavigationItemsOptions = {}) {
        this.#navigationItemRegistry.add(menuId, navigationItems);

        const items = this.#navigationItemRegistry.getItems(menuId)!;

        this._logger.debug(
            `[squide] The following navigation item${navigationItems.length !== 1 ? "s" : ""} has been registered to the "${menuId}" menu for a total of ${items.length} item${items.length !== 1 ? "s" : ""}.`,
            "Newly registered items:", navigationItems,
            "All registered items:", this.#navigationItemRegistry.getItems(menuId)
        );
    }

    getNavigationItems(menuId: string = RootMenuId) {
        return this.#navigationItemRegistry.getItems(menuId) ?? [];
    }

    _completeRegistration() {
        this.#routeRegistry.ensureAllRoutesAreRegistered();

        super._completeRegistration();
    }
}
