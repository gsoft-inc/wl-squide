import { useLogger } from "@squide/react-router";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AppRouterErrorBoundary({ error }: { error?: Error }) {
    const logger = useLogger();
    const navigate = useNavigate();

    const handleReloadButtonClick = useCallback(() => {
        navigate(0);
    }, [navigate]);

    useEffect(() => {
        logger.error("[shell] An unmanaged error occurred while bootstrapping the application", error);
    }, [error, logger]);

    return (
        <div>
            <h2>Unmanaged error</h2>
            <p style={{ color: "red" }}>An unmanaged error occurred while bootstrapping the application.</p>
            <p style={{ color: "red" }}><span role="img" aria-label="pointer">👉</span> {error?.message}</p>
            <p style={{ color: "gray" }}><code>{error?.stack}</code></p>
            <br />
            <button type="button" onClick={handleReloadButtonClick}>Reload</button>
        </div>
    );
}
