import { setupWorker, type RestHandler } from "msw";

export function startMsw(requestHandlers: RestHandler[]) {
    const worker = setupWorker(...requestHandlers);

    worker.start();
}
