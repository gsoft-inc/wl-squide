import { setupWorker, type RestHandler, type StartOptions } from "msw";

export function startMsw(moduleRequestHandlers: RestHandler[], options?: StartOptions) {
    const worker = setupWorker(...moduleRequestHandlers);

    worker.start(options);
}
