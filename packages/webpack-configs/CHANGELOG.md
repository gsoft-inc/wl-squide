# @squide/webpack-configs

## 1.0.0

### Major Changes

- [#112](https://github.com/gsoft-inc/wl-squide/pull/112) [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This is a new package that includes the webpack configs. Moving the webpack configs to a standalone projects allow `@squide/firefly` to take an optionnal dependency on `webpack`. Thisis useful for local module projects that use the firefly stack but don't want to setup webpack because they do not need to support an isolated development environment.

  This new packages includes:

  - `defineDevHostConfig`
  - `defineBuildHostConfig`
  - `defineDevRemoteModuleConfig`
  - `defineBuildRemoteModuleConfig`

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/webpack-module-federation@3.0.0
