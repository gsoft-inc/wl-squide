import { fetchJson, useTelemetryService } from "@endpoints/shared";
import { useEnvironmentVariable } from "@squide/env-vars";
import { useTracker } from "@squide/firefly";
import { useI18nextInstance } from "@squide/i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { i18NextInstanceKey } from "./i18next.ts";

interface Episode {
    id: number;
    name: string;
    episode: string;
}

export function EpisodesTab() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("EpisodeTab", { i18n: i18nextInstance });

    const rickAndMortyApiBaseUrl = useEnvironmentVariable("rickAndMortyApiBaseUrl");
    const telemetryService = useTelemetryService();

    useEffect(() => {
        telemetryService?.track("Mounting EpisodesTab from remote-1.");
    }, [telemetryService]);

    const { data: episodes } = useSuspenseQuery({ queryKey: [`${rickAndMortyApiBaseUrl}episode/1,2`], queryFn: () => {
        return fetchJson(`${rickAndMortyApiBaseUrl}episode/1,2`);
    } });

    const tracker = useTracker();

    useEffect(() => {
        async function execute() {
            const span = await tracker.startSpan("episodes-tab", {
                startTime: Date.now()
            });

            setTimeout(() => {
                span.addEvent("event-1", {
                    startTime: Date.now()
                });

                span.end();
            }, 15);
        }

        execute();
    }, [tracker]);

    return (
        <div>
            <h2>{t("title")}</h2>
            <p style={{ backgroundColor: "purple", color: "white", width: "fit-content" }}>
                <Trans
                    i18n={i18nextInstance}
                    i18nKey="servedBy"
                    t={t}
                    components={{ code: <code /> }}
                />
            </p>
            <div>
                {episodes.map((x: Episode) => {
                    return (
                        <div key={x.id}>
                            <span>{t("idLabel")}: {x.id}</span>
                            <span> - </span>
                            <span>{t("nameLabel")}: {x.name}</span>
                            <span> - </span>
                            <span>{t("episodeLabel")}: {x.episode}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
