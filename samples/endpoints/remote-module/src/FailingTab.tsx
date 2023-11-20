import { fetchJson } from "@endpoints/shared";
import { useI18nextInstance } from "@squide/i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { i18NextInstanceKey } from "./i18next.ts";

export function FailingTab() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("EpisodeTab", { i18n: i18nextInstance });

    useSuspenseQuery({ queryKey: ["/api/location/failing"], queryFn: () => {
        return fetchJson("/api/location/failing");
    } });

    return (
        <>
            <h2>{t("title")}</h2>
            <div>{t("message")}</div>
        </>
    );
}
