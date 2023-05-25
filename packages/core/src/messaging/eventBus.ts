import { EventEmitter } from "eventemitter3";
import type { Logger } from "../logging/logger.ts";

export type EventTypes = string | symbol;
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

export class EventBus<EventNames extends EventTypes = EventTypes> {
    readonly #eventEmitter: EventEmitter;
    #logger?: Logger;

    constructor({ logger }: EventBusOptions = {}) {
        this.#eventEmitter = new EventEmitter();
        this.#logger = logger;
    }

    addListener(eventName: EventNames, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
        if (once === true) {
            this.#eventEmitter.once(eventName, callback);
        } else {
            this.#eventEmitter.addListener(eventName, callback);
        }
    }

    removeListener(eventName: EventNames, callback: EventCallbackFunction, { once }: RemoveListenerOptions = {}) {
        this.#eventEmitter.removeListener(eventName, callback, once);
    }

    dispatch(eventName: EventNames, data?: unknown) {
        this.#logger?.debug(`[squide] - Dispatching event "${String(eventName)}"`, data);

        this.#eventEmitter.emit(eventName, data);
    }
}
