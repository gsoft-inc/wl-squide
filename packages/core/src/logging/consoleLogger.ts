import { LogLevel, type Logger } from "./logger.ts";

/**
 * @example
 * import { ConsoleLogger, LogLevel } from "wmfnext-shell";
 *
 * const logger = new ConsoleLogger(Loglevel.debug);
 *
 * logger.debug2("Debug log", { foo: "bar" });
 * logger.information("Info log");
 * logger.warning("Warning log");
 * logger.error("Error log");
 * logger.critical("Critical log");
 */
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
