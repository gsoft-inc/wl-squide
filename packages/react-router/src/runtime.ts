import { AbstractRuntime } from "@squide/core";
import { NavigationItemRegistry, type RootNavigationItem } from "./navigationItemRegistry.ts";
import { type RootRoute, RouteRegistry } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[]) {
        this.#routeRegistry.add(routes);

        this._logger.debug(
            `[squide] The following route${routes.length !== 1 ? "s" : ""} has been registered for a total of ${this.#routeRegistry.routes.length} route${this.#routeRegistry.routes.length !== 1 ? "s" : ""}.`,
            routes,
            this.#routeRegistry.routes
        );
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[]) {
        this.#navigationItemRegistry.add(navigationItems);

        this._logger.debug(
            `[squide] The following navigation item${navigationItems.length !== 1 ? "s" : ""} has been registered for a total of ${this.#navigationItemRegistry.items.length} item${this.#navigationItemRegistry.items.length !== 1 ? "s" : ""}.`,
            navigationItems,
            this.#navigationItemRegistry.items
        );
    }

    get navigationItems() {
        return this.#navigationItemRegistry.items;
    }
}
