import { Link } from "react-router-dom";

export interface NoMatchPageProps {
    path: string;
}

export function NoMatchPage({ path }: NoMatchPageProps) {
    return (
        <div>
            <h1>404</h1>
            <p>We can't find the path "{path}".</p>
            <Link to="/">Go back home</Link>
        </div>
    );
}
