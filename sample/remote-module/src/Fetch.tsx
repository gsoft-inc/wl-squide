import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function Fetch() {
    const { data: characters } = useSuspenseQuery({ queryKey: ["https://rickandmortyapi.com/api/character/", "1", "2", "3", "4", "5"], queryFn: () => {
        return axios
            .get("https://rickandmortyapi.com/api/character/1,2,3,4,5")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <div>
            <h2>Fetch</h2>
            <p>An example fetching data with React Router loaders.</p>
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

export const Component = Fetch;
