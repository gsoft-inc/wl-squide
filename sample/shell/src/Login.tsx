import { useIsAuthenticated } from "@squide/react-router";
import { useCallback, useState, type ChangeEvent, type MouseEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export type OnLoginHandler = (username: string, password: string) => Promise<void>;

export class InvalidCredentialsError extends Error {
    constructor(message: string = "") {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

export interface LoginProps {
    onLogin?: OnLoginHandler;
}

export function Login({ onLogin }: LoginProps) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isBusy, setIsBusy] = useState(false);

    const navigate = useNavigate();

    const handleClick = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        try {
            setIsBusy(true);
            setErrorMessage(undefined);

            if (onLogin) {
                await onLogin(username, password);
            }

            navigate("/");
        } catch (error: unknown) {
            setIsBusy(false);

            if (error instanceof InvalidCredentialsError) {
                setErrorMessage("Invalid credentials, please try again.");
            } else {
                setErrorMessage("An unknown error occured while trying to log you in, please try again.");
            }
        }
    }, [username, password, onLogin, navigate]);

    const handleUserNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    }, []);

    const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }, []);

    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <main>
            <h1>Login</h1>
            <form>
                <div>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={handleUserNameChange} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={handlePasswordChange} />
                </div>
                <div>
                    <button type="submit" onClick={handleClick}>
                        Login
                    </button>
                </div>
                <div>Hint: use temp/temp :)</div>
                {isBusy && <div style={{ color: "blue" }}>Loading...</div>}
                {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
            </form>
        </main>
    );
}
