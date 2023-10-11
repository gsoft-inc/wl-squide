import type { Session, SessionManager } from "@sample/shared";
import { useIsMswStarted } from "@squide/msw";
import { useIsMatchingRouteProtected, useLogger, useRoutes } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function useAppRouter(waitForMsw: boolean, sessionManager: SessionManager) {
    const [isReady, setIsReady] = useState(false);

    const logger = useLogger();
    const routes = useRoutes();

    // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    // Ideally "useLocation" would be used so the component re-renderer everytime the location change but it doesn't
    // seem feasible (at least  not easily) as public and private routes go through this component.
    // Anyhow, since all the Workleap apps will authenticate through a third party authentication provider, it
    // doesn't seems like a big deal as the application will be reloaded anyway after the user logged in on the third party.
    const isActiveRouteProtected = useIsMatchingRouteProtected(window.location);

    useEffect(() => {
        if (areModulesReady && isMswStarted) {
            if (isActiveRouteProtected) {
                logger.debug(`[shell] Fetching session data as "${window.location}" is a protected route.`);

                axios.get("/session")
                    .then(({ data }) => {
                        const session: Session = {
                            user: {
                                name: data.username
                            }
                        };

                        logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

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
                logger.debug(`[shell] Passing through as "${window.location}" is a public route.`);

                setIsReady(true);
            }
        }
    }, [areModulesReady, isMswStarted, isActiveRouteProtected, logger, sessionManager]);

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={null}
        />
    );
}
