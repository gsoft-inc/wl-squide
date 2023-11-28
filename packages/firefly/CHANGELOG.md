# @squide/firefly

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
