---
order: 920
---

# Add authentication

!!!warning
Before going forward with this guide, make sure that you completed the [setup Mock Service Worker](./setup-msw.md) and [fetch initial data](./fetch-initial-data.md) guides.
!!!

Most of our applications (if not all) will eventually requires the user to authenticate. To facilitate this process, the Squide [FireflyRuntime](/reference/runtime/runtime-class.md) class accepts a [sessionAccessor](/reference/fakes/localStorageSessionManager.md#integrate-with-a-runtime-instance) function. Once the application registration flow is completed, the function will be made accessible to every module of the application.

When combined with a [React Router](https://reactrouter.com/en/main) authentication boundary and a login page, the shared `sessionAccessor` function is of great help to manage authentication concerns.

## Add a login page

First, open a terminal at the root of the host application and install the [@squide/fakes](https://www.npmjs.com/package/@squide/fakes) package:

+++ pnpm
```bash
pnpm add @squide/fakes
```
+++ yarn
```bash
yarn add @squide/fakes
```
+++ npm
```bash
npm install @squide/fakes
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

Then, add a [Mock Service Worker](https://mswjs.io/) (MSW) request handler to authenticate a user:

```ts !#28-30,40-42 host/mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";
import { LocalStorageSessionManager } from "@squide/fakes";

interface LoginCredentials {
    username: string;
    password: string;
}

const Users = [
    {
        username: "temp",
        password: "temp"
    }
];

export interface Session {
    username: string;
}

// For simplicity, we are using a local storage session manager for this guide.
export const sessionManager = new LocalStorageSessionManager<Session>();

export const requestHandlers: HttpHandler[] = [
    http.post("/api/login", async ({ request }) => {
        const { username, password } = await request.json() as LoginCredentials;

        // Try to match the credentials against existing users.
        const user = Users.find(x => {
            return x.username === username && x.password === password;
        });

        // If the user doesn't exist, return a 401.
        if (!user) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        // Login the user by storing the session to the local storage.
        sessionManager.setSession({
            username: user.username
        });

        return new HttpResponse(null, {
            status: 200
        });
    })
];
```

In the previous code sample, the endpoint attempts to authenticate the provided credentials against existing users. If there's a match, the user session is stored in the local storage using a [LocalStorageSessionManager](../reference/fakes/localStorageSessionManager.md) instance, and a `200` status code is returned.

!!!warning
Our security department reminds you to refrain from using a fake `LocalStorageSessionManager` in a production application :blush:
!!!

Next, register the request handler using the host application registration function:

```tsx host/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    if (process.env.USE_MSW) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
};
```

Then, create a login page:

```tsx !#14-23,27 host/src/Login.tsx
import { useCallback, useState, type ChangeEvent, type MouseEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@squide/firefly";

export function Login() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const response = await fetch("/api/login", {
            body: JSON.stringify({ 
                username, 
                password
            }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            // Reload the application after a login.
            window.location.href = "/";
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

After the user logs in, the application is reloaded. This is a requirement of the [AppRouter](../reference/routing/appRouter.md) component's [onLoadPublicData](../reference/routing/appRouter.md#load-public-data) and [onLoadProtectedData](../reference/routing/appRouter.md#load-protected-data) handlers. Nevertheless, it's not a significant concern because [Workleap](https://workleap.com/) applications utilize a third-party service for authentication which requires a full refresh of the application.

## Create a session accessor function

Next, create a shared type for the session and the session manager:

```ts shared/src/session.ts
export interface Session {
    user: {
        name: string;
    };
}

export interface SessionManager {
    setSession: (session: Session) => void;
    getSession: () => Session | undefined;
    clearSession: () => void;
}
```

Then, define a `sessionAccessor` function wrapping an `InMemorySessionManager` instance:

```tsx host/src/session.ts
import type { SessionAccessorFunction } from "@squide/firefly";
import type { Session, SessionManager } from "@sample/shared";

export class InMemorySessionManager implements SessionManager {
    #session?: Session;

    setSession(session: Session) {
        this.#session = session;
    }

    getSession() {
        return this.#session;
    }

    clearSession() {
        this.#session = undefined;
    }
}

export const sessionManager = new InMemorySessionManager();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

Finally, create the [FireflyRuntime](/reference/runtime/runtime-class.md) instance with the new `sessionAccessor` function:

```ts #5 host/src/bootstrap.tsx
import { FireflyRuntime } from "@squide/firefly";
import { sessionAccessor } from "./session.ts";

const runtime = new FireflyRuntime({
    sessionAccessor
});
```

## Fetch the session

Now, let's create an MSW request handler that returns a session object if a user is authenticated:

```ts !#49-60 host/mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";
import { LocalStorageSessionManager } from "@squide/fakes";

interface LoginCredentials {
    username: string;
    password: string;
}

const Users = [
    {
        username: "temp",
        password: "temp"
    }
];

export interface Session {
    username: string;
}

// For simplicity, we are using a local storage session manager for this guide.
export const sessionManager = new LocalStorageSessionManager<Session>();

export const requestHandlers: HttpHandler[] = [
    http.post("/api/login", async ({ request }) => {
        const { username, password } = await request.json() as LoginCredentials;

        // Try to match the credentials against existing users.
        const user = Users.find(x => {
            return x.username === username && x.password === password;
        });

        // If the user doesn't exist, return a 401.
        if (!user) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        // Login the user by storing the session to the local storage.
        sessionManager.setSession({
            username: user.username
        });

        return new HttpResponse(null, {
            status: 200
        });
    }),

    http.post("/api/session", ({ request }) => {
        // Retrieve the session stored by the /api/login endpoint.
        const session = sessionManager.getSession();

        if (!session) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        return HttpResponse.json(session);
    })
];
```

Then, update the host application `App` component to load the session when a user navigate to a protected page for the first time:

```tsx !#19,21,25,27-29,33-34 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import type { Session } from "@sample/shared";
import { sessionManager } from "./session.ts";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchProtectedData(setIsSessionLoaded: (isLoaded: boolean) => void,signal: AbortSignal) {
    const response = await fetch("/api/session", {
        signal
    });

    const data = await response.json();

    const session: Session = {
        user: {
            name: data.username
        }
    };

    sessionManager.setSession(session);

    setIsSessionLoaded(true);
}

export function App() {
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

    const handleLoadProtectedData = useCallback((signal: AbortSignal) => {
        return fetchProtectedData(setIsSessionLoaded, signal);
    }, []);

    return (
        <AppRouter
            onLoadProtectedData={handleLoadProtectedData}
            isProtectedDataLoaded={isSessionLoaded}
            fallbackElement={<div>Loading...</div>}
            errorElement={<div>An error occured!</div>}
            waitForMsw={true}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

!!!info
Since the `sessionManager` doesn't trigger a re-render, a `isSessionLoaded` state value is added to trigger a re-render when the session has been loadded.
!!!

## Add an authentication boundary

Next, create a new React Router authentication boundary component using the [useIsAuthenticated](../reference/session/useIsAuthenticated.md) hook:

> Internally, the `useIsAuthenticated` hook utilize the `sessionAccessor` function that we created previously to determine whether or not the user is authenticated.

```tsx !#5 host/src/AuthenticationBoundary.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@squide/firefly";

export function AuthenticationBoundary() {
    return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}
```

## Define an authenticated layout

Now that authentication is in place, thanks to the `AuthenticationBoundary`, we can expect to render the navigation items exclusively for authenticated users.

First, add a MSW request handler to log out a user:

```ts !#49-56 host/mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";
import { LocalStorageSessionManager } from "@squide/fakes";

interface LoginCredentials {
    username: string;
    password: string;
}

const Users = [
    {
        username: "temp",
        password: "temp"
    }
];

export interface Session {
    username: string;
}

// For simplicity, we are using a local storage session manager for this guide.
export const sessionManager = new LocalStorageSessionManager<Session>();

export const requestHandlers: HttpHandler[] = [
    http.post("/api/login", async ({ request }) => {
        const { username, password } = await request.json() as LoginCredentials;

        // Try to match the credentials against existing users.
        const user = Users.find(x => {
            return x.username === username && x.password === password;
        });

        // If the user doesn't exist, return a 401.
        if (!user) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        // Login the user by storing the session to the local storage.
        sessionManager.setSession({
            username: user.username
        });

        return new HttpResponse(null, {
            status: 200
        });
    }),

    http.post("/api/logout", () => {
        // Remove the session from the local storage.
        sessionManager.clearSession();

        return new HttpResponse(null, {
            status: 200
        });
    }),

    http.post("/api/session", ({ request }) => {
        // Retrieve the session stored by the /api/login endpoint.
        const session = sessionManager.getSession();

        if (!session) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        return HttpResponse.json(session);
    })
];
```

Then, introduce a new `AuthenticatedLayout` displaying the name of the logged-in user along with a logout button:

```tsx !#41,43-60,72,75 host/src/AuthenticatedLayout.tsx
import { useCallback, type ReactNode, type MouseEvent, type HTMLButtonElement } from "react";
import { Link, Outlet, navigate } from "react-router-dom";
import { 
    useNavigationItems,
    useRenderedNavigationItems,
    isNavigationLink,
    type RenderItemFunction,
    type RenderSectionFunction
} from "@squide/react-router";
import type { Session } from "@sample/shared";

const renderItem: RenderItemFunction = (item, index, level) => {
    // To keep things simple, this sample doesn't support nested navigation items.
    // For an example including support for nested navigation items, have a look at
    // https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/
    if (!isNavigationLink(item)) {
        return null;
    }

    const { label, linkProps, additionalProps } = item;

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

    const handleLogout = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            // Clear the in-memory session to ensure the authentication boundary can do his job.
            sessionManager.clearSession();

            // Redirect the user to the login page.
            navigate("/login");
        }
    }, [navigate, sessionManager]);

    const navigationItems = useNavigationItems();
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
                    <button type="button" onClick={handleLogout}>Log out</button>
                </div>
            </div>
            <Outlet />
        </>
    );
}
```

By creating a new `AuthenticatedLayout`, much of the layout code has been transferred from the `RootLayout` to the `AuthenticatedLayout`, leaving the root layout responsible only for styling the outer wrapper of the application for now:

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

Finally, assemble everything:

```tsx !#16,21,24,45-51 host/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./Rootlayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { HomePage } from "./Homepage.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
                // The root error boundary is a named route, allowing the logging and logout pages 
                // to be nested under it using a "parentName" option.
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
    // authentication boundary and be publicly accessible.
    runtime.registerRoute({
        $visibility: "public",
        path: "/login",
        element: <LoginPage />
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });

    if (process.env.USE_MSW) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
});
```

## Try it :rocket:

Start the application using the `dev` script and attempt navigating to the root page (`/`). You will be redirected to the `/login` page. Login with `"temp"` / `"temp"`, you will be redirected to the root page.

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/shell).
- Refer to the [troubleshooting](../troubleshooting.md) page.













