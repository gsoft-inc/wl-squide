import { EventBus } from "../messaging/eventBus.ts";
import type { Logger } from "../logging/logger.ts";
import { RuntimeLogger } from "./RuntimeLogger.ts";

export type SessionAccessorFunction = () => unknown;

export interface RuntimeOptions {
    loggers?: Logger[];
    services?: Record<string, unknown>;
    sessionAccessor?: SessionAccessorFunction;
}

export abstract class AbstractRuntime<TRoute = unknown, TNavigationItem = unknown> {
    protected _logger: RuntimeLogger;
    protected _eventBus: EventBus;
    protected _services: Record<string, unknown>;
    protected _sessionAccessor?: SessionAccessorFunction;

    constructor({ loggers, services = {}, sessionAccessor }: RuntimeOptions = {}) {
        this._logger = new RuntimeLogger(loggers);
        this._eventBus = new EventBus({ logger: this._logger });
        this._services = services;
        this._sessionAccessor = sessionAccessor;
    }

    abstract registerRoutes(routes: TRoute[]): void;

    abstract get routes(): TRoute[];

    abstract registerNavigationItems(navigationItems: TNavigationItem[]): void;

    abstract get navigationItems(): TNavigationItem[];

    get logger() {
        return this._logger;
    }

    get eventBus() {
        return this._eventBus;
    }

    getService(serviceName: string) {
        return this._services[serviceName];
    }

    getSession() {
        if (!this._sessionAccessor) {
            throw new Error("[shell] Cannot retrieve the session because no session accessor has been provided");
        }

        return this._sessionAccessor();
    }
}
