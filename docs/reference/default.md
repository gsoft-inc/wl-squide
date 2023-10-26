---
order: 70
icon: gear
expanded: true
---

# Reference

## Artefacts

- [Packages](packages.md)

## API

### Runtime

- [Runtime class](runtime/runtime-class.md)
- [RuntimeContext](runtime/runtime-context.md)
- [useRuntime](runtime/useRuntime.md)
- [useRoutes](runtime/useRoutes.md)
- [useNavigationItems](runtime/useNavigationItems.md)
- [useLogger](runtime/useLogger.md)
- [useSession](runtime/useSession.md)

### Registration

- [registerLocalModules](registration/registerLocalModules.md)
- [registerRemoteModules](registration/registerRemoteModules.md)
- [completeModuleRegistrations](registration/completeModuleRegistrations.md)
- [completeLocalModuleRegistrations](registration/completeLocalModuleRegistrations.md)
- [completeRemoteModuleRegistrations](registration/completeRemoteModuleRegistrations.md)
- [useAreModulesRegistered](registration/useAreModulesRegistered.md)
- [useAreModulesReady](registration/useAreModulesReady.md)

### Routing

- [ManagedRoutes](routing/ManagedRoutes.md)
- [useRenderedNavigationItems](routing/useRenderedNavigationItems.md)
- [useRouteMatch](routing/useRouteMatch.md)
- [useIsRouteMatchProtected](routing/useIsRouteMatchProtected.md)

### Logging

- [Logger](logging/Logger.md)
- [ConsoleLogger](logging/ConsoleLogger.md)

### Messaging

- [EventBus](messaging/EventBus.md)
- [useEventBusDispatcher](messaging/useEventBusDispatcher.md)
- [useEventBusListener](messaging/useEventBusListener.md)

### Session

- [useIsAuthenticated](session/useIsAuthenticated.md)

### Plugins

- [Plugin](plugins/plugin.md)

### webpack

- [defineDevHostConfig](webpack/defineDevHostConfig.md)
- [defineDevRemoteModuleConfig](webpack/defineDevRemoteModuleConfig.md)
- [defineBuildHostConfig](webpack/defineBuildHostConfig.md)
- [defineBuildRemoteModuleConfig](webpack/defineBuildRemoteModuleConfig.md)

### Mock Service Worker

- [MswPlugin](msw/MswPlugin.md)
- [getMswPlugin](msw/getMswPlugin.md)
- [useIsMswReady](msw/useIsMswReady.md)
- [setMswAsStarted](msw/setMswAsStarted.md)

## Fakes

Squide offers a collection of fake implementations to facilitate the development of modules in isolation from the other parts of the application.

- [LocalStorageSessionManager](fakes/LocalStorageSessionManager.md)
