import { isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

import { useLogger } from "@squide/react-router";

function getErrorMessage(error: unknown) {
    if (isRouteErrorResponse(error)) {
        return `${error.status} ${error.statusText}`;
    }

    return error instanceof Error
        ? error.message
        : JSON.stringify(error);
}

export default function ModuleErrorBoundary() {
    const error = useRouteError();
    const location = useLocation();
    const logger = useLogger();

    logger.error(`[sample] An unmanaged error occurred while rendering the route with path ${location.pathname}`, error);

    return (
        <div style={{ color: "red" }}>
            <h2>Unmanaged error</h2>
            <p>An unmanaged error occured inside a module. Still, other parts of the application are fully functional!</p>
            <span role="img" aria-label="pointer">👉</span> {getErrorMessage(error)}
        </div>
    );
}
