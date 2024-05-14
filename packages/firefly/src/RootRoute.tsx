import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";
import { useIsActiveRouteProtected } from "./useIsActiveRouteProtected.ts";

export function RootRoute() {
    const state = useAppRouterState();
    const isActiveRouteProtected = useIsActiveRouteProtected(state.areModulesReady);

    const dispatch = useAppRouterDispatcher();

    useEffect(() => {
        // Dispatching the active route visibility must be done in a route because React Router's useLocation
        // hook throws if it's not called from a child of the router component.
        dispatch({ type: isActiveRouteProtected ? "active-route-is-protected" : "active-route-is-public" });
    }, [isActiveRouteProtected, dispatch]);

    return (
        <Outlet />
    );
}
