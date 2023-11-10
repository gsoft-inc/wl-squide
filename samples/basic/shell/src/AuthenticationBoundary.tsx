import { useIsAuthenticated } from "@squide/firefly";
import { Navigate, Outlet } from "react-router-dom";

export function AuthenticationBoundary() {
    return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}

export const Component = AuthenticationBoundary;
