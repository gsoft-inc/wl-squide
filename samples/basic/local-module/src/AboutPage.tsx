import { Link } from "react-router-dom";

export function AboutPage() {
    return (
        <div>
            <h2>About</h2>
            <p>Hey again!</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}

export const Component = AboutPage;
