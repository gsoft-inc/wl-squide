import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";
import { ToastProvider } from "./toast.tsx";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    return (
        <ToastProvider>
            <FireflyAppRouter
                fallbackElement={<Loading />}
                errorElement={<AppRouterErrorBoundary />}
                waitForMsw={false}
            />
        </ToastProvider>
    );
}
