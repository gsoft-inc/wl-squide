---
order: 710
label: Migrate to firefly v9
---

# Migrate to firefly v9

This major version of `@squide/firefly` introduces [TanStack Query](https://tanstack.com/query/latest) as the official library for fetching the global data of a Squide's application and features a complete rewrite of the [AppRouter](../reference/routing/appRouter.md) component, which now uses a state machine to manage the application's bootstrapping flow.

Prior to `v9`, Squide applications couldn't use TanStack Query to fetch global data, making it **challenging** for Workleap's applications to **keep** their **global data** in **sync** with the **server state**. With `v9`, applications can now leverage [custom wrappers](./fetch-global-data.md) of the [useQueries](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) hook to fetch and keep their global data up-to-date with the server state. Additionally, the new [deferred registrations update](../reference/registration/useDeferredRegistrations.md#register-or-update-deferred-registrations) update feature allows applications to also **keep** their conditional **navigation items in sync** with the server state.

These changes have significantly impacted the API surface of Squide.

## Breaking changes

### Removed

- The `useAreModulesRegistered` hook has been removed.
- The `useAreModulesReady` hook has been removed.
- The `useIsMswStarted` hook has been removed.
- The `completeModuleRegistrations` function as been removed.
- The `completeLocalModulesRegistrations` function has been removed.
- The `completeRemoteModuleRegistrations` function has been removed.
- The `useSession` hook has been removed.
- The `useIsAuthenticated` hook has been removed.
- The `sessionAccessor` option has been removed from the [FireflyRuntime](../reference/runtime/runtime-class.md) options.

### Renamed

- The `setMswAsStarted` function has been renamed to [setMswIsReady](../reference/msw/setMswAsReady.md).

### Others

- The `@squide/firefly` package now takes a dependency on `@tanstack/react-query`.

### Removed support for deferred routes

[Deferred registration](../reference/registration/registerLocalModules.md#defer-the-registration-of-navigation-items) functions no longer support route registration; they are now **exclusively** used for **registering navigation items**. Since deferred registration functions can now be re-executed whenever global data changes, registering routes in deferred registration functions no longer makes sense as updating the routes registry after the application has bootstrapped could lead to issues.

This change is a significant improvement for Squide's internals, allowing us to eliminate quirks like:

- Treating unknown routes as `protected`: When a user session initially requested a deferred route, Squide couldn't determine if the route was `public` or `protected` because it wasn't registered yet. As a result, for that initial request, the route was considered `protected`, even if the deferred registration later marked it as `public`.

- Mandatory wildcard `*` route registration: Previously, Squide's bootstrapping would fail if the application didn't include a wildcard route.

Before:

```tsx !#4-7
export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = runtime => {
    return ({ featureFlags }) => {
        if (featureFlags?.featureB) {
            runtime.registerRoute({
                path: "/page",
                element: <Page />
            });

            runtime.registerNavigationItem({
                $key: "page",
                $label: "Page",
                to: "/page"
            });
        }
    };
}
```

Now:

```tsx !#2-5
export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = runtime => {
    runtime.registerRoute({
        path: "/page",
        element: <Page />
    });

    return ({ featureFlags }) => {
        if (featureFlags?.featureB) {
            runtime.registerNavigationItem({
                $key: "page",
                $label: "Page",
                to: "/page"
            });
        }
    };
}
```

To handle direct access to a conditional route, each conditional route's endpoint should return a `403` status code if the user is not authorized to view the route. The corresponding pages for these conditional routes should then rethrow `403` errors, allowing the nearest error boundary to manage the unauthorized access.

### The plugin abstract class constructor now requires a runtime instance

TBD

### Plugins now registers with a factory function

Plugins must now be registered with a factory receive a runtime instance as an argument

- AppRouter
- Include change for the 401 redirection -> now done by the authentication boundary
- Root error boundary is now defined in the render function of the AppRouter

## Improvements

## Additions

- New optional `$key` option for a navigation item
- [useRenderedNavigationItems]() rendering functions now receive an additional key argument
- New optional `$canRender` option for a navigation item
- useIsBoostrapping
- useDeferredRegistrations
- usePublicDataQueries
- useProtectedDataQueries
- isGlobalDataQueriesError
- a deferred registrations functions will always receive a data argument
- new `state` argument is now provided for deferred registrations function

## 
