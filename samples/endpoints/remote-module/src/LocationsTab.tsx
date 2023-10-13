import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

interface Location {
    id: number;
    name: string;
    type: string;
}

export function LocationsTab() {
    const { data: locations } = useSuspenseQuery({ queryKey: ["/api/location/1,2,3"], queryFn: () => {
        return axios
            .get("/api/location/1,2,3")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <div>
            <p>Fetching from <code>@endpoints/remote-module</code></p>
            <div>
                {locations.map((x: Location) => {
                    return (
                        <div key={x.id}>
                            <span>Id: {x.id}</span>
                            <span> - </span>
                            <span>Name: {x.name}</span>
                            <span> - </span>
                            <span>Type: {x.type}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
