import { BackgroundColorContext } from "@basic/shared";
import { useAppRouter } from "@basic/shell";

export function App() {
    const appRouter = useAppRouter();

    return (
        <BackgroundColorContext.Provider value="blue">
            {appRouter}
        </BackgroundColorContext.Provider>
    );
}

