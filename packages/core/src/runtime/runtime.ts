import type { Logger } from "../logging/logger.ts";
import { EventBus } from "../messaging/eventBus.ts";
import type { Plugin } from "../plugins/plugin.ts";
import { RuntimeLogger } from "./RuntimeLogger.ts";

export type SessionAccessorFunction = () => unknown;

export type RuntimeMode = "development" | "production";

export interface RuntimeOptions {
    mode?: RuntimeMode;
    loggers?: Logger[];
    plugins?: Plugin[];
    sessionAccessor?: SessionAccessorFunction;
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
    protected _sessionAccessor?: SessionAccessorFunction;

    constructor({ mode = "development", loggers, plugins = [], sessionAccessor }: RuntimeOptions = {}) {
        this._mode = mode;
        this._plugins = plugins;
        this._logger = new RuntimeLogger(loggers);
        this._eventBus = new EventBus({ logger: this._logger });
        this._sessionAccessor = sessionAccessor;

        this._plugins.forEach(x => {
            if (x._setRuntime) {
                x._setRuntime(this);
            }
        });
    }

    abstract registerRoute(route: TRoute, options?: RegisterRouteOptions): void;

    abstract get routes(): TRoute[];

    abstract registerNavigationItem(navigationItem: TNavigationItem, options?: RegisterNavigationItemOptions): void;

    abstract getNavigationItems(menuId?: string): TNavigationItem[];

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

    getSession() {
        if (!this._sessionAccessor) {
            throw new Error("[squide] Cannot retrieve the session because no session accessor has been provided. Did you provide a sessionAccessor function to the Runtime instance?");
        }

        return this._sessionAccessor();
    }

    // Prefixed by _ to indicate that it's considered as an "internal" method.
    _completeRegistration() {
        this._logger.debug("[squide] %cModules are ready%c.", "color: white; background-color: green;", "");
    }
}
