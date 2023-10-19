import { setupWorker, type RestHandler } from "msw";

export function startMsw(moduleRequestHandlers: RestHandler[]) {
    const worker = setupWorker(...moduleRequestHandlers);

    worker.start();
}
