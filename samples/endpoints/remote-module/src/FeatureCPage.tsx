import { useTelemetryService } from "@endpoints/shared";
import { useEffect } from "react";

export function FeatureCPage() {
    const telemetryService = useTelemetryService();

    useEffect(() => {
        telemetryService?.track("Mounting FeatureBPage from remote-1.");
    }, [telemetryService]);

    return (
        <>
            <h1>FeatureC page</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/remote-module</code></p>
            <p>This page is only available if the <code>featureC</code> flag is active.</p>
        </>
    );
}

export const Component = FeatureCPage;
