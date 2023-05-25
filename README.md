# wl-squide

A federated web application shell built on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com/en/main).

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![CI](https://github.com/workleap/wl-squide/actions/workflows/ci.yml/badge.svg)](https://github.com/workleap/wl-squide/actions/workflows/ci.yml)

## Packages

This repository is managed as a monorepo that is composed of many npm packages.

| Name | NPM |
| --- | --- |
| [@squide/core](packages/core/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/core)](https://www.npmjs.com/package/@squide/core) |
| [@squide/react-router](packages/react-router/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/react-router)](https://www.npmjs.com/package/@squide/react-router) |
| [@squide/webpack-module-federation](packages/webpack-module-federation/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/webpack-module-federation)](https://www.npmjs.com/package/@squide/webpack-module-federation) |
| [@squide/fakes](packages/fakes/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/fakes)](https://www.npmjs.com/package/@squide/fakes) |

## Blabla

-> 2 biggest problems with frontend federated apps are:
    - How to offer a cohesive experience which doesn't feels "modular"
    - How to not load the same large dependencies twice when switching between "modules"

-> Webpack Module Federation helps with that but there's a cost
    - Dependencies update is trickier
    - Requires to configure shared dependencies
    - Library must be backward compatible until every "modules" updated to the new version

## Guides

TBD

## API

TBD

## 🤝 Contributing

View the [contributors documentation](./CONTRIBUTING.md).


