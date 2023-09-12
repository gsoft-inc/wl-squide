import { AbstractRuntime, RootMenuPath, type RegisterNavigationItemsOptions, type RegisterRoutesOptions } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { RouteRegistry, type RootRoute, type Route } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute | Route, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[] | Route[], options: RegisterRoutesOptions = {}) {
        this.#routeRegistry.add(routes, options);

        const parentLog = options.parentPath ? `as children of the "${options.parentPath}" route` : "";

        this._logger.debug(
            `[squide] The following route${routes.length !== 1 ? "s" : ""} has been registered${parentLog} for a total of ${this.#routeRegistry.routes.length} route${this.#routeRegistry.routes.length !== 1 ? "s" : ""}.`,
            routes,
            this.#routeRegistry.routes
        );
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[], { menuPath = RootMenuPath }: RegisterNavigationItemsOptions = {}) {
        this.#navigationItemRegistry.add(menuPath, navigationItems);

        const items = this.#navigationItemRegistry.getItems(menuPath)!;

        this._logger.debug(
            `[squide] The following navigation item${navigationItems.length !== 1 ? "s" : ""} has been registered to the "${menuPath}" menu for a total of ${items.length} item${items.length !== 1 ? "s" : ""}.`,
            navigationItems,
            items
        );
    }

    getNavigationItems(menuPath: string = RootMenuPath) {
        return this.#navigationItemRegistry.getItems(menuPath) ?? [];
    }
}
