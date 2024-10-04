import { fetchJson } from "@endpoints/shared";
import { useEnvironmentVariable } from "@squide/env-vars";
import { useTracker } from "@squide/firefly";
import { useI18nextInstance } from "@squide/i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { i18NextInstanceKey } from "./i18next.ts";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function HomePage() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("HomePage", { i18n: i18nextInstance });

    const rickAndMortyApiBaseUrl = useEnvironmentVariable("rickAndMortyApiBaseUrl");

    const { data: characters } = useSuspenseQuery({ queryKey: [`${rickAndMortyApiBaseUrl}character/1,2`], queryFn: () => {
        return fetchJson(`${rickAndMortyApiBaseUrl}character/1,2`);
    } });

    const tracker = useTracker();

    useEffect(() => {
        async function execute() {
            const parentSpan = await tracker.startSpan("render-homepage");

            setTimeout(() => {
                parentSpan.addEvent("event-1", {
                    startTime: Date.now()
                });
            });

            setTimeout(() => {
                parentSpan.addEvent("event-2", {
                    startTime: Date.now()
                });
            }, 15);

            setTimeout(() => {
                parentSpan.addEvent("event-3", {
                    startTime: Date.now()
                });
            }, 30);

            setTimeout(async () => {
                const childSpan = await tracker.startChildSpan("child-span", parentSpan);

                childSpan.addEvent("event-4", {
                    startTime: Date.now()
                });

                setTimeout(() => {
                    childSpan.addEvent("event-5", {
                        startTime: Date.now()
                    });

                    childSpan.end();
                    parentSpan.end();
                }, 15);
            }, 45);
        }

        execute();
    }, [tracker]);

    return (
        <div>
            <h2>{t("title")}</h2>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>
                <Trans
                    i18n={i18nextInstance}
                    i18nKey="servedBy"
                    t={t}
                    components={{ code: <code /> }}
                />
            </p>
            <div>
                {characters.map((x: Character) => {
                    return (
                        <div key={x.id}>
                            <span>{t("idLabel")}: {x.id}</span>
                            <span> - </span>
                            <span>{t("nameLabel")}: {x.name}</span>
                            <span> - </span>
                            <span>{t("speciesLabel")}: {x.species}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
