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

export class EventBus {
    private _eventEmitter: EventEmitter;
    private _logger?: Logger;

    constructor({ logger }: EventBusOptions = {}) {
        this._eventEmitter = new EventEmitter();
        this._logger = logger;
    }

    addListener(eventName: EventName, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
        if (once === true) {
            this._eventEmitter.once(eventName, callback);
        } else {
            this._eventEmitter.addListener(eventName, callback);
        }
    }

    removeListener(eventName: EventName, callback: EventCallbackFunction, { once }: RemoveListenerOptions = {}) {
        this._eventEmitter.removeListener(eventName, callback, once);
    }

    dispatch(eventName: EventName, data?: unknown) {
        this._logger?.debug(`[squide] - Dispatching event "${String(eventName)}"`, data);

        this._eventEmitter.emit(eventName, data);
    }
}
