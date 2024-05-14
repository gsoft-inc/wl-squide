import { isNil } from "@squide/core";
import { createContext, useContext, type Dispatch } from "react";
import type { AppRouterAction, AppRouterState } from "./AppRouterReducer.ts";

export const AppRouterStateContext = createContext<AppRouterState | undefined>(undefined);

export function useAppRouterState() {
    const state = useContext(AppRouterStateContext);

    if (isNil(state)) {
        throw new Error("[squide] The useAppRouterState hook must be called by a children of the AppRouter component.");
    }

    return state;
}

export const AppRouterDispatcherContext = createContext<Dispatch<AppRouterAction> | undefined>(undefined);

export function useAppRouterDispatcher() {
    const dispatch = useContext(AppRouterDispatcherContext);

    if (isNil(dispatch)) {
        throw new Error("[squide] The useAppRouterDispatcher hook must be called by a children of the AppRouter component.");
    }

    return dispatch;
}
