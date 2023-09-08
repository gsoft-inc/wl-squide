import { Link } from "react-router-dom";
import type { SessionManager } from "../session.ts";

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
