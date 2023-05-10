import { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

export class RouteRegistry {
    #routes: RootRoute[];

    constructor() {
        this.#routes = [];
    }

    add(routes: RootRoute[]) {
        // Create a new array so the routes array is immutable.
        this.#routes = [...this.#routes, ...routes];
    }

    get routes() {
        return this.#routes;
    }
}
