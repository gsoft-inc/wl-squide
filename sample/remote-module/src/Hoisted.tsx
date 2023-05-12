import { Link } from "react-router-dom";

export default function Hoisted() {
    return (
        <div>
            <h2>Hoisted</h2>
            <p>Hello from a remote module!</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}
