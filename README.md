# wl-squide

A federated web application shell built on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com/en/main).

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![CI](https://github.com/workleap/wl-squide/actions/workflows/ci.yml/badge.svg)](https://github.com/workleap/wl-squide/actions/workflows/ci.yml)

| Name | NPM |
| --- | --- |
| [@squide/core](packages/core/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/core)](https://www.npmjs.com/package/@squide/core) |
| [@squide/react-router](packages/react-router/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/react-router)](https://www.npmjs.com/package/@squide/react-router) |
| [@squide/webpack-module-federation](packages/webpack-module-federation/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/webpack-module-federation)](https://www.npmjs.com/package/@squide/webpack-module-federation) |
| [@squide/fakes](packages/fakes/README.md) | [![npm version](https://img.shields.io/npm/v/@squide/fakes)](https://www.npmjs.com/package/@squide/fakes) |

## Overview

We built this shell to facilitate the adoption of federated applications at Workleap. The shell itself is a very thin layer on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com/en/main) with the goal of helping feature teams structure their federated application and enable patterns that we believe will help successfully implement a distributed architecture.

### Webpack Module Federation

There are 2 major issues with frontend federated applications:
1. Prevent loading the same large dependencies twice when switching between "modules"
2. Offer a cohesive experience that doesn't feels "modular"

[Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) helps with the first issue by offering a mecanism capable of **deduping at runtime** the **dependencies shared** by the **host** application and the **remote** modules. With this mecanism in place, all federated parts of an application can now be loaded in the same [browsing context](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context) instead of nested browsing context (with [iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). By sharing the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)), federated parts are unified and form a single application, which solves the second issues.

Still, there's a cost to Webpack Module Federation that feature teams must be aware of.. **Configuring** and updating **shared dependencies** (that will be deduped at runtime) **is tricky**:
- A shared dependency must be declared in the host application and every remote module sharing the dependency.
- For a shared dependency to be updated without causing any downtime, every shared dependency must be backward compatible until the host application and every remote modules updated to the new version.

### React Router

[React Router](https://reactrouter.com/en/main) nesting routing feature is ideal for federated application as it makes the UI composable and decoupled.


## Installation

### Standard setup with remote modules

Open a terminal in the host application and install the following packages:

```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation
```

Open a terminal in every remote modules and install the following packages:

```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation
```

### Transient setup strictly with local modules

Open a terminal in the host application and install the following packages:

```bash
pnpm add @squide/core @squide/react-router
```

Open a terminal in every local modules and install the following packages:

```bash
pnpm add @squide/core @squide/react-router
```

## Guides

TBD

## API

### @squide/core

#### Runtime

##### class Runtime({ loggers, services, sessionAccessor })

### @squide/react-router

### @squide/webpack-module-federation

### @squide/fake

## 🤝 Contributing

View the [contributor's documentation](./CONTRIBUTING.md).


