import type { Runtime } from "../runtime/runtime.ts";
import { LogLevel, Logger } from "./logger.ts";

export class ConsoleLogger extends Logger {
    readonly #logLevel: LogLevel;

    constructor(runtime: Runtime, logLevel: LogLevel = LogLevel.debug) {
        super(ConsoleLogger.name, runtime);

        this.#logLevel = logLevel;
    }

    debug(log: string, ...rest: unknown[]) {
        if (this.#logLevel <= LogLevel.debug) {
            console.log(log, ...rest);
        }

        return Promise.resolve();
    }

    information(log: string, ...rest: unknown[]) {
        if (this.#logLevel <= LogLevel.information) {
            console.info(log, ...rest);
        }

        return Promise.resolve();
    }

    warning(log: string, ...rest: unknown[]) {
        if (this.#logLevel <= LogLevel.warning) {
            console.warn(log, ...rest);
        }

        return Promise.resolve();
    }

    error(log: string, ...rest: unknown[]) {
        if (this.#logLevel <= LogLevel.error) {
            console.error(log, ...rest);
        }

        return Promise.resolve();
    }

    critical(log: string, ...rest: unknown[]) {
        if (this.#logLevel <= LogLevel.critical) {
            console.error(log, ...rest);
        }

        return Promise.resolve();
    }
}
