import { Link, isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

import { useLogger } from "@squide/react-router";

function getErrorMessage(error: unknown) {
    if (isRouteErrorResponse(error)) {
        return `${error.status} ${error.statusText}`;
    }

    return error instanceof Error
        ? error.message
        : JSON.stringify(error);
}

export function RootErrorBoundary() {
    const error = useRouteError();
    const location = useLocation();
    const logger = useLogger();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <div>
                    <h2>404 not found!</h2>
                    <Link to="/">Go back to home</Link>
                </div>
            );
        }
    }

    logger.error(`[sample] An unmanaged error occured while rendering the route with path ${location.pathname}`, error);

    return (
        <div style={{ color: "red" }}>
            <h2>Unmanaged error</h2>
            <p>An unmanaged error occurred and the application is broken, try refreshing your browser.</p>
            <span role="img" aria-label="pointer">👉</span> {getErrorMessage(error)}
        </div>
    );
}
