import { setupWorker, type RestHandler, type StartOptions } from "msw";
import { hostRequestHandlers } from "./handlers.ts";

export function startMsw(moduleRequestHandlers: RestHandler[], options?: StartOptions) {
    const worker = setupWorker(...hostRequestHandlers, ...moduleRequestHandlers);

    worker.start(options);
}
