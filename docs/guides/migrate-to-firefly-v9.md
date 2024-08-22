---
order: 710
label: Migrate to firefly v9
---

# Migrate to firefly v9

This major version of `@squide/firefly` introduces [TanStack Query](https://tanstack.com/query/latest) as the official library for fetching the global data of a Squide's application and features a complete rewrite of the [AppRouter](../reference/routing/appRouter.md) component, which now uses a state machine to manage the application's bootstrapping flow.

Prior to `v9`, Squide applications couldn't use TanStack Query to fetch global data, making it **challenging** for Workleap's applications to **keep** their **global data** in **sync** with the **server state**. With `v9`, applications can now leverage [custom wrappers](./fetch-global-data.md) of the [useQueries](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) hook to fetch and keep their global data up-to-date with the server state. Additionally, the new [deferred registrations](../reference/registration/useDeferredRegistrations.md#register-or-update-deferred-registrations) update feature allows applications to even **keep** their conditional **navigation items in sync** with the **server state**.

Finally, with `v9`, Squide's philosophy has evolved. We used to describe Squide as a shell for **federated** applications. Now, we refer to Squide as a shell for **modular** applications. After playing with Squide's [local module](../reference/registration/registerLocalModules.md) feature for a while, we discovered that Squide offers [significant value](../getting-started/default.md#why-squide) even for **non-federated applications**, which triggered this shift in philosophy.

## Breaking changes

### Removed

- The `useAreModulesRegistered` hook has been removed, use the [useIsBootstrapping](../reference/routing/useIsBootstrapping.md) hook instead.
- The `useAreModulesReady` hook has been removed, use the [useIsBootstrapping](../reference/routing/useIsBootstrapping.md) hook instead.
- The `useIsMswStarted` hook has been removed, use the [useIsBootstrapping](../reference/routing/useIsBootstrapping.md) hook instead.
- The `completeModuleRegistrations` function as been removed use the [useDeferredRegistrations](../reference/registration/useDeferredRegistrations.md) hook instead.
- The `completeLocalModulesRegistrations` function has been removed use the [useDeferredRegistrations](../reference/registration/useDeferredRegistrations.md) hook instead.
- The `completeRemoteModuleRegistrations` function has been removed use the [useDeferredRegistrations](../reference/registration/useDeferredRegistrations.md) hook instead.
- The `useSession` hook has been removed, define your own React context instead.
- The `useIsAuthenticated` hook has been removed, define your own React context instead.
- The `sessionAccessor` option has been removed from the [FireflyRuntime](../reference/runtime/runtime-class.md) options, define your own React context instead.

### Renamed

- The `setMswAsStarted` function has been renamed to [setMswIsReady](../reference/msw/setMswAsReady.md).

### Others

- The `@squide/firefly` package now takes a dependency on `@tanstack/react-query`.

### Removed support for deferred routes

[Deferred registration](../reference/registration/registerLocalModules.md#defer-the-registration-of-navigation-items) functions no longer support route registration; they are now **exclusively** used for **registering navigation items**. Since deferred registration functions can now be re-executed whenever the global data changes, registering routes in deferred registration functions no longer makes sense as updating the routes registry after the application has bootstrapped could lead to issues.

This change is a significant improvement for Squide's internals, allowing us to eliminate quirks like:

- Treating unknown routes as `protected`: When a user initially requested a deferred route, Squide couldn't determine if the route was `public` or `protected` because it wasn't registered yet. As a result, for that initial request, the route was considered `protected`, even if the deferred registration later registered it as `public`.

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

#### Conditional routes

To handle direct access to a conditional route, each conditional route's endpoint should return a `403` status code if the user is not authorized to view the route. Those `403` errors should then be handled by the nearest error boundary.

### Plugin's constructors now requires a runtime instance

Prior to this release, plugin instances received the current runtime instance through a `_setRuntime` function. This approach caused issues because some plugins required a reference to the runtime at instantiation. To address this, plugins now receive the **runtime instance** directly as a **constructor** argument.

Before:

```tsx !#8-10
export class MyPlugin extends Plugin {
    readonly #runtime: Runtime;

    constructor() {
        super(MyPlugin.name);
    }

    _setRuntime(runtime: Runtime) {
        this.#runtime = runtime;
    }
}
```

Now:

```tsx !#2
export class MyPlugin extends Plugin {
    constructor(runtime: Runtime) {
        super(MyPlugin.name, runtime);
    }
}
```

### Plugins now registers with a factory function

Prior to this release, the [FireflyRuntime](../reference/runtime/runtime-class.md) accepted plugin instances as options. Now, `FireflyRuntime` accepts **factory functions** instead of plugin instances. This change allows plugins to receive the runtime instance as a constructor argument.

Before:

```tsx
const runtime = new FireflyRuntime({
    plugins: [new MyPlugin()]
});
```

Now:

```tsx
const runtime = new FireflyRuntime({
    plugins: [x => new MyPlugin(x)]
});
```

### `AppRouter` component rewrite

This release features a complete rewrite of the [AppRouter](../reference/routing/appRouter.md) component. The `AppRouter` component used to handle many concerns like global data fetching, deferred registrations, error handling and a loading state. Those concerns have been delegated to the consumer code, supported by the new [useIsBootstrapping](../reference/routing/useIsBootstrapping.md), [usePublicDataQueries](../reference/tanstack-query/usePublicDataQueries.md), [useProtectedDataQueries](../reference/tanstack-query/useProtectedDataQueries.md) and [useDeferredRegistrations](../reference/registration/useDeferredRegistrations.md) hooks.

Before:

```tsx
export function App() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
    const [subscription, setSubscription] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal);
    }, []);

    const handleLoadProtectedData = useCallback((signal: AbortController) => {
        return fetchProtectedData(setSubscription, signal);
    }, []);

    const handleCompleteRegistrations = useCallback(() => {
        return completeModuleRegistrations(runtime, {
            featureFlags,
            subscription
        });
    }, [runtime, featureFlags, subscription]);

    return (
        <AppRouter
            fallbackElement={<div>Loading...</div>}
            errorElement={<RootErrorBoundary />}
            waitForMsw
            onLoadPublicData={handleLoadPublicData}
            onLoadProtectedData={handleLoadProtectedData}
            isPublicDataLoaded={!!featureFlags}
            isPublicDataLoaded={!!subscription}
            onCompleteRegistrations={handleCompleteRegistrations}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

Now:

```tsx
function BootstrappingRoute() {
    const [featureFlags] = usePublicDataQueries([getFeatureFlagsQuery]);
    const [subscription] = useProtectedDataQueries([getSubscriptionQuery]);

    const data: DeferredRegistrationData = useMemo(() => ({ 
        featureFlags,
        subscription
    }), [featureFlags, subscription]);

    useDeferredRegistrations(data);

    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export function App() {
    return (
        <AppRouter waitForMsw waitForPublicData>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        errorElement: <RootErrorBoundary />,
                                        children: [
                                            {
                                                element: <BootstrappingRoute />,
                                                children: registeredRoutes
                                            }
                                        ]
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </AppRouter>
    );
}
```

Those will most likely be included in a migration guide down this page, like a section on how to migrate the application shell:

- Include change for the 401 redirection -> now done by the authentication boundary
- Root error boundary is now defined in the render function of the AppRouter

## New hooks and functions

- A new [useIsBoostrapping](../reference/routing/useIsBootstrapping.md) hook is now available.
- A new [useDeferredRegistrations](../reference/registration/useDeferredRegistrations.md) hook is now available.
- A new [usePublicDataQueries](../reference/tanstack-query/usePublicDataQueries.md) hook is now available.
- A new [useProtectedDataQueries](../reference/tanstack-query/useProtectedDataQueries.md) hook is now available.
- A new [isGlobalDataQueriesError](../reference/tanstack-query/isGlobalDataQueriesError.md) function is now available.

## Improvements

- Deferred registration functions now always receive a `data` argument.
- Deferred registration functions now receives a new [operations](../reference/registration/registerLocalModules.md#use-the-deferred-registration-operation-argument) argument.
- Navigation items now include a [$canRender](../reference/runtime/runtime-class.md#conditionally-render-a-navigation-item) option, enabling modules to control whether a navigation item should be rendered.

### New `$key` option for navigation items

Navigation items now supports a new `$key` option. Previously, most navigation item React elements used a `key` property generated by concatenating the item's `level` and `index`, which goes against React's best practices:

```tsx
<li key={`${level}-${index}`}>
```

It wasn't that much of a big deal since navigation items never changed once the application was bootstrapped. Now, with the deferred registration functions re-executing when the global data changes, the registered navigation items can be updated post-bootstrapping. The new `$key` option allows the navigation item to be configured with a unique key at registration.

```tsx !#2
runtime.registerNavigationItem({
    $key: "page-1",
    $label: "Page 1",
    to: "/page-1"
});
```

The configured `$key` option is then passed as an argument to the [useRenderedNavigationItems](../reference/routing/useRenderedNavigationItems.md) rendering functions:

```tsx !#1,5
const renderItem: RenderItemFunction = (item, key) => {
    const { label, linkProps, additionalProps } = item;

    return (
        <li key={key}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSection: RenderSectionFunction = (elements, key) => {
    return (
        <ul key={key}>
            {elements}
        </ul>
    );
};

const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);
```

## Migrate an host application

Most of the breaking changes of the `v9` release affects the host application code.

## Migrate a module
