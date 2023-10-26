---
order: 80
---

# Add authentication

Most of our applications (if not all) will eventually requires the user to authenticate. To facilitate this process, the Squide [Runtime](/reference/runtime/runtime-class.md) class accepts a [sessionAccessor](/reference/fakes/LocalStorageSessionManager.md#integrate-with-a-runtime-instance) function. Once the application registration flow is completed, the function will be made accessible to every module of the application.

When combined with a [React Router](https://reactrouter.com/en/main) authentication boundary and a login page, the shared `sessionAccessor` function is of great help to manage authentication concerns.

## Create a session accessor function

First, create a shared type for the session:

```ts shared/src/session.ts
export interface Session {
    user: {
        name: string;
    };
}
```

Then, define a `sessionAccessor` function wrapping a `LocalStorageSessionManager` instance:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { Session } from "@sample/shared";

export const sessionManager = new LocalStorageSessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

Finally, create the [Runtime](/reference/runtime/runtime-class.md) instance with the new `sessionAccessor` function:

```ts #5 host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    sessionAccessor
});
```

!!!warning
Our security department reminds you to refrain from using a fake `LocalStorageSessionManager` in a production application :blush:
!!!

## Add an authentication boundary

Create a new React Router authentication boundary component using the [useIsAuthenticated]() hook:

> Internally, the `useIsAuthenticated` hook utilize the `sessionAccessor` function that we created previously to determine whether or not the user is authenticated.

```tsx !#5 host/src/AuthenticationBoundary.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@squide/react-router";

export function AuthenticationBoundary() {
    return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}
```

## Add a login page

Add a login page to the application:

```tsx !#17-21 host/src/Login.tsx
import { useCallback, useState, type ChangeEvent, type MouseEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@squide/react-router";
import { sessionManager } from "./session.ts";

export function Login() {
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

## Add a logout page

Add a logout page to the application:

```tsx host/src/Logout.tsx
import { Link } from "react-router-dom";
import { sessionManager } from "./session.ts";

export function Logout() {
    sessionManager.clearSession();

    return (
        <main>
            <h1>Logged out</h1>
            <div>You are logged out from the application!</div>
            <Link to="/login">Log in again</Link>
        </main>
    );
}
```

The logout page also takes care of **clearing** the current **session**, allowing you to simply redirect to the page to clear the current user session:

```tsx
<Link to="/logout">Disconnect</Link>
```

## Define an authenticated layout

With authentication in place, we now expect to render the navigation items only to authenticated users and to offer a way to logout from the application. To do so, let's introduce a new `AuthenticatedLayout`:

```tsx !#39,49-59 host/src/AuthenticatedLayout.tsx
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
    useNavigationItems,
    useRenderedNavigationItems,
    isNavigationLink,
    type RenderItemFunction,
    type RenderSectionFunction
} from "@squide/react-router";
import type { Session } from "../session.ts";

const renderItem: RenderItemFunction = (item, index, level) => {
    // To keep things simple, this sample doesn't support nested navigation items.
    // For an example including support for nested navigation items, have a look at
    // https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/
    if (!isNavigationLink(item)) {
        return null;
    }

    return (
        <li key={`${level}-${index}`}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSection: RenderSectionFunction = (elements, index, level) => {
    return (
        <ul key={`${level}-${index}`}>
            {elements}
        </ul>
    );
};

export function AuthenticatedLayout() {
    // Retrieve the current user session.
    const session = useSession() as Session;

    // Retrieve the navigation items registered by the remote modules.
    const navigationItems = useNavigationItems();

    // Transform the navigation items into React elements.
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <nav style={{ width: "100%" }}>
                    {renderedNavigationItems}
                </nav>
                <div style={{ whiteSpace: "nowrap", marginRight: "20px" }}>
                    (User: <span style={{ fontWeight: "bold" }}>{session.user.name}</span>)
                </div>
                <div>
                    <Link to="/logout">Disconnect</Link>
                </div>
            </div>
            <Outlet />
        </>
    );
}
```

Most of the layout code has been moved from the `RootLayout` to the `AuthenticatedLayout`, leaving the root layout only taking care for now of styling the outer wrapper of the application:

```tsx host/src/RootLayout.tsx
import { Outlet } from "react-router-dom";

export function RootLayout() {
    return (
        <div style={{ margin: "20px" }}>
            <Outlet />
        </div>
    );
}
```

## Setup the routes

Assemble everything with React Router [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes) and a [register](../reference/registration/registerLocalModules.md) function:

```tsx !#17,22,25,46-51,55-60 host/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";
import { RootLayout } from "./Rootlayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { LogoutPage } from "./LogoutPage.tsx";
import { HomePage } from "./Homepage.tsx";

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
                // The root error boundary is a named route to be able to nest
                // the loging / logout page under it with the "parentName" option.
                $name: "root-error-boundary",
                errorElement: <RootErrorBoundary />,
                children: [
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
                                            ManagedRoutes
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

    // The login page is nested under the root error boundary to be defined before the
    // authentication boundary to be publicly accessible.
    runtime.registerRoute({
        path: "/login",
        element: <LoginPage />
    }, {
        parentName: "root-error-boundary"
    });

    // The logout page is nested under the root error boundary to be defined before the
    // authentication boundary to be publicly accessible.
    runtime.registerRoute({
        path: "/logout",
        element: <LogoutPage />
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });
});
```

## Try it :rocket:

Start the application and attempt navigating to the root page (`/`). You will be redirected to the `/login` page. Login with `"temp"` / `"temp"`, you will be redirected to the root page.

!!!info
If you are having issues with this guide, have a look at a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/shell).
!!!













