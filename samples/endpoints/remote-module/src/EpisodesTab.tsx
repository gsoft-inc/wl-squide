import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

interface Episode {
    id: number;
    name: string;
    episode: string;
}

export function EpisodesTab() {
    const { data: episodes } = useSuspenseQuery({ queryKey: ["/api/episode/1,2,3,4,5,6,7"], queryFn: () => {
        return axios
            .get("/api/episode/1,2,3,4,5,6,7")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <div>
            <p>Fetching from <code>@endpoints/remote-module</code></p>
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
