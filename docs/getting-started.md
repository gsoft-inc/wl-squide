---
order: 90
icon: rocket
---

# Getting started

Welcome to the `@squide` documentation. This page will give you an [overview](#overview) of `@squide` and a [quick start](#quick-start) to configure a new federated application from nothing.

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

The shell itself is a very thin [API layer](/reference) on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com) with the goal of maximizing both libraries forces and staying as most as possible out of their ways.

#### Why Webpack Module Federation?

We identified **2 major problems** with frontend federated applications:
1. How to prevent loading the same large dependencies twice when switching between *modules*?
2. How to offer a cohesive experience that doesn't feels *modular*?

We believe [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) solves the first problem by offering a mecanism capable of **deduping at runtime** the **common dependencies shared** by the **host** application and the **remote** modules. 

With this mecanism in place, all federated parts of an application can now be loaded in the same [browsing context](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context) instead of nested browsing contexts (like [iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). 

By sharing the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)), federated parts are now unified and **form a single application**, which solves the second issues.

With [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/), we think that we have the possibility of developing federated applications that feels like monolithic applications from a user perspective.

#### Why React Router?

Well, what would you rather use? Joking aside, [React Router](https://reactrouter.com) version 6 nesting routing feature is ideal for federated application as it makes the UI heavily composable and decoupled.

## Quick start

### Install the packages

Open a terminal at the root of the host application project and install the following packages:

+++ pnpm
```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation
```
+++ yarn
```bash
yarn add @squide/core @squide/react-router @squide/webpack-module-federation
```
+++ npm
```bash
npm install @squide/core @squide/react-router @squide/webpack-module-federation
```
+++

Then open a terminal at the root of every remote module project and install the following packages:

+++ pnpm
```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation
```
+++ yarn
```bash
yarn add @squide/core @squide/react-router @squide/webpack-module-federation
```
+++ npm
```bash
npm install @squide/core @squide/react-router @squide/webpack-module-federation
```
+++

### Configure the shell

TBD

### Transient setup with local modules

TBD
