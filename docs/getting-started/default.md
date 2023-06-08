---
order: 90
icon: rocket
expanded: true
---

# Getting started

Welcome to the `@squide` documentation. This section will give you an [overview](#overview) of the shell and a [quick start](create-host.md) to create a new federated application from nothing.

!!!warning The prefered way to create a new federated application for the [Workleap](https://workleap.com/) platform is by using our [foundry-cli](https://github.com/workleap/wl-foundry-cli).
+++ pnpm
```bash
pnpm create @workleap/project@latest <output-directory>
```
+++ yarn
```bash
yarn create @workleap/project@latest <output-directory>
```
+++ npm
```bash
npm create @workleap/project@latest <output-directory>
```
+++
!!!

## Overview

We built this shell to facilitate the adoption of federated applications at [Workleap](https://workleap.com/) by **enforcing patterns** that we believe will help feature teams successfully implement a distributed architecture.

The shell itself is a very thin [API layer](/references) on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com) with the goal of maximizing both libraries forces and staying as most as possible out of their ways.

### Webpack Module Federation

We identified **2 major problems** with frontend federated applications:
- How to prevent loading the same large dependencies twice when switching between *modules*?
- How to offer a cohesive experience that doesn't feels *modular*?

We believe [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) solves the first problem by offering a mecanism capable of **deduping at runtime** the **common dependencies shared** by the **host** application and the **remote** modules. 

With this mecanism in place, all federated parts of an application can now be loaded in the same [browsing context](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context) instead of nested browsing contexts (like [iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). 

By sharing the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)), federated parts are now unified and **form a single application**, which solves the second issues.

With Webpack Module Federation, we believe that we will be able to develop federated applications that feels like monolithic applications :rocket:

### React Router

React Router [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes) feature is ideal for federated application as it makes the UI heavily composable and decoupled. Anyway, which else would you use? :joy:

### Module registration

The most distinctive aspect of this shell is the conventions it enforces to load and register remote modules. Here's a rough idea of the flow:

1. At bootstrap, the host application will try to [load predefined modules](/references/registration/registerRemoteModules.md) and call a registration function matching a specific name and signature for each module that is successfully loaded.

2. During it's registration, a module will receive [the shared services](/references/runtime/runtime-class.md) of the federation application and use them to dynamically register its [routes](/references/runtime/runtime-class.md#register-routes) and [navigation items](/references/runtime/runtime-class.md#register-navigation-items).

3. Once [all the remote modules are registered](/references/registration/useAreRemotesReady.md), the host application will create a React Router [instance](https://reactrouter.com/en/main/routers/create-browser-router) with the registered routes and [render a navigation menu](/references/routing/useRenderedNavigationItems.md) with the registered navigation items.

That's it in a nutshell. Of course, there's more to it, but those are the main ideas.

### Guiding principles

While developing the [API](/references) of `@squide`, we had a few guiding principles in mind. Those principles are not settled stones, you might want to diverge from them from time to time, but adhering to those will make your experience more enjoyable:

- A module should always match a subdomain of the application business domain and should only export pages.

- A module should be fully autonomous. It shouldn't have to coordinate with other parts of the application for things as trivial as navigation links.

- A federated application should feel homogenous. Different parts of a federation application should have the ability to communicate with each others and react to changes happening outside of their boundaries.

- Data and state should never be shared between parts of a federated application. Even if two parts needs the same data or the same state values, they should load, store and manage those independently.

### Limitations

[Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) comes with a few limitations that are manageable, but important to consider when architecturing your distributed application:

- A [shared dependency](https://webpack.js.org/plugins/module-federation-plugin/#sharing-hints) cannot be tree-shaken. Since remote modules are loaded at runtime, [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin) can't infer which parts of a shared dependency will be used by the application modules. Therefore, tree-shaking is disabled for shared dependencies.

- React's [Fast Refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin) is not supported by Webpack Module Federation. It does support [Webpack Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) thought.

> Those limitations are not specific to `@squide`, they are specific to Webpack Module Federation.


