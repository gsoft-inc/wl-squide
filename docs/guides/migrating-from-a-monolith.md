---
order: 10
label: Migrating from a monolith
---

# Migrating from a monolithic application

It's easier to build a new federated application from scratch than retrofitting an existing [monolithic application](https://en.wikipedia.org/wiki/Monolithic_application) into a distributed architecture. 

However, it's also a **bad idea** to **start** a new application **with a distributed architecture** because teams usually don't know enough about their business domain at that time. Therefore, it usually make sense for most applications to **start as monolithic** and later on be transitioned to federated applications.

With the introduction of [local modules](/references/registration/registerLocalModules.md), we believe `@squide` offer a new proposition which stands right in the middle of prior solutions. Instead of going full steam into Team Topology's [stream-aligned teams](https://www.shortform.com/blog/stream-aligned-teams/) and targeting full team autonomy across the board, with local modules, teams can start with a [monorepo](https://en.wikipedia.org/wiki/Monorepo) setup and add an independent local package (module) per expected [value stream](https://en.wikipedia.org/wiki/Value_stream).

Since adding/deleting local packages in a monorepo setup is pretty cheap, teams won't fear reorganizing their value streams along the way and **won't invest preemptively into an distributed** CI/CD **infrastructure** as local modules are part of the host application build. With independent value streams, teams will be well positioned to transition toward a federated application once they can justify the cost.

If your project is **already a monolithic application** with a [polyrepo setup](https://github.com/joelparkerhenderson/monorepo-vs-polyrepo#what-is-polyrepo) and you are looking to migrate to a distributed architecture, we also recommend a decoupling first strategy with local modules and a monorepo setup.

## Decoupling first

The main obstacle toward migrating to a distributed architecture is coupling. Thus, starting by decoupling the monolith into **composable value streams** could be the right strategy for most applications. It's a great way to get into the migration without having to immediately update the CI/CD infrastructure and change developers habits.

We recommend the following steps:

1- Transform the codebase into a monorepo setup.

2- Add independent local packages (modules) for every identified value stream.

3- Move the monolithic application code to their corresponding newly created value stream local packages and make sure an **value stream can be developed independently** (e.g. without having to start the whole application).

4- Import and [register the local packages](/references/registration/registerLocalModules.md) (modules) into the host application.

5- Finally, move from local modules to [remote modules](/references/registration/registerRemoteModules.md) and update the CI/CD pipelines to start deploying modules independently.
