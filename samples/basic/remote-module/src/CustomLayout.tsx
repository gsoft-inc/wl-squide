import { Outlet } from "react-router-dom";

export function CustomLayout() {
    return (
        <div style={{ margin: "20px" }}>
            <Outlet />
        </div>
    );
}

export const Component = CustomLayout;
