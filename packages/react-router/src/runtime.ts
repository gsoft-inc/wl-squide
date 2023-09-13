import { AbstractRuntime, RootMenuId, type RegisterNavigationItemsOptions, type RegisterRoutesOptions } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { RouteRegistry, type RootRoute, type Route } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute | Route, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[] | Route[], options: RegisterRoutesOptions = {}) {
        this.#routeRegistry.add(routes, options);

        const parentLog = options.layoutPath ? ` as children of the "${options.layoutPath}" route` : "";

        this._logger.debug(
            `[squide] The following route${routes.length !== 1 ? "s" : ""} has been registered${parentLog} for a total of ${this.#routeRegistry.routes.length} route${this.#routeRegistry.routes.length !== 1 ? "s" : ""}.`,
            routes,
            this.#routeRegistry.routes
        );
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[], { menuId = RootMenuId }: RegisterNavigationItemsOptions = {}) {
        this.#navigationItemRegistry.add(menuId, navigationItems);

        const items = this.#navigationItemRegistry.getItems(menuId)!;

        this._logger.debug(
            `[squide] The following navigation item${navigationItems.length !== 1 ? "s" : ""} has been registered to the "${menuId}" menu for a total of ${items.length} item${items.length !== 1 ? "s" : ""}.`,
            navigationItems,
            items
        );
    }

    getNavigationItems(menuId: string = RootMenuId) {
        return this.#navigationItemRegistry.getItems(menuId) ?? [];
    }
}
