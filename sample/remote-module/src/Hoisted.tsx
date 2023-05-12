import { Link } from "react-router-dom";

export default function Hoisted() {
    return (
        <div>
            <h2>Hoisted</h2>
            <p>Hello from a remote module! I have been hoisted at the top of React Router routes declaration and therefore is doesn't inherit from the root layout and error boundary.</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
}
