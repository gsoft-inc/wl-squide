---
"@squide/webpack-module-federation": minor
---

- `defineBuildHostConfig`, `defineDevHostConfig`, `defineBuildRemoteModuleConfig` and `defineDevRemoteModuleConfig` `publicPath` prop is not mandatory anymore. It's default value is now `auto`.
- `defineBuildHostConfig` and `defineBuildRemoteModuleConfig` set the `HtmlWebpackPlugin` `publicPath` prop to `/` by default.
- `completeRemoteModuleRegistrations` `data` argument is now required.
