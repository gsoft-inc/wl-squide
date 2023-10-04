import { BackgroundColorContext } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { Suspense, lazy } from "react";
import { RouterProvider } from "react-router-dom";
import { sessionManager } from "./session.ts";

const Home = lazy(() => import("./Home.tsx"));

export function App() {
    // Re-render the app once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    const router = useAppRouter(sessionManager, {
        managedRoutes: [
            {
                index: true,
                element: <Home />
            }
        ]
    });

    if (!areModulesReady) {
        return <div>Loading...</div>;
    }

    return (
        <BackgroundColorContext.Provider value="blue">
            <Suspense fallback={<div>Loading...</div>}>
                <RouterProvider
                    router={router}
                    fallbackElement={<div>Loading...</div>}
                />
            </Suspense>
        </BackgroundColorContext.Provider>
    );
}
