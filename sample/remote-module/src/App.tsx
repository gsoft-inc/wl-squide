import { useAppRouter } from "@sample/shared";
import { RouterProvider } from "react-router-dom";
import { sessionManager } from "./session.ts";

function DevHome() {
    return (
        <div>
            <h2>Remote module development home page</h2>
            <p>Hey!</p>
        </div>
    );
}

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
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
