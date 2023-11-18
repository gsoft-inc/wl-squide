import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export interface NoMatchPageProps {
    path: string;
    host?: string;
}

export function NoMatchPage({ path, host }: NoMatchPageProps) {
    const { t } = useTranslation("NoMatchPage");

    return (
        <>
            <h1>{t("title")}</h1>
            {host && <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>
                <Trans
                    i18nKey="NoMatchPage:servedBy"
                    shouldUnescape
                    values={{ host }}
                    components={{ code: <code /> }}
                />
            </p>}
            <p>
                <Trans
                    i18nKey="NoMatchPage:message"
                    shouldUnescape
                    values={{ path }}
                />
            </p>
            <Link to="/">{t("goBackLinkLabel")}</Link>
        </>
    );
}

export const Component = NoMatchPage;
