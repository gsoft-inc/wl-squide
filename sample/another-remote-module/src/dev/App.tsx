import { useAppRouter } from "@sample/shell";
import { RouterProvider } from "react-router-dom";

export function App() {
    const router = useAppRouter();

    return (
        <RouterProvider
            router={router}
            fallbackElement={null}
        />
    );
}
