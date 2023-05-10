import { LogLevel } from "./logger.ts";
import type { Logger } from "./logger.ts";

export class ConsoleLogger implements Logger {
    readonly #logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.critical) {
        this.#logLevel = logLevel;
    }

    debug(log: string, ...rest: unknown[]) {
        if (this.#logLevel >= LogLevel.debug) {
            console.log(log, ...rest);
        }

        return Promise.resolve();
    }

    information(log: string, ...rest: unknown[]) {
        if (this.#logLevel >= LogLevel.information) {
            console.info(log, ...rest);
        }

        return Promise.resolve();
    }

    warning(log: string, ...rest: unknown[]) {
        if (this.#logLevel >= LogLevel.warning) {
            console.warn(log, ...rest);
        }

        return Promise.resolve();
    }

    error(log: string, ...rest: unknown[]) {
        if (this.#logLevel >= LogLevel.error) {
            console.error(log, ...rest);
        }

        return Promise.resolve();
    }

    critical(log: string, ...rest: unknown[]) {
        if (this.#logLevel >= LogLevel.critical) {
            console.error(log, ...rest);
        }

        return Promise.resolve();
    }
}
