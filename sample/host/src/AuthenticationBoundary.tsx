import { Navigate, Outlet } from "react-router-dom";

import { useIsAuthenticated } from "@squide/react-router";

export function AuthenticationBoundary() {
    return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}
