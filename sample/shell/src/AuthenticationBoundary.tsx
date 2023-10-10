import { useIsAuthenticated, useLogger } from "@squide/react-router";
import { Navigate, Outlet } from "react-router-dom";

export function AuthenticationBoundary() {
    const logger = useLogger();

    if (useIsAuthenticated()) {
        return <Outlet />;
    }

    logger.debug("[shell] The user is not authenticated, redirecting to the login page.");

    return <Navigate to="/login" />;
}
