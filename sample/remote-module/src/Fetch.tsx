import { useLoaderData } from "react-router-dom";

interface Character {
    id: number;
    name: string;
    species: string;
}

export default function Fetch() {
    const characters = useLoaderData() as Character[];

    return (
        <div>
            <h2>Fetch</h2>
            <p>An example fetching data with React Router loaders.</p>
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
        </div>
    );
}
