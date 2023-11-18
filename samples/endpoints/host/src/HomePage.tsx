import { fetchJson } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function HomePage() {
    const { t } = useTranslation("HomePage");

    const { data: characters } = useSuspenseQuery({ queryKey: ["/api/character/1,2,3,4,5"], queryFn: () => {
        return fetchJson("/api/character/1,2,3,4,5");
    } });

    return (
        <div>
            <h2>{t("title")}</h2>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>
                <Trans
                    i18nKey="HomePage:servedBy"
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
