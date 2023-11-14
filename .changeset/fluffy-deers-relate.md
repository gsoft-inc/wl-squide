---
"@squide/webpack-configs": major
---

This is a new package that includes the webpack configs. Moving the webpack configs to a standalone projects allow `@squide/firefly` to take an optionnal dependency on `webpack`. Thisis useful for local module projects that use the firefly stack but don't want to setup webpack because they do not need to support an isolated development environment.

This new packages includes:

- `defineDevHostConfig`
- `defineBuildHostConfig`
- `defineDevRemoteModuleConfig`
- `defineBuildRemoteModuleConfig`
