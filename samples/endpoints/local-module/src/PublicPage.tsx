import { Link } from "react-router-dom";

export function PublicPage() {
    return (
        <>
            <h1>Public page</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/local-module</code></p>
            <Link to="/">Go to the protected home page</Link>
        </>
    );
}

export const Component = PublicPage;
