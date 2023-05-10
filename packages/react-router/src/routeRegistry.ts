import { RouteObject } from "react-router-dom";

export type Route = RouteObject;

export type RootRoute = Route & {
    hoist?: boolean;
};

export class RouteRegistry {
    private _routes: RootRoute[];

    constructor() {
        this._routes = [];
    }

    add(routes: RootRoute[]) {
        // Create a new array so the routes array is immutable.
        this._routes = [...this._routes, ...routes];
    }

    get routes() {
        return this._routes;
    }
}
