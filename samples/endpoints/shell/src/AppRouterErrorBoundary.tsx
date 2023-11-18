import { useLogger } from "@squide/firefly";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function AppRouterErrorBoundary({ error }: { error?: Error }) {
    const { t } = useTranslation("AppRouterErrorBoundary");

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
            <h2>{t("title")}</h2>
            <p style={{ color: "red" }}>{t("message")}</p>
            <p style={{ color: "red" }}><span role="img" aria-label="pointer">👉</span> {error?.message}</p>
            <p style={{ color: "gray" }}><code>{error?.stack}</code></p>
            <br />
            <button type="button" onClick={handleReloadButtonClick}>{t("reloadButtonLabel")}</button>
        </div>
    );
}
