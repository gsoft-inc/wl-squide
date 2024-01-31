---
order: 70
icon: gear
expanded: true
toc:
    depth: 2-3
---

# Reference

## Artefacts

- [Packages](./packages.md)

## API

### Runtime

- [FireflyRuntime class](./runtime/runtime-class.md)
- [RuntimeContext](./runtime/runtime-context.md)
- [useRuntime](./runtime/useRuntime.md)
- [useRuntimeMode](./runtime/useRuntimeMode.md)
- [useRoutes](./runtime/useRoutes.md)
- [useNavigationItems](./runtime/useNavigationItems.md)
- [useLogger](./runtime/useLogger.md)
- [usePlugin](./runtime/usePlugin.md)
- [useSession](./runtime/useSession.md)

### Registration

- [registerLocalModules](./registration/registerLocalModules.md)
- [registerRemoteModules](./registration/registerRemoteModules.md)
- [completeModuleRegistrations](./registration/completeModuleRegistrations.md)
- [completeLocalModuleRegistrations](./registration/completeLocalModuleRegistrations.md)
- [completeRemoteModuleRegistrations](./registration/completeRemoteModuleRegistrations.md)
- [useAreModulesRegistered](./registration/useAreModulesRegistered.md)
- [useAreModulesReady](./registration/useAreModulesReady.md)

### Routing

- [AppRouter](./routing/AppRouter.md)
- [ManagedRoutes](./routing/ManagedRoutes.md)
- [useRenderedNavigationItems](./routing/useRenderedNavigationItems.md)
- [useRouteMatch](./routing/useRouteMatch.md)
- [useIsRouteProtected](./routing/useIsRouteProtected.md)

### Logging

- [Logger](./logging/Logger.md)
- [ConsoleLogger](./logging/ConsoleLogger.md)

### Messaging

- [EventBus](./messaging/EventBus.md)
- [useEventBusDispatcher](./messaging/useEventBusDispatcher.md)
- [useEventBusListener](./messaging/useEventBusListener.md)

### Session

- [useIsAuthenticated](./session/useIsAuthenticated.md)

### Plugins

- [Plugin](./plugins/plugin.md)

### webpack

- [defineDevHostConfig](./webpack/defineDevHostConfig.md)
- [defineDevRemoteModuleConfig](./webpack/defineDevRemoteModuleConfig.md)
- [defineBuildHostConfig](./webpack/defineBuildHostConfig.md)
- [defineBuildRemoteModuleConfig](./webpack/defineBuildRemoteModuleConfig.md)

### Mock Service Worker

- [useIsMswReady](./msw/useIsMswReady.md)
- [setMswAsStarted](./msw/setMswAsStarted.md)

### i18next

- [i18nextPlugin](./i18next/i18nextPlugin.md)
- [getI18nextPlugin](./i18next/getI18nextPlugin.md)
- [useChangeLanguage](./i18next/useChangeLanguage.md)
- [useCurrentLanguage](./i18next/useCurrentLanguage.md)
- [useI18nextInstance](./i18next/useI18nextInstance.md)
- [I18nextNavigationItemLabel](./i18next/I18nextNavigationItemLabel.md)

### Fakes

Squide offers a collection of fake implementations designed to facilitate the set up of a module isolated environment.

- [LocalStorageSessionManager](./fakes/localStorageSessionManager.md)
- [ReadonlySessionLocalStorage](./fakes/readonlySessionLocalStorage.md)
