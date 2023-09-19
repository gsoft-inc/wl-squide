import { useAppRouter } from "@sample/shell";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { lazy } from "react";
import { RouterProvider } from "react-router-dom";
import { sessionManager } from "./session.ts";

const Home = lazy(() => import("./Home.tsx"));

export function App() {
    // Re-render the app once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router.
    const isReady = useAreModulesReady();

    const router = useAppRouter(sessionManager, {
        managedRoutes: [
            {
                index: true,
                element: <Home />
            }
        ]
    });

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
