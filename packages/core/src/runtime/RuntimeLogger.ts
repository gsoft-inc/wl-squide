import type { Logger } from "../logging/logger.ts";

export class RuntimeLogger {
    readonly #loggers: Logger[];

    constructor(loggers: Logger[] = []) {
        // Filter out undefined values.
        this.#loggers = loggers.map(x => x);
    }

    #log(action: (logger: Logger) => Promise<unknown>) {
        return Promise.allSettled(this.#loggers.map(x => action(x)));
    }

    debug(log: string, ...rest: unknown[]) {
        return this.#log(x => x.debug(log, ...rest));
    }

    information(log: string, ...rest: unknown[]) {
        return this.#log(x => x.information(log, ...rest));
    }

    warning(log: string, ...rest: unknown[]) {
        return this.#log(x => x.warning(log, ...rest));
    }

    error(log: string, ...rest: unknown[]) {
        return this.#log(x => x.error(log, ...rest));
    }

    critical(log: string, ...rest: unknown[]) {
        return this.#log(x => x.critical(log, ...rest));
    }

    use(names: string[]) {
        const activeLoggers = this.#loggers.filter(x => names.includes(x.name));

        return new RuntimeLogger(activeLoggers);
    }
}
