import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { BootstrappingErrorBoundary } from "./BootstrappingErrorBoundary.tsx";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter
            fallbackElement={<Loading />}
            errorElement={<BootstrappingErrorBoundary />}
            waitForMsw={false}
        />
    );
}
