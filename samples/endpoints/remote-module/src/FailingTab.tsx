import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

export function FailingTab() {
    useSuspenseQuery({ queryKey: ["/api/location/failing"], queryFn: () => {
        return axios
            .get("/api/location/failing")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <>
            <h2>Expected to fail!</h2>
            <div>Something went wront because the API call should have failed and you shouldn't see this!</div>
        </>
    );
}
