import { AbstractRuntime, isNil } from "@squide/core";

import { NavigationItemRegistry } from "./navigationItemRegistry.ts";
import type { RootNavigationItem } from "./navigationItemRegistry.ts";
import type { RootRoute } from "./routeRegistry.ts";
import { RouteRegistry } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute, RootNavigationItem> {
    protected _routeRegistry = new RouteRegistry();
    protected _navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[]) {
        if (!isNil(routes)) {
            this._routeRegistry.add(routes);

            super._logger.debug(`[squide] The following route${routes.length > 1 ? "s" : ""} has been registered.`, routes);
        }
    }

    get routes() {
        return this._routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[]) {
        if (!isNil(navigationItems)) {
            this._navigationItemRegistry.add(navigationItems);

            super._logger.debug(`[squide] The following navigation item${navigationItems.length > 1 ? "s" : ""} has been registered.`, navigationItems);
        }
    }

    get navigationItems() {
        return this._navigationItemRegistry.items;
    }
}
