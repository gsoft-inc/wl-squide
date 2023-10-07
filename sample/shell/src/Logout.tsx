import { Link } from "react-router-dom";

export type onLogoutHandler = () => Promise<void>;

export interface LogoutProps {
    onLogout?: onLogoutHandler;
}

export function Logout({ onLogout }: LogoutProps) {
    if (onLogout) {
        onLogout();
    }

    return (
        <main>
            <h1>Logged out</h1>
            <div>You are logged out from the application!</div>
            <Link to="/login">Log in again</Link>
        </main>
    );
}
