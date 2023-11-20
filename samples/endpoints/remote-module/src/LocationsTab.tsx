import { fetchJson, useTelemetryService } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Location {
    id: number;
    name: string;
    type: string;
}

export function LocationsTab() {
    const telemetryService = useTelemetryService();

    useEffect(() => {
        telemetryService?.track("Mounting LocationsTab from remote-1.");
    }, [telemetryService]);

    const { data: locations } = useSuspenseQuery({ queryKey: ["/api/location/1,2,3"], queryFn: () => {
        return fetchJson("/api/location/1,2,3");
    } });

    return (
        <div>
            <h2>Locations</h2>
            <p style={{ backgroundColor: "purple", color: "white", width: "fit-content" }}>This tab is served by <code>@endpoints/remote-module</code></p>
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
