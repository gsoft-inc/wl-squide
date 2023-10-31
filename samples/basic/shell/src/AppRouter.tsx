import { AppRouter as FireflyAppRouter } from "@squide/firefly";

function Loader() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter
            fallback={<Loader />}
            waitForMsw={false}
        />
    );
}
