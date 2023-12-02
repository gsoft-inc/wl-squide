---
order: 960
---

# Manage shared state

Effective management of shared state is a crucial aspect of a federated application and can become problematic if not handled carefully. As a general rule, a host application and its modules should never share state.

## Forward the initial data

However, at certain points in the lifecycle of a federated application, the host will need to fetch initial data that must be fordwarded to the modules. Such examples include a user session and a user tenant subscription status:

- To forward a user session object, a built-in [sessionAccessor](../reference/runtime/runtime-class.md#parameters) function is available.

- To forward other types of initial data, such as a user tenant subscription, as shown in the [fetch initial data](./fetch-initial-data.md#fetch-the-data-1) guide, the data can be forwarded to modules through a React context.

## React Query cache

Lastly, as detailed in the [fetch page data](./fetch-page-data.md#setup-the-query-client) guide, the React Query cache should not be shared between the host and its modules. To do so, both the host application and every module should instantiate their own `QueryClient` instance.
