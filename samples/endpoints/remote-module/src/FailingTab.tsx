import { fetchJson } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function FailingTab() {
    useSuspenseQuery({ queryKey: ["/api/location/failing"], queryFn: () => {
        return fetchJson("/api/location/failing");
    } });

}
