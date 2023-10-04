import { BackgroundColorContext } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { DevHome } from "./DevHome.tsx";
import { sessionManager } from "./session.ts";

export function App() {
    const router = useAppRouter(sessionManager, {
        managedRoutes: [
            {
                index: true,
                element: <DevHome />
            }
        ]
    });

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
