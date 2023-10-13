import { useRoutes } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function useAppRouter() {
    const routes = useRoutes();

    // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    if (!areModulesReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider router={router} />
    );
}
