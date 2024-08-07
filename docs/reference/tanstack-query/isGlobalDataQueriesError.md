---
order: 80
toc:
    depth: 2-3
---

# isGlobalDataQueriesError

Indicates whether or not an error is an instance of [GlobalDataQueriesError](#globaldataquerieserror).

!!!info
`GlobalDataQueriesError` errors are thrown by either the [usePublicDataQueries](./usePublicDataQueries.md) hook or the [useProtectedDataQueries](./useProtectedDataQueries.md) hook and should usually be handled by a global error boundary.
!!!

## Reference

```ts
const result = isGlobalDataQueriesError(error);
```

### Parameters

- `error`: An `Error` instance.

### Returns

A `boolean` value indicating whether or not the error is an instance of [GlobalDataQueriesError](#globaldataquerieserror).

## Usage

```ts
import { isGlobalDataQueriesError } from "@squide/firefly";

try {
    // ...
} catch (error: unknown) {
    if (isGlobalDataQueriesError(error)) {
        // ...
    }
}
```

## GlobalDataQueriesError

- `message`: The error message.
- `errors`: An array of `Error` instances.
