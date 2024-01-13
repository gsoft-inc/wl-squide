import { useMemo } from "react";
import type { Logger } from "../logging/logger.ts";
import { useLogger } from "./useLogger.ts";

// This is an internal class to ensure that when the application is in React strict mode
// and the application is being runned in development, no messages are logged twice.
export class LogOnceLogger implements Logger {
    readonly #logger: Logger;
    readonly #hasLoggedOnce = new Set<string>();

    constructor(logger: Logger) {
        this.#logger = logger;
    }

    #logOnce(key: string, action: () => Promise<unknown>) {
        if (!this.#hasLoggedOnce.has(key)) {
            this.#hasLoggedOnce.add(key);

            return action();
        }

        return Promise.resolve();
    }

    debug(log: string, ...rest: unknown[]) {
        return this.#logger.debug(log, ...rest);
    }

    debugOnce(key: string, log: string, ...rest: unknown[]) {
        this.#logOnce(key, () => this.debug(log, ...rest));
    }

    information(log: string, ...rest: unknown[]) {
        return this.#logger.information(log, ...rest);
    }

    informationOnce(key: string, log: string, ...rest: unknown[]) {
        this.#logOnce(key, () => this.information(log, ...rest));
    }

    warning(log: string, ...rest: unknown[]) {
        return this.#logger.warning(log, ...rest);
    }

    warningOnce(key: string, log: string, ...rest: unknown[]) {
        this.#logOnce(key, () => this.warning(log, ...rest));
    }

    error(log: string, ...rest: unknown[]) {
        return this.#logger.error(log, ...rest);
    }

    errorOnce(key: string, log: string, ...rest: unknown[]) {
        this.#logOnce(key, () => this.error(log, ...rest));
    }

    critical(log: string, ...rest: unknown[]) {
        return this.#logger.critical(log, ...rest);
    }

    criticalOnce(key: string, log: string, ...rest: unknown[]) {
        this.#logOnce(key, () => this.critical(log, ...rest));
    }
}

export function useLogOnceLogger() {
    const logger = useLogger();

    return useMemo(() => {
        return new LogOnceLogger(logger);
    }, [logger]);
}
