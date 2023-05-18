import { EventEmitter } from "eventemitter3";
import type { Logger } from "../logging/logger.ts";

export type ValidEventTypes = EventEmitter.ValidEventTypes;
export type EventNames<EventTypes extends ValidEventTypes> = EventEmitter.EventNames<EventTypes>;
export type EventArgs<EventTypes extends ValidEventTypes> = EventEmitter.EventArgs<EventTypes, EventNames<EventTypes>>;
export type EventListener<EventTypes extends ValidEventTypes> = EventEmitter.EventListener<EventTypes, EventNames<EventTypes>>;

export interface EventBusOptions {
    logger?: Logger;
}

export interface AddListenerOptions {
    once?: boolean;
}

export interface RemoveListenerOptions {
    once?: boolean;
}

export class EventBus<EventTypes extends ValidEventTypes = string | symbol> {
    readonly #eventEmitter: EventEmitter<EventTypes>;
    #logger?: Logger;

    constructor({ logger }: EventBusOptions = {}) {
        this.#eventEmitter = new EventEmitter<EventTypes>();
        this.#logger = logger;
    }

    addListener(eventName: EventNames<EventTypes>, callback: EventListener<EventTypes>, { once }: AddListenerOptions = {}) {
        if (once === true) {
            this.#eventEmitter.once(eventName, callback);
        } else {
            this.#eventEmitter.addListener(eventName, callback);
        }
    }

    removeListener(eventName: EventNames<EventTypes>, callback: EventListener<EventTypes>, { once }: RemoveListenerOptions = {}) {
        this.#eventEmitter.removeListener(eventName, callback, once);
    }

    dispatch(eventName: EventNames<EventTypes>, ...data: EventArgs<EventTypes>) {
        this.#logger?.debug(`[squide] - Dispatching event "${String(eventName)}"`, data);

        this.#eventEmitter.emit(eventName, ...data);
    }
}
