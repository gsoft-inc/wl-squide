import { useAppRouter } from "@sample/shell";
import { Suspense, lazy } from "react";
import { RouterProvider } from "react-router-dom";
import { sessionManager } from "./session.ts";

const DevHome = lazy(() => import("./DevHome.tsx"));

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
        <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider
                router={router}
                fallbackElement={<div>Loading...</div>}
            />
        </Suspense>
    );
}
