---
toc:
    depth: 2-3
---

# useIsRouteMatchProtected

Execute [React Router's matching algorithm](https://reactrouter.com/en/main/utils/match-routes) against the registered routes and a given `location` to determine if any route match the location and whether or not that matching route is `protected`.

To take advantage of this hook, make sure to add a [$visibility hint](../runtime/runtime-class.md#register-a-public-route) to your public pages.

## Reference

```ts
const isProtected = useIsRouteMatchProtected(locationArg)
```

### Parameters

- `locationArg`: The location to match the route paths against.

### Returns

A `boolean` value indicating whether or not the matching route is `protected`. If no route match the given location, an `Error` is thrown.

## Usage

### Using `useLocation`

```ts
import { useLocation } from "react-router-dom";
import { useIsRouteMatchProtected } from "@squide/react-router";

const location = useLocation();

// Returns true if the matching route doesn't have a $visibility: "public" property.
const isActiveRouteProtected = useIsRouteMatchProtected(location);
```

### Using `window.location`

```ts
import { useIsRouteMatchProtected } from "@squide/react-router";

// Returns true if the matching route doesn't have a $visibility: "public" property.
const isActiveRouteProtected = useIsRouteMatchProtected(window.location);
```
