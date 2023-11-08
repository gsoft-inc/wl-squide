import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter
            fallbackElement={<Loading />}
            errorElement={<AppRouterErrorBoundary />}
            waitForMsw={false}
        />
    );
}
