import { useLoaderData } from "react-router-dom";

interface Character {
    id: number;
    name: string;
    species: string;
}

export default function Fetch() {
    const characters = useLoaderData() as Character[];

    return (
        <main>
            <h2>Fetch</h2>
            <div>
                {characters.map(x => {
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
        </main>
    );
}
