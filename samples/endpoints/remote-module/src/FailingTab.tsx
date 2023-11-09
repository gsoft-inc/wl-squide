import { fetchJson } from "@endpoints/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function FailingTab() {
    useSuspenseQuery({ queryKey: ["/api/location/failing"], queryFn: () => {
        return fetchJson("/api/location/failing");
    } });

    return (
        <>
            <h2>Expected to fail!</h2>
            <div>Something went wront because the API call should have failed and you shouldn't see this!</div>
        </>
    );
}
