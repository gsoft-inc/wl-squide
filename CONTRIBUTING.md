# Contributing

The following documentation is only for the maintainers of this repository.

- [Monorepo setup](#monorepo-setup)
- [Project overview](#project-overview)
- [Installation](#installation)
- [Develop the shell packages](#develop-the-shell-packages)
- [Release the packages](#release-the-packages)
- [Deploy the sample applications](#deploy-the-sample-applications)
- [Available commands](#commands)
- [CI](#ci)
- [Add a new package to the monorepo](#add-a-new-package-to-the-monorepo)

## Monorepo setup

This repository is managed as a monorepo with [PNPM workspace](https://pnpm.io/workspaces) to handle the installation of the npm dependencies and manage the packages interdependencies.

It's important to note that PNPM workspace doesn't hoist the npm dependencies at the root of the workspace as most package manager does. Instead, it uses an advanced [symlinked node_modules structure](https://pnpm.io/symlinked-node-modules-structure). This means that you'll find a `node_modules` directory inside the packages folders as well as at the root of the repository.

The main difference to account for is that the `devDependencies` must now be installed locally in every package `package.json` file rather than in the root `package.json` file.

## Project overview

This project is split into two major sections, [packages/](packages/) and [samples/](samples/).

### Packages

Under [packages/](packages/) are the actual packages composing the federated application shell.

### Samples

Under [samples/](samples/) are applications to test the Squide functionalities while developing.

You'll find two samples:

- `basic`: A sample application showcasing the basic features or Squide.
- `endpoints`: A more complexe sample application showcasing the different usecases related to data fetching and localization.

## Installation

This project uses PNPM, therefore, you must install [PNPM](https://pnpm.io/installation) v9+ first:

```bash
npm install -g pnpm
```

To install the Squide project, open a terminal at the root of the workspace and execute the following command:

```bash
pnpm install
```

### Setup Retype

[Retype](https://retype.com/) is the documentation platform that Squide is using for its documentation. As this project is leveraging a few [Pro features](https://retype.com/pro/) of Retype.

Everything should work fine as-is but there are a few limitations to use Retype Pro features without a wallet with a licence. If you want to circumvent these limitations, you can optionally, setup your [Retype wallet](https://retype.com/guides/cli/#retype-wallet).

To do so, first make sure that you retrieve the Retype license from your Vault (or ask IT).

Then, open a terminal at the root of the workspace and execute the following command:

```bash
npx retype wallet --add <your-license-key-here>
```

## Develop the packages

We recommend opening two [VSCode terminals](https://code.visualstudio.com/docs/terminal/basics#_managing-multiple-terminals) to develop the packages.

With the first terminal, execute the following script:

```bash
pnpm dev
```

With the second terminal, start one of the sample application with either the following script:

```bash
pnpm dev-basic
```

or

```bash
pnpm dev-endpoints
```

You can then open your favorite browser and navigate to `http://localhost:8080/` to get a live preview of your code.

> To test that a remote module is working correctly, navigate to the remote module entry file. For a remote module hosted on the port `8081`, the URL should be `http://localhost:8081/remoteEntry.js`.

## Release the packages

When you are ready to release the packages, you must follow the following steps:
1. Run `pnpm changeset` and follow the prompt. For versioning, always follow the [SemVer standard](https://semver.org/).
2. Commit the newly generated file in your branch and submit a new Pull Request (PR). Changesets will automatically detect the changes and post a message in your pull request telling you that once the PR closes, the versions will be released.
3. Find someone to review your PR.
4. Merge the Pull request into `main`. A GitHub action will automatically trigger and update the version of the packages and publish them to [npm](https://www.npmjs.com/). A tag will also be created on GitHub tagging your PR merge commit.

### Troubleshooting

#### Github

Make sure you're Git is clean (No pending changes).

#### NPM

Make sure GitHub Action has **write access** to the selected npm packages.

#### Compilation

If the packages failed to compile, it's easier to debug without executing the full release flow every time. To do so, instead, execute the following command:

```bash
pnpm build
```

By default, packages compilation output will be in their respective *dist* directory.

#### Linting errors

If you got linting error, most of the time, they can be fixed automatically using `eslint . --fix`, if not, follow the report provided by `pnpm lint`.

## Deploy the sample applications

### The "basic" sample application

The sites for this sample application are hosted on [Netlify](https://www.netlify.com/):

- [host](https://squide-basic-host.netlify.app/)
- [remote-module](https://squide-basic-remote-module.netlify.app)
- [another-remote-module](https://squide-basic-another-remote-module.netlify.app)

To deploy the sample application, open a terminal at the root of the repository and execute the following script:

```bash
deploy-basic
```

A prompt with a few questions will appear and then the sits will automatically be deployed to production.

### The sample application with "endpoints"

The sites for this sample application are hosted on [Netlify](https://www.netlify.com/):

- [host](https://squide-endpoints-host.netlify.app/)
- [remote-module](https://squide-endpoints-remote-module.netlify.app)
- [remote-module (isolated)](https://squide-endpoints-remote-isolated.netlify.app/)

To deploy the sample application, open a terminal at the root of the repository and execute the following script:

```bash
deploy-endpoints
```

A prompt with a few questions will appear and then the sites will automatically be deployed to production.

Then, execute the following script:

```bash
deploy-endpoints-isolated
```

Another prompt with a few questions will appear and then the sites will automatically be deployed to production.

## Commands

From the project root, you have access to many commands. The most important ones are:

### dev

Build the shell packages for development and start the watch processes.

```bash
pnpm dev
```

### dev-basic

Build the sample "basic" application for development and start the dev servers.

```bash
pnpm dev-basic
```

### dev-endpoints

Build the sample "application with "endpoints" for development and start the dev servers.

```bash
pnpm dev-endpoints
```

### dev-docs

Build the [Retype](https://retype.com/) documentation for development and start the Retype dev server. If you are experiencing issue with the license, refer to the [setup Retype section](#setup-retype).

```bash
pnpm dev-docs
```

### build

Build the packages for release.

```bash
pnpm build
```

### build-basic

Build the sample "basic" application for release.

```bash
pnpm build-basic
```

### build-endpoints

Build the sample application with "endpoints" for release.

```bash
pnpm build-endpoints
```

### build-endpoints-isolated

Build for an isolated setup the sample application with "endpoints" for release.

```bash
pnpm build-endpoints
```

### serve-basic

Build the sample "basic" application for deployment and start a local web server to serve the application.

```bash
pnpm serve-basic
```

### serve-endpoints

Build the sample application with "endpoints" for deployment and start a local web server to serve the application.

```bash
pnpm serve-endpoints
```

### test

Run the shell packages unit tests.

```bash
pnpm test
```

### lint

Lint the shell packages files.

```bash
pnpm lint
```

### changeset

To use when you want to publish a new package version. Will display a prompt to fill in the information about your new release.

```bash
pnpm changeset
```

### clean

Clean the shell packages and the sample application (delete `dist` folder, clear caches, etc..)

```bash
pnpm clean
```

### reset

Reset the monorepo installation (delete `dist` folders, clear caches, delete `node_modules` folders, etc..)

```bash
pnpm reset
```

### list-outdated-deps

Checks for outdated dependencies. For more information, view [PNPM documentation](https://pnpm.io/cli/outdated).

```bash
pnpm list-outdated-deps
```

### update-outdated-deps

Update outdated dependencies to their latest version. For more information, view [PNPM documentation](https://pnpm.io/cli/update).

```bash
pnpm update-outdated-deps
```

## CI

We use [GitHub Actions](https://github.com/features/actions) for this repository.

You can find the configuration in the [.github/workflows](.github/workflows/) folder and the build results are available [here](https://github.com/gsoft-inc/wl-squide/actions).

We currently have 3 builds configured:

### Changesets

This action runs on a push on the `main` branch. If there is a file present in the `.changeset` folder, it will publish the new package version on npm.

### CI

This action will trigger when a commit is done in a PR to `main` or after a push to `main` and will run `build`, `lint-ci` and `test` commands on the source code.

### Retype

This action will trigger when a commit is done in a PR to `main` or after a push to `main`. The action will generate the documentation website into the `retype` branch. This repository [Github Pages](https://github.com/gsoft-inc/wl-web-configs/settings/pages) is configured to automatically deploy the website from the `retype` branch.

If you are having issue with the Retype license, make sure the `RETYPE_API_KEY` Github secret contains a valid Retype license.

## Add a new package to the monorepo

There are a few steps to add new packages to the monorepo.

Before you add a new package, please read the [Workleap GitHub guidelines](https://github.com/gsoft-inc/github-guidelines#npm-package-name).

### Create the package

First, create a new folder matching the package name in the [packages](/packages) folder.

Open a terminal, navigate to the newly created folder, and execute the following command:

```bash
pnpm init
```

Answer the CLI questions.

Once the `package.json` file is generated, please read again the [Workleap GitHub guidelines](https://github.com/gsoft-inc/github-guidelines#npm-package-name) and make sure the package name, author and license are valid.

Don't forget to add the [npm scope](https://docs.npmjs.com/about-scopes) `"@squide"` before the package name. For example, if the project name is "foo", your package name should be `@squide/foo`.

Make sure the package publish access is *public* by adding the following to the `package.json` file:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### sideEffects

Make sure to add a `sideEffect` field to the `package.json` file:

```json
{
  "sideEffects": false
}
```

Most of the time, the value will be `false` but if your package contains CSS or any other [side effect](https://sgom.es/posts/2020-06-15-everything-you-never-wanted-to-know-about-side-effects/), make sure to set the value accordingly.

### Dependencies

npm *dependencies* and *peerDependencies* must be added to the package own *package.json* file.
