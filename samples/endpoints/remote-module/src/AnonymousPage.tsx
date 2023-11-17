import { Trans, useTranslation } from "react-i18next";

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
        </>
    );
}

export const Component = AnonymousPage;
