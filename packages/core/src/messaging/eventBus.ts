import { EventEmitter } from "eventemitter3";
import type { Logger } from "../logging/logger.ts";

export type EventName = string | symbol;

export type EventCallbackFunction = (data?: unknown) => void;

export interface EventBusOptions {
    logger?: Logger;
}

export interface AddListenerOptions {
    once?: boolean;
}

export interface RemoveListenerOptions {
    once?: boolean;
}

export class EventBus<TEventNames extends EventName = EventName> {
    readonly #eventEmitter: EventEmitter;
    #logger?: Logger;

    constructor({ logger }: EventBusOptions = {}) {
        this.#eventEmitter = new EventEmitter();
        this.#logger = logger;
    }

    addListener(eventName: TEventNames, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
        if (once === true) {
            this.#eventEmitter.once(eventName, callback);
        } else {
            this.#eventEmitter.addListener(eventName, callback);
        }
    }

    removeListener(eventName: TEventNames, callback: EventCallbackFunction, { once }: RemoveListenerOptions = {}) {
        this.#eventEmitter.removeListener(eventName, callback, once);
    }

    dispatch(eventName: TEventNames, data?: unknown) {
        this.#logger?.debug(`[squide] - Dispatching event "${String(eventName)}"`, data);

        this.#eventEmitter.emit(eventName, data);
    }
}
