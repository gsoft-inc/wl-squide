import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export interface LogoutPageProps {
    host?: string;
}

export function LogoutPage({ host }: LogoutPageProps) {
    const { t } = useTranslation("LogoutPage");

    return (
        <>
            <h1>{t("title")}</h1>
            {host && <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>
                <Trans
                    i18nKey="LogoutPage:servedBy"
                    shouldUnescape
                    values={{ host }}
                    components={{ code: <code /> }}
                />
            </p>}
            <div>{t("message")}</div>
            <Link to="/login">{t("loginButtonLabel")}</Link>
        </>
    );
}

export const Component = LogoutPage;
