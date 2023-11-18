import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function AnonymousPage() {
    const { t } = useTranslation("AnonymousPage");

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
