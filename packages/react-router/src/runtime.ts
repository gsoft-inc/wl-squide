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
        const pendingRegistrations = this.#routeRegistry.pendingRegistrations;

        if (pendingRegistrations.size > 0) {
            let message = `[squide] ${pendingRegistrations.size} layout route${pendingRegistrations.size !== 1 ? "s" : ""} were expected to be registered but ${pendingRegistrations.size !== 1 ? "are" : "is"} missing:\r\n\r\n`;

            let index = 0;

            // It's easier to use for ... of with a Map object.
            for (const [layoutPath, nestedRoutes] of pendingRegistrations) {
                index++;

                message += `${index}/${pendingRegistrations.size} Missing layout path: "${layoutPath}"\r\n`;
                message += "    Pending registrations:\r\n";

                for (const x of nestedRoutes) {
                    message += `        - "${x.index ? `${layoutPath} (index)` : x.path}"\r\n`;
                }

                message += "\r\n";
            }

            message += `If you are certain that the layout route${pendingRegistrations.size !== 1 ? "s" : ""} has been registered, make sure that the following conditions are met:\r\n`;
            message += "- The missing nested layout routes path property perfectly match the provided \"layoutPath\" (make sure that there's no leading or trailing \"/\" that differs).\r\n";
            message += "- The missing nested layout routes has been registered with the \"registerRoutes()\" function. A route cannot be registered under a nested layout route that has not be registered with the \"registerRoutes()\" function.\r\n";
            message += "- If a nested layout route is an index route, make sure that \"/$index$\" string has been appended to the \"layoutPath\".\r\n\r\n";
            message += "For more information about nested layout routes, refers to https://gsoft-inc.github.io/wl-squide/reference/runtime/runtime-class/#register-routes-under-a-specific-nested-layout-route.\r\n";

            if (this._mode === "development") {
                throw new Error(message);
            } else {
                this._logger.error(message);
            }
        }

        super._completeRegistration();
    }
}
