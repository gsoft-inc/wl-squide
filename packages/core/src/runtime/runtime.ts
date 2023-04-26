export type SessionAccessorFunction = () => Readonly<unknown>;

export interface RuntimeOptions {
    // loggers?: Logger[];
    services?: Record<string, unknown>;
    sessionAccessor?: SessionAccessorFunction;
}

export class Runtime {
    protected _services?: Record<string, unknown>;
    protected _sessionAccessor?: SessionAccessorFunction;

    constructor({ services, sessionAccessor }: RuntimeOptions = {}) {
        this._services = services;
        this._sessionAccessor = sessionAccessor;
    }
}
