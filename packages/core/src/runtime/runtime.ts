import type { Logger } from "../logging/logger.ts";
import { EventBus } from "../messaging/eventBus.ts";
import type { Plugin } from "../plugins/plugin.ts";
import { RuntimeLogger } from "./RuntimeLogger.ts";

export type RuntimeMode = "development" | "production";

export interface RuntimeOptions {
    mode?: RuntimeMode;
    loggers?: Logger[];
    plugins?: Plugin[];
}

export interface RegisterRouteOptions {
    hoist?: true;
    parentPath?: string;
    parentName?: string;
}

export interface RegisterNavigationItemOptions {
    menuId?: string;
}

export const RootMenuId = "root";

export abstract class Runtime<TRoute = unknown, TNavigationItem = unknown> {
    protected _mode: RuntimeMode;
    protected readonly _logger: RuntimeLogger;
    protected readonly _eventBus: EventBus;
    protected readonly _plugins: Plugin[];

    constructor({ mode = "development", loggers, plugins = [] }: RuntimeOptions = {}) {
        this._mode = mode;
        this._plugins = plugins;
        this._logger = new RuntimeLogger(loggers);
        this._eventBus = new EventBus({ logger: this._logger });

        this._plugins.forEach(x => {
            if (x.setRuntime) {
                x.setRuntime(this);
            }
        });
    }

    abstract registerRoute(route: TRoute, options?: RegisterRouteOptions): void;

    abstract get routes(): TRoute[];

    abstract registerNavigationItem(navigationItem: TNavigationItem, options?: RegisterNavigationItemOptions): void;

    abstract getNavigationItems(menuId?: string): TNavigationItem[];

    abstract startDeferredRegistrationScope(transactional?: boolean): void;

    abstract completeDeferredRegistrationScope(): void;

    get mode() {
        return this._mode;
    }

    get plugins() {
        return this._plugins;
    }

    getPlugin(pluginName: string) {
        const plugin = this._plugins.find(x => x.name === pluginName);

        if (!plugin) {
            throw new Error(`[squide] Cannot find a plugin named "${pluginName}". Did you add an instance of the plugin to the application Runtime instance?`);
        }

        return plugin;
    }

    get logger() {
        return this._logger;
    }

    get eventBus() {
        return this._eventBus;
    }

    // Prefixed by _ to indicate that it's considered as an "internal" method, cannot use "#"" because of inheritance.
    // Not abstract so concrete classes are not required to provide an implementation.
    _validateRegistrations() {}
}
