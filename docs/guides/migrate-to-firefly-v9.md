---
order: 710
label: Migrate to firefly v9
---

# Migrate to firefly v9

This major version of `@squide/firefly` introduces [TanStack Query]() as the official library for fetching global data and features a complete rewrite of the [AppRouter]() component, which now uses a state machine to manage the application's bootstrapping flow.

Prior to `v9`, Squide applications couldn't use TanStack Query to fetch global data, making it **challenging** for Workleap's applications to **keep** their **global data** in **sync** with the **server state**. With `v9`, applications can now leverage custom wrappers of the [useQueries]() hook to fetch and keep their global data up-to-date. Additionally, the new [deferred registrations]() update feature allows applications to **keep** their conditional **navigation items in sync** with the server state.

These changes have significantly impacted the API surface of Squide.

## Breaking changes

## Additions

## 
