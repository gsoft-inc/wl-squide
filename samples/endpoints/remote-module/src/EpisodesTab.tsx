import { fetchJson } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Episode {
    id: number;
    name: string;
    episode: string;
}

export function EpisodesTab() {
    const { data: episodes } = useSuspenseQuery({ queryKey: ["/api/episode/1,2,3,4,5,6,7"], queryFn: () => {
        return fetchJson("/api/episode/1,2,3,4,5,6,7");
    } });

    return (
        <div>
            <h2>Episodes</h2>
            <p style={{ backgroundColor: "purple", color: "white", width: "fit-content" }}>This tab is served by <code>@endpoints/remote-module</code></p>
            <div>
                {episodes.map((x: Episode) => {
                    return (
                        <div key={x.id}>
                            <span>Id: {x.id}</span>
                            <span> - </span>
                            <span>Name: {x.name}</span>
                            <span> - </span>
                            <span>Episode: {x.episode}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
