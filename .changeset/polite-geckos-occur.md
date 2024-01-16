---
"@squide/firefly": major
---

- The `AppRouter` component now requires to define a `RouterProvider` as a child. This change has been made to provide more flexibility on the consumer side about the definition of the React Router router.

Before:

```tsx
<AppRouter
    fallbackElement={...}
    errorElement={...}
    waitForMsw={...}
 />
```

Now:

```tsx
<AppRouter
    fallbackElement={...}
    errorElement={...}
    waitForMsw={...}
>
    {(routes, providerProps) => (
        <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
    )}
</AppRouter>
```

- When in development and using React strict mode, the public and protected handler can be called twice. This issue highlighted that the `AppRouter` component doesn't equipe correctly the handlers to dispose of previous HTTP requests if they are called multiple times because of re-renders. Therefore, the handlers now receives an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that should be forwared to the HTTP client initiating the fetch request.
- The fix also requires the consumer to provide new properties (`isPublicDataLoaded` and `isProtectedDataLoaded`) indicating whether or not the public and/or protected data has been loaded.

```tsx
async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal) {
    try {
        const response = await fetch("/api/feature-flags", {
            signal
        });
        
        if (response.ok) {
            const data = await response.json();

            setFeatureFlags(data);
        }
    } catch (error: unknown) {
        if (!signal.aborted) {
            throw error;
        }
    }
}

const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

const handleLoadPublicData = useCallback((signal: AbortSignal) => {
    return fetchPublicData(setFeatureFlags, signal);
}, []);

<AppRouter
    onLoadPublicData={handleLoadPublicData}
    isPublicDataLoaded={!!featureFlags}
    fallbackElement={...}
    errorElement={...}
    waitForMsw={...}
>
    {(routes, providerProps) => (
        <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
    )}
</AppRouter>
```

- Fixed an issue where the deferred registrations could be completed before the protected data has been loaded.
