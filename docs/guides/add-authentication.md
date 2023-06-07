---
order: 80
---

# Add authentication

Most of our applications (if not all) will eventually require the user to authenticate. To support that, `@squide` [Runtime](/references/runtime/runtime-class.md) class accepts a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function that is made available to every module of the application once the registration flow is completed.

When combined with a [React Router's](https://reactrouter.com/en/main) authentication boundary and a login page, the shared `sessionAccessor` function is a great asset to handle authentication concerns.

First, define a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";

export const sessionManager = new SessionManager<Session>();

const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

!!!warning
Our security department reminds you to not use a fake `SessionManager` in a production application :blush:
!!!

Then create a [Runtime](/references/runtime/runtime-class.md) instance with the new `sessionAccessor` function:

```ts #5 host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    sessionAccessor
});
```

Then create an authentication boundary component using the [useIsAuthenticated]() hook:

> Internally, the `useIsAuthenticated` hook use the `sessionAccessor` function to determine whether or not the user is authenticated.

```tsx !#5 host/src/AuthenticationBoundary.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@squide/react-router";

export function AuthenticationBoundary() {
    return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}
```

Then, add a login page:

```tsx !#17-21 host/src/Login.tsx
import { useCallback, useState, type ChangeEvent, type MouseEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@squide/react-router";
import { sessionManager } from "./session.ts";

export default function Login() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // Replace this with a backend authentication system.
        if (username === "temp" && password === "temp") {
            sessionManager.setSession({
                user: {
                    name: username
                }
            });

            navigate("/");
        }
    }, [username, password, navigate]);

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
            </form>
        </main>
    );
}
```

And finally, assemble everything with React Router's [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes):

```tsx !#29-30,34 host/src/App.tsx
import { lazy, useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

const AuthenticatedLayout = lazy(() => import("./AuthenticatedLayout.tsx"));
const ModuleErrorBoundary = lazy(() => import("./ModuleErrorBoundary.tsx"));
const Home = lazy(() => import("./Home.tsx"));
const Login = lazy(() => import("./Login.tsx"));

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter({
            element: <RootLayout />,
            children: [
                {
                    errorElement: <RootErrorBoundary />,
                    children: [
                        {
                            // The login page is declared before the authentication boundary,
                            // therefore it's a public page.
                            path: "/login",
                            element: <Login />
                        },
                        {
                            // Every page beyond the authenticated boundary are protected.
                            element: <AuthenticationBoundary />,
                            children: [
                                {
                                    element: <AuthenticatedLayout />,
                                    children: [
                                        {
                                            // By having the error boundary under the authenticated layout, modules unmanaged errors
                                            // will be displayed inside the layout rather than replacing the whole page.
                                            errorElement: <ModuleErrorBoundary />,
                                            children: [
                                                {
                                                    index: true,
                                                    element: <Home />
                                                },
                                                ...routes
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }, [routes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

Now, start the application and try navigating to the root page (`/`). You should be redirected to the `/login` page. Login with `"temp"` / `"temp"`, you should now be redirected to the root page.














