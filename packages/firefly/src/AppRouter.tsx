import { useLogger } from "@squide/core";
import { findRouteByPath, useRoutes, type Route } from "@squide/react-router";
import { useEffect, useMemo, type ReactElement } from "react";
import type { RouterProviderProps } from "react-router-dom";
import { AppRouterDispatcherContext, AppRouterStateContext } from "./AppRouterContext.ts";
import { useAppRouterReducer, type AppRouterDispatch, type AppRouterState } from "./AppRouterReducer.ts";
import { RootRoute } from "./RootRoute.tsx";

export interface AppRouterRenderFunctionArgs {
    routes: Route[];
}

export type RenderRouterProviderFunction = (rootRoute: ReactElement, registeredRoutes: Route[], providerProps: Omit<RouterProviderProps, "router">, state: AppRouterState, dispatch: AppRouterDispatch) => ReactElement;

export interface AppRouterProps {
    waitForMsw: boolean;
    waitForPublicData: boolean;
    waitForProtectedData: boolean;
    children: RenderRouterProviderFunction;
}

export function AppRouter(props: AppRouterProps) {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        children: renderRouterProvider
    } = props;

    const [state, dispatch] = useAppRouterReducer(waitForMsw, waitForPublicData, waitForProtectedData);

    const logger = useLogger();
    const routes = useRoutes();

    useEffect(() => {
        logger.debug("[squide] AppRouter state updated:", state);
    }, [state, logger]);

    useEffect(() => {
        // HACK:
        // When there's a direct hit on a deferred route, since the route has not been registered yet (because it's a deferred registration),
        // the React Router router instance doesn't know about that route and will therefore fallback to the no match route.
        // If there's isn't a custom no match route defined with path="*", React Router will fallback it's default no match router instead
        // of rendering a route which will break the AppRouter component.
        // To circumvent this issue, if the application doesn't register a custom no match route, an Error is thrown.
        if (state.areModulesRegistered && !findRouteByPath(routes, "*")) {
            throw new Error("[squide] For the AppRouter component to work properly, the application must define a custom no match route. For additional information, refer to: https://reactrouter.com/en/main/start/tutorial#handling-not-found-errors.");
        }
    }, [state, routes]);

    // The state is required as a dependency of the useMemo otherwise re-renders will be missed when the state change.
    const routerProvider = useMemo(() => renderRouterProvider(<RootRoute />, routes, {}, state, dispatch), [routes, renderRouterProvider, state, dispatch]);

    return (
        <AppRouterDispatcherContext.Provider value={dispatch}>
            <AppRouterStateContext.Provider value={state}>
                {routerProvider}
            </AppRouterStateContext.Provider>
        </AppRouterDispatcherContext.Provider>
    );
}
