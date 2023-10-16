import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function HomePage() {
    const { data: characters } = useSuspenseQuery({ queryKey: ["/api/character/1,2,3,4,5"], queryFn: () => {
        return axios
            .get("/api/character/1,2,3,4,5")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <div>
            <h2>Home</h2>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/host</code></p>
            <div>
                {characters.map((x: Character) => {
                    return (
                        <div key={x.id}>
                            <span>Id: {x.id}</span>
                            <span> - </span>
                            <span>Name: {x.name}</span>
                            <span> - </span>
                            <span>Species: {x.species}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
