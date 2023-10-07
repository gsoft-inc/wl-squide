import { BackgroundColorContext } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { RouterProvider } from "react-router-dom";

export function App() {
    const router = useAppRouter();

    return (
        <BackgroundColorContext.Provider value="blue">
            <RouterProvider
                router={router}
                fallbackElement={null}
            />
        </BackgroundColorContext.Provider>
    );
}

