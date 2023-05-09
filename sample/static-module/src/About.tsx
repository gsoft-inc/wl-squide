import { Link } from "react-router-dom";

export default function About() {
    return (
        <div>
            <h2>About</h2>
            <p>Hey again!</p>
            <Link to="/">Go back</Link>
        </div>
    );
}
