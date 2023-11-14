---
"@squide/firefly": minor
---

- Added a new `FireflyRuntime` class. This class should be used by all consumer applications rather than the previous `Runtime` class from `@squide/react-router`.
- The `FireflyRuntime` class has a `registerRequestHandlers` function and a `requestHandlers` getter. Consumer applications should use these instead of the `MSwPlugin`.
- Added a new layer of define functions (`defineDevHostConfig`, `defineBuildHostConfig`, `defineDevRemoteModuleConfig`, `defineBuildRemoteModuleConfig`). These functions should be used by all consumer applications rather than the previous define functions from `@squide/wbepack-module-federation`.
- Forward every exports from `@squide/core`, `@squide/react-router`, `@squide/webpack-module-federation`, `@squide/webpack-configs` and `@squide/msw`. Consumer applications should now import everything from `@squide/firefly` except the fakes implementations that should still be imported from `@squide/fakes`.
