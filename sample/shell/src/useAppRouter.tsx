import { useRoutes } from "@squide/react-router";
import { useMemo } from "react";
import { createBrowserRouter } from "react-router-dom";
// Importing the Router type to prevent: error TS2742: The inferred type of 'useAppRouter' cannot be named without a reference
import type { Router } from "@remix-run/router";

export function useAppRouter(): Router {
    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    return router;
}
