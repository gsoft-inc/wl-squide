import { fetchJson } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";

interface Episode {
    id: number;
    name: string;
    episode: string;
}

export function EpisodesTab() {
    const { t } = useTranslation("EpisodeTab");

    const { data: episodes } = useSuspenseQuery({ queryKey: ["/api/episode/1,2"], queryFn: () => {
        return fetchJson("/api/episode/1,2");
    } });

    return (
        <div>
            <h2>{t("title")}</h2>
            <p style={{ backgroundColor: "purple", color: "white", width: "fit-content" }}>
                <Trans
                    i18nKey="EpisodeTab:servedBy"
                    components={{
                        code: <code />
                    }}
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
