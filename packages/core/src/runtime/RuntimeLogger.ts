import type { Logger } from "../logging/index.ts";

export class RuntimeLogger {
    private loggers: Logger[];

    constructor(loggers: Logger[] = []) {
        this.loggers = loggers;
    }

    private log(action: (logger: Logger) => Promise<unknown>): Promise<PromiseSettledResult<unknown>[]> {
        return Promise.allSettled(this.loggers.map((x: Logger) => action(x)));
    }

    debug(log: string, ...rest: unknown[]): Promise<PromiseSettledResult<unknown>[]> {
        return this.log((x: Logger) => x.debug(log, ...rest));
    }

    information(log: string, ...rest: unknown[]): Promise<PromiseSettledResult<unknown>[]> {
        return this.log((x: Logger) => x.information(log, ...rest));
    }

    warning(log: string, ...rest: unknown[]): Promise<PromiseSettledResult<unknown>[]> {
        return this.log((x: Logger) => x.warning(log, ...rest));
    }

    error(log: string, ...rest: unknown[]): Promise<PromiseSettledResult<unknown>[]> {
        return this.log((x: Logger) => x.error(log, ...rest));
    }

    critical(log: string, ...rest: unknown[]): Promise<PromiseSettledResult<unknown>[]> {
        return this.log((x: Logger) => x.critical(log, ...rest));
    }
}
