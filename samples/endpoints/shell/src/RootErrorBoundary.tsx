import { useLogger } from "@squide/firefly";
import { useCallback } from "react";
import { isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

function getErrorMessage(error: unknown) {
    if (isRouteErrorResponse(error)) {
        return `${error.status} ${error.statusText}`;
    }

    return error instanceof Error
        ? error.message
        : JSON.stringify(error);
}

export function RootErrorBoundary() {
    const error = useRouteError() as Error;
    const location = useLocation();
    const logger = useLogger();

    const handleReloadButtonClick = useCallback(() => {
        window.location.reload();
    }, []);

    logger.error(`[shell] An unmanaged error occurred while rendering the route with path ${location.pathname}`, error);

    return (
        <div>
            <h2>Unmanaged error</h2>
            <p style={{ color: "red" }}>An unmanaged error occurred and the application is broken, try refreshing your browser.</p>
            <p style={{ color: "red" }}><span role="img" aria-label="pointer">👉</span> {getErrorMessage(error)}</p>
            <p style={{ color: "gray" }}><code>{error.stack}</code></p>
            <br />
            <button type="button" onClick={handleReloadButtonClick}>Reload</button>
        </div>
    );
}
