import { Link } from "react-router-dom";

export default function Remote() {
    return (
        <div>
            <h2>Remote</h2>
            <p>Hello from a remote module!</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}
