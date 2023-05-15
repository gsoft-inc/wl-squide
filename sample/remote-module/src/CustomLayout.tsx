import { Outlet } from "react-router-dom";

export default function CustomLayout() {
    return (
        <div style={{ margin: "20px" }}>
            <Outlet />
        </div>
    );
}
