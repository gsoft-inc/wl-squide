import { EventEmitter } from "eventemitter3";
import type { Logger } from "../logging/logger.ts";

export type EventBusPayload = Record<string, unknown> | string;
export type EventBusListener = (data?: EventBusPayload) => void;

export interface EventBusOptions {
    logger?: Logger;
}

export interface AddListenerOptions {
    once?: boolean;
}

export interface RemoveListenerOptions {
    once?: boolean;
}

export class EventBus<EventNames extends string = string> {
    readonly #eventEmitter: EventEmitter;
    #logger?: Logger;

    constructor({ logger }: EventBusOptions = {}) {
        this.#eventEmitter = new EventEmitter();
        this.#logger = logger;
    }

    addListener(eventName: EventNames, callback: EventBusListener, { once }: AddListenerOptions = {}) {
        if (once === true) {
            this.#eventEmitter.once(eventName, callback);
        } else {
            this.#eventEmitter.addListener(eventName, callback);
        }
    }

    removeListener(eventName: EventNames, callback: EventBusListener, { once }: RemoveListenerOptions = {}) {
        this.#eventEmitter.removeListener(eventName, callback, once);
    }

    dispatch(eventName: EventNames, ...data: EventBusPayload[]) {
        this.#logger?.debug(`[squide] - Dispatching event "${String(eventName)}"`, data);

        this.#eventEmitter.emit(eventName, ...data);
    }
}
