import type { SessionManager } from "@sample/shared";
import { Link } from "react-router-dom";

export interface LogoutProps {
    sessionManager: SessionManager;
}

export default function Logout({ sessionManager }: LogoutProps) {
    sessionManager.clearSession();

    return (
        <main>
            <h1>Logged out</h1>
            <div>You are logged out from the application!</div>
            <Link to="/login">Log in again</Link>
        </main>
    );
}
