import type { Logger } from "../logging/logger.ts";
import { EventBus } from "../messaging/eventBus.ts";
import { RuntimeLogger } from "./RuntimeLogger.ts";

export type SessionAccessorFunction = () => unknown;

export type RuntimeMode = "development" | "production";

export interface RuntimeOptions {
    mode?: RuntimeMode;
    loggers?: Logger[];
    services?: Record<string, unknown>;
    sessionAccessor?: SessionAccessorFunction;
}

export interface RegisterRoutesOptions {
    layoutPath?: string;
}

export interface RegisterNavigationItemsOptions {
    menuId?: string;
}

export const RootMenuId = "root";

export abstract class AbstractRuntime<TRoute = unknown, TNavigationItem = unknown> {
    protected _mode: RuntimeMode;
    protected readonly _logger: RuntimeLogger;
    protected readonly _eventBus: EventBus;
    protected _services: Record<string, unknown>;
    protected _sessionAccessor?: SessionAccessorFunction;

    constructor({ mode = "development", loggers, services = {}, sessionAccessor }: RuntimeOptions = {}) {
        this._mode = mode;
        this._logger = new RuntimeLogger(loggers);
        this._eventBus = new EventBus({ logger: this._logger });
        this._services = services;
        this._sessionAccessor = sessionAccessor;
    }

    abstract registerRoutes(routes: TRoute[], options?: RegisterRoutesOptions): void;

    abstract get routes(): TRoute[];

    abstract registerNavigationItems(navigationItems: TNavigationItem[], options?: RegisterNavigationItemsOptions): void;

    abstract getNavigationItems(menuId?: string): TNavigationItem[];

    get mode() {
        return this._mode;
    }

    get logger() {
        return this._logger;
    }

    get eventBus() {
        return this._eventBus;
    }

    get services() {
        return this._services;
    }

    getService(serviceName: string) {
        return this._services[serviceName];
    }

    getSession() {
        if (!this._sessionAccessor) {
            throw new Error("[squide] Cannot retrieve the session because no session accessor has been provided");
        }

        return this._sessionAccessor();
    }

    // Prefixed by _ to indicate that it's considered as an "internal" method.
    _completeRegistration() {
        this._logger.debug("[squide] Completed modules registration.");
    }
}
