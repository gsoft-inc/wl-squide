import { BackgroundColorContext, type Session } from "@sample/shared";
import { InvalidCredentialsError, useAppRouter } from "@sample/shell";
import { useIsMswStarted } from "@squide/msw";
import { useRuntime, type Runtime } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { RouterProvider, matchRoutes } from "react-router-dom";
import { sessionManager } from "./session.ts";

export function App() {
    const [isReady, setIsReady] = useState(false);

    const runtime = useRuntime() as Runtime;

    // Re-render the app once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    // Re-render the app once MSW is started.
    // Otherwise, the API calls will return a 404 status.
    const isMswStarted = useIsMswStarted(process.env.USE_MSW as unknown as boolean);

    const onLogin = useCallback(async (username: string, password: string) => {
        try {
            await axios.post("/login", {
                username,
                password
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new InvalidCredentialsError();
                }
            }

            throw new Error("An unknown error happened while trying to login a user");
        }
    }, []);

    const onLogout = useCallback(async () => {
        sessionManager.clearSession();
    }, []);

    const router = useAppRouter(onLogin, onLogout, {
        managedRoutes: [
            {
                index: true,
                lazy: () => import("./Home.tsx")
            }
        ]
    });

    /*
    ISSUES:
        - There's no match for the index route
        - Doesn't work when we go from a public route to a private route
            -> That's because there's no redirect to the login yet.
        - What about the NoMatch route?
        - Probably that in an unkown scenario that would be best to try to get the session? Otherwise we could render and end up with
            unmanaged errors?
        - Add a payment status endpoint to showcase having multiple global data
    */

    useEffect(() => {
        if (areModulesReady && isMswStarted) {
            // getActiveRouteVisibility

            // const location = useLocation();
            const location = window.location;

            console.log("**** location: ", location);

            const matchingRoutes = matchRoutes(runtime.routes, location) ?? [];

            console.log("**** matchingRoutes:", matchingRoutes);

            if (matchingRoutes.length > 0) {
                // When a route is nested, it also returns all the parts that constistuate the whole route (for example the layouts).
                // We only want to know the visiblity of the deepest root route.
                const rootRoute = matchingRoutes.findLast(x => x.route.type === "root");

                if (rootRoute!.route.visibility === "authenticated") {
                    axios.get("/session").then(({ data }) => {
                        const session: Session = {
                            user: {
                                name: data.username
                            }
                        };

                        sessionManager.setSession(session);

                        setIsReady(true);
                    });
                } else {
                    setIsReady(true);
                }
            } else {
                throw new Error(`[shell] There's no matching route for the location: "${location}". Did you add routes to React Router without using the runtime.registerRoutes() function?`);
            }
        }
    }, [areModulesReady, isMswStarted, runtime.routes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <BackgroundColorContext.Provider value="blue">
            <RouterProvider
                router={router}
                fallbackElement={null}
            />
        </BackgroundColorContext.Provider>
    );
}
