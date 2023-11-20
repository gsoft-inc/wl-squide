import { useTelemetryService } from "@endpoints/shared";
import { useEffect } from "react";

export function FeatureBPage() {
    const telemetryService = useTelemetryService();

    useEffect(() => {
        telemetryService?.track("Mounting FeatureBPage from remote-1.");
    }, [telemetryService]);

    return (
        <>
            <h1>FeatureB page</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/remote-module</code></p>
            <p>This page is only available if the <code>featureB</code> flag is active.</p>
        </>
    );
}

export const Component = FeatureBPage;
