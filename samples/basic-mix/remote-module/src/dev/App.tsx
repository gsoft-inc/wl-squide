import { BackgroundColorContext } from "@basic-mix/shared";
import { AppRouter } from "@basic-mix/shell";

export function App() {
    return (
        <BackgroundColorContext.Provider value="blue">
            <AppRouter />
        </BackgroundColorContext.Provider>
    );
}

