import { useTelemetryService } from "@endpoints/shared";
import { useI18nextInstance } from "@squide/i18next";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { i18NextInstanceKey } from "./i18next.ts";

export function AnonymousPage() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("AnonymousPage", { i18n: i18nextInstance });

    const telemetryService = useTelemetryService();

    useEffect(() => {
        telemetryService?.track("Mounting AnonymousPage from remote-1.");
    }, [telemetryService]);

    return (
        <>
            <h1>{t("title")}</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>
                <Trans
                    i18nKey="AnonymousPage:servedBy"
                    components={{
                        code: <code />
                    }}
                />
            </p>
            <Link to="/">Go to the protected home page</Link>
        </>
    );
}

export const Component = AnonymousPage;
