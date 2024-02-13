# @squide/firefly

## 6.0.2

### Patch Changes

- Updated dependencies [[`d091846`](https://github.com/gsoft-inc/wl-squide/commit/d091846502bed6b783b69ab8eff7ae36d8e25449)]:
  - @squide/core@3.3.1
  - @squide/msw@2.0.11
  - @squide/react-router@4.1.1
  - @squide/webpack-module-federation@3.0.6

## 6.0.1

### Patch Changes

- [#148](https://github.com/gsoft-inc/wl-squide/pull/148) [`a448347`](https://github.com/gsoft-inc/wl-squide/commit/a4483478bb8b7ef1f24513244e8c2410bdb86bc1) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal changes.

- Updated dependencies [[`a448347`](https://github.com/gsoft-inc/wl-squide/commit/a4483478bb8b7ef1f24513244e8c2410bdb86bc1)]:
  - @squide/react-router@4.1.0

## 6.0.0

### Major Changes

- [#144](https://github.com/gsoft-inc/wl-squide/pull/144) [`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Moved the webpack define functions to the new `@squide/firefly-configs` package.

### Patch Changes

- Updated dependencies [[`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f), [`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f)]:
  - @squide/core@3.3.0
  - @squide/react-router@4.0.4
  - @squide/msw@2.0.10
  - @squide/webpack-module-federation@3.0.5

## 5.0.0

### Patch Changes

- [#140](https://github.com/gsoft-inc/wl-squide/pull/140) [`6eaf4ac3`](https://github.com/gsoft-inc/wl-squide/commit/6eaf4ac3f6ac88b62045ce280562a5887589026b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal changes

- Updated dependencies [[`6eaf4ac3`](https://github.com/gsoft-inc/wl-squide/commit/6eaf4ac3f6ac88b62045ce280562a5887589026b)]:
  - @squide/webpack-configs@1.2.0

## 4.0.3

### Patch Changes

- [#137](https://github.com/gsoft-inc/wl-squide/pull/137) [`2f5946f9`](https://github.com/gsoft-inc/wl-squide/commit/2f5946f9c51740dc0d207d53085b143d9f1e407c) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Improved the no custom 404 route handling.

- Updated dependencies [[`2f5946f9`](https://github.com/gsoft-inc/wl-squide/commit/2f5946f9c51740dc0d207d53085b143d9f1e407c)]:
  - @squide/react-router@4.0.3

## 4.0.2

### Patch Changes

- [#135](https://github.com/gsoft-inc/wl-squide/pull/135) [`8e73083`](https://github.com/gsoft-inc/wl-squide/commit/8e73083bb90a6f23495ac6a8dca0245862ee2c9a) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Fixing a remaining issue with deferred registrations that depends on protected data.

- Updated dependencies [[`8e73083`](https://github.com/gsoft-inc/wl-squide/commit/8e73083bb90a6f23495ac6a8dca0245862ee2c9a)]:
  - @squide/react-router@4.0.2

## 4.0.1

### Patch Changes

- [#133](https://github.com/gsoft-inc/wl-squide/pull/133) [`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - To prevent the consumer from always handling the AbortSignal error, a default catch has been added to the `AppRouter` component. The consumer can still handler the AbortSignal error if he needs to.

  - When a user makes a direct hit to a deferred route that depends on protected data, the protected data was undefined. The reason was that by default, an unregistered route was considered as a public route. The code has been updated to consider an uregistered route as a protected route. The upside is that deferred routes can now depends on protected data. The downside is that a public deferred route will trigger the loading of the protected data. As we don't expect to have public deferred route at the moment it doesn't seems like an issue.

- Updated dependencies [[`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e), [`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e), [`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e)]:
  - @squide/webpack-module-federation@3.0.4
  - @squide/react-router@4.0.1
  - @squide/core@3.2.1
  - @squide/webpack-configs@1.1.3
  - @squide/msw@2.0.9

## 4.0.0

### Major Changes

- [#131](https://github.com/gsoft-inc/wl-squide/pull/131) [`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The `AppRouter` component now requires to define a `RouterProvider` as a child. This change has been made to provide more flexibility on the consumer side about the definition of the React Router router.

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

### Patch Changes

- Updated dependencies [[`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d), [`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d)]:
  - @squide/core@3.2.0
  - @squide/react-router@4.0.0
  - @squide/msw@2.0.8
  - @squide/webpack-module-federation@3.0.3
  - @squide/webpack-configs@1.1.2

## 3.0.3

### Patch Changes

- [#128](https://github.com/gsoft-inc/wl-squide/pull/128) [`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internally changed the usage of `setInterval` for `useSyncExternalStore`.

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/core@3.1.1
  - @squide/msw@2.0.7
  - @squide/webpack-module-federation@3.0.2
  - @squide/react-router@3.0.2
  - @squide/webpack-configs@1.1.1

## 3.0.2

### Patch Changes

- [#122](https://github.com/gsoft-inc/wl-squide/pull/122) [`cda7873`](https://github.com/gsoft-inc/wl-squide/commit/cda7873dcffbf424a625cf40c56a12eacbb2632e) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal minor changes

- Updated dependencies [[`cda7873`](https://github.com/gsoft-inc/wl-squide/commit/cda7873dcffbf424a625cf40c56a12eacbb2632e)]:
  - @squide/msw@2.0.6

## 3.0.1

### Patch Changes

- [#118](https://github.com/gsoft-inc/wl-squide/pull/118) [`4864d30`](https://github.com/gsoft-inc/wl-squide/commit/4864d30764021a91d5827abb5b3ae7a4b4302c31) Thanks [@tjosepo](https://github.com/tjosepo)! - Omit "router" from routerProviderProps

## 3.0.0

### Minor Changes

- [#115](https://github.com/gsoft-inc/wl-squide/pull/115) [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - A new `features` option is now available with the `defineConfig` functions to add the `@squide/i18next` package to the shared dependencies.

### Patch Changes

- Updated dependencies [[`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4), [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4), [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4)]:
  - @squide/msw@2.0.5
  - @squide/core@3.1.0
  - @squide/webpack-configs@1.1.0
  - @squide/react-router@3.0.1
  - @squide/webpack-module-federation@3.0.1

## 2.0.0

### Minor Changes

- [#112](https://github.com/gsoft-inc/wl-squide/pull/112) [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - Added a new `FireflyRuntime` class. This class should be used by all consumer applications rather than the previous `Runtime` class from `@squide/react-router`.
  - The `FireflyRuntime` class has a `registerRequestHandlers` function and a `requestHandlers` getter. Consumer applications should use these instead of the `MSwPlugin`.
  - Added a new layer of define functions (`defineDevHostConfig`, `defineBuildHostConfig`, `defineDevRemoteModuleConfig`, `defineBuildRemoteModuleConfig`). These functions should be used by all consumer applications rather than the previous define functions from `@squide/wbepack-module-federation`.
  - Forward every exports from `@squide/core`, `@squide/react-router`, `@squide/webpack-module-federation`, `@squide/webpack-configs` and `@squide/msw`. Consumer applications should now import everything from `@squide/firefly` except the fakes implementations that should still be imported from `@squide/fakes`.

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11), [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11), [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11), [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/webpack-configs@1.0.0
  - @squide/webpack-module-federation@3.0.0
  - @squide/core@3.0.0
  - @squide/react-router@3.0.0
  - @squide/msw@2.0.4

## 1.0.1

### Patch Changes

- Updated dependencies [[`58097a2`](https://github.com/gsoft-inc/wl-squide/commit/58097a2fbaa7e5942cbe6f9b765fe471d52758d8)]:
  - @squide/msw@2.0.3

## 1.0.0

### Major Changes

- [#103](https://github.com/gsoft-inc/wl-squide/pull/103) [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This is a new package that offer a base `AppRouter` component for the "firefly" stack: React Router + MSW + Webpack

  Basic usage of the new base `AppRouter` component:

  ```tsx
  import { AppRouter as FireflyAppRouter } from "@squide/firefly";

  function Loading() {
    return <div>Loading...</div>;
  }

  function BootstrappingErrorBoundary() {
    return <div>An error occured while bootstrapping the application.</div>;
  }

  export function AppRouter() {
    return (
      <FireflyAppRouter
        fallbackElement={<Loading />}
        errorElement={<BootstrappingErrorBoundary />}
        waitForMsw={false}
      />
    );
  }
  ```

  Advanced usage with public data, protected data, MSW and deferred registrations:

  ```tsx
  export function AppRouter({
    waitForMsw,
    sessionManager,
    telemetryService,
  }: AppRouterProps) {
    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
    const [subscription, setSubscription] = useState<Subscription>();

    const logger = useLogger();
    const runtime = useRuntime();

    const handleLoadPublicData = useCallback(
      (signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, logger, signal);
      },
      [logger]
    );

    const handleLoadProtectedData = useCallback(
      (signal: AbortSignal) => {
        const setSession = (session: Session) => {
          sessionManager.setSession(session);
        };

        return fetchProtectedData(setSession, setSubscription, logger, signal);
      },
      [logger, sessionManager]
    );

    const handleCompleteRegistration = useCallback(() => {
      return completeModuleRegistrations(runtime, {
        featureFlags,
      });
    }, [runtime, featureFlags]);

    return (
      <FeatureFlagsContext.Provider value={featureFlags}>
        <SubscriptionContext.Provider value={subscription}>
          <TelemetryServiceContext.Provider value={telemetryService}>
            <FireflyAppRouter
              fallbackElement={<Loading />}
              errorElement={<BootstrappingErrorBoundary />}
              waitForMsw={waitForMsw}
              onLoadPublicData={handleLoadPublicData}
              onLoadProtectedData={handleLoadProtectedData}
              onCompleteRegistration={handleCompleteRegistration}
            />
          </TelemetryServiceContext.Provider>
        </SubscriptionContext.Provider>
      </FeatureFlagsContext.Provider>
    );
  }
  ```

### Patch Changes

- Updated dependencies [[`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90), [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90), [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90)]:
  - @squide/react-router@2.0.2
  - @squide/webpack-module-federation@2.2.0
  - @squide/msw@2.0.2
