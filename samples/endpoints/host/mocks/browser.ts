import type { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";

export function startMsw(moduleRequestHandlers: RequestHandler[]) {
    const worker = setupWorker(...moduleRequestHandlers);

    worker.start();
}
