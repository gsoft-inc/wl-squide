---
order: 960
---

# Manage shared state

Proper management of shared state is crucial in a federated application and can become problematic if not handled carefully. As a general rule, a host application and its modules should never share state.

## Forward the initial data

However, in the lifecycle of a federated application, the host will fetch initial data that should be fordwarded to the modules. Such examples include a user session and a user tenant subscription status.

As shown in the [Fetch initial data](./fetch-initial-data.md#fetch-the-data-1) guide, the initial data can be forwarded to modules through a React context.

## Tanstack Query

Lastly, as detailed in the [fetch page data](./fetch-page-data.md#setup-the-query-client) guide, the Tanstack Query cache should not be shared between the host and its modules. To do so, both the host application and the modules should instantiate their own `QueryClient` instance.
