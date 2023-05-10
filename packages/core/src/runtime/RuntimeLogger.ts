import type { Logger } from "../logging/logger.ts";

export class RuntimeLogger {
    private loggers: Logger[];

    constructor(loggers: Logger[] = []) {
        this.loggers = loggers;
    }

    private log(action: (logger: Logger) => Promise<unknown>) {
        return Promise.allSettled(this.loggers.map(x => action(x)));
    }

    debug(log: string, ...rest: unknown[]) {
        return this.log(x => x.debug(log, ...rest));
    }

    information(log: string, ...rest: unknown[]) {
        return this.log(x => x.information(log, ...rest));
    }

    warning(log: string, ...rest: unknown[]) {
        return this.log(x => x.warning(log, ...rest));
    }

    error(log: string, ...rest: unknown[]) {
        return this.log(x => x.error(log, ...rest));
    }

    critical(log: string, ...rest: unknown[]) {
        return this.log(x => x.critical(log, ...rest));
    }
}
