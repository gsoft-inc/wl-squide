import { BackgroundColorContext, type Session } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { useIsMswStarted } from "@squide/msw";
import { useLogger, useRuntime, type Runtime } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import axios from "axios";
import { useEffect, useState } from "react";
import { RouterProvider, matchRoutes } from "react-router-dom";
import { sessionManager } from "./session.ts";

export function App() {
    const [isReady, setIsReady] = useState(false);

    const runtime = useRuntime() as Runtime;
    const logger = useLogger();

    // Re-render the app once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    // Re-render the app once MSW is started.
    // Otherwise, the API calls will return a 404 status.
    const isMswStarted = useIsMswStarted(process.env.USE_MSW as unknown as boolean);

    const router = useAppRouter();

    useEffect(() => {
        if (areModulesReady && isMswStarted) {
            // 2 hooks:
            // getActiveRouteVisibility -> "public" | "protected" | unknown
            // isActiveRouteProtected -> true if protected, false otherwise | throw an Error when unknown

            const location = window.location;
            const matchingRoutes = matchRoutes(runtime.routes, location) ?? [];

            logger.debug(`[shell] Found ${matchingRoutes.length} matching route${matchingRoutes.length > 0 ? "s" : ""}:`, matchingRoutes);

            if (matchingRoutes.length > 0) {
                // When a route is nested, it also returns all the parts that constistuate the whole route (for example the layouts and the boundaries).
                // We only want to know the visiblity of the actual route that has been requested, which is always the last entry.
                const activeRoute = matchingRoutes[matchingRoutes.length - 1]!.route;

                logger.debug(`[shell] The active route is "${activeRoute.visibility}":`, activeRoute);

                if (activeRoute!.visibility === "authenticated") {
                    logger.debug(`[shell] Fetching session data as "${location}" is a protected route.`);

                    axios.get("/session")
                        .then(({ data }) => {
                            const session: Session = {
                                user: {
                                    name: data.username
                                }
                            };

                            logger.debug("[shell] Loaded the user session:", session);

                            sessionManager.setSession(session);

                            setIsReady(true);
                        })
                        .catch((error: unknown) => {
                            setIsReady(true);

                            if (axios.isAxiosError(error) && error.response?.status === 401) {
                                // The authentication boundary will redirect to the login page.
                                return;
                            }

                            throw error;
                        });
                } else {
                    setIsReady(true);
                }
            } else {
                throw new Error(`[shell] There's no matching route for the location: "${location}". Did you add routes to React Router without using the runtime.registerRoute() function?`);
            }
        }
    }, [areModulesReady, isMswStarted, runtime.routes, router, logger]);

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
