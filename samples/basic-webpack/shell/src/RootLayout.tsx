import { Outlet } from "react-router-dom";

export function RootLayout() {
    return (
        <div style={{ margin: "20px" }}>
            <Outlet />
        </div>
    );
}
