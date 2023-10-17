---
toc:
    depth: 2-3
---

# useIsMatchingRouteProtected

Execute [React Router's matching algorithm](https://reactrouter.com/en/main/utils/match-routes) against the registered routes and a given `location` to determine if any route match the location and whether or not that matching route is protected.

## Reference

```ts
const isProtected = useIsMatchingRouteProtected(locationArg)
```

### Parameters

- `locationArg`: The location to match the route paths against.

### Returns

A `boolean` value. `true` if there's a matching route and the route is protected, `false` otherwise.

## Usage

### Using `useLocation`

```ts
import { useLocation } from "react-router-dom";
import { useIsMatchingRouteProtected } from "@squide/react-router";

const location = useLocation();
const isActiveRouteProtected = useIsMatchingRouteProtected(location);
```

### Using `window.location`

```ts
import { useIsMatchingRouteProtected } from "@squide/react-router";

const isActiveRouteProtected = useIsMatchingRouteProtected(window.location);
```
