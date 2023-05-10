export enum LogLevel {
    debug = 0,
    information = 1,
    warning = 2,
    error = 3,
    critical = 4
}

export interface Logger {
    debug: (log: string, ...rest: unknown[]) => Promise<unknown>;
    information: (log: string, ...rest: unknown[]) => Promise<unknown>;
    warning: (log: string, ...rest: unknown[]) => Promise<unknown>;
    error: (log: string, ...rest: unknown[]) => Promise<unknown>;
    critical: (log: string, ...rest: unknown[]) => Promise<unknown>;
}
