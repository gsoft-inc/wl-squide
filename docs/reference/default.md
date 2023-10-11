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
- [registrationStatus](registration/registrationStatus.md)
- [useAreModulesReady](registration/useAreModulesReady.md)

### Routing

- [useHoistedRoutes](routing/useHoistedRoutes.md)
- [useRenderedNavigationItems](routing/useRenderedNavigationItems.md)

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

### Webpack

- [defineDevHostConfig](webpack/defineDevHostConfig.md)
- [defineDevRemoteModuleConfig](webpack/defineDevRemoteModuleConfig.md)
- [defineBuildHostConfig](webpack/defineBuildHostConfig.md)
- [defineBuildRemoteModuleConfig](webpack/defineBuildRemoteModuleConfig.md)

## Fakes

Squide offers a collection of fake implementations to facilitate the development of modules in isolation from the other parts of the application.

- [LocalStorageSessionManager](fakes/LocalStorageSessionManager.md)
