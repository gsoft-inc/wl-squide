import { setupWorker, type RestHandler, type StartOptions } from "msw";

export function startMsw(requestHandlers: RestHandler[], options?: StartOptions) {
    const worker = setupWorker(...requestHandlers);

    worker.start(options);
}
