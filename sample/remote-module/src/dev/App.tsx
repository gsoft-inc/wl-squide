import { BackgroundColorContext, type Session } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { Suspense, useCallback } from "react";
import { RouterProvider } from "react-router-dom";
import { DevHome } from "./DevHome.tsx";
import { sessionManager } from "./session.ts";

export function App() {
    const onLogin = useCallback(async (username: string) => {
        const session: Session = {
            user: {
                name: username
            }
        };

        sessionManager.setSession(session);
    }, []);

    const onLogout = useCallback(async () => {
        sessionManager.clearSession();
    }, []);

    const router = useAppRouter(onLogin, onLogout, {
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
