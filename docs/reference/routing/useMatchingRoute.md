---
toc:
    depth: 2-3
---

# useMatchingRoute

Execute [React Router's matching algorithm](https://reactrouter.com/en/main/utils/match-routes) against the registered routes and a given `location` to determine if any route match the location.

## Reference

```ts
const matchingRoute = useMatchingRoute(locationArg)
```

### Parameters

- `locationArg`: The location to match the route paths against.

### Returns

A matching `Route` object if there's a matching route, otherwise an `Error` is thrown.

## Usage

### Using `useLocation`

```ts
import { useLocation } from "react-router-dom";
import { useMatchingRoute } from "@squide/react-router";

const location = useLocation();
const activeRoute = useMatchingRoute(location);
```

### Using `window.location`

```ts
import { useMatchingRoute } from "@squide/react-router";

const activeRoute = useMatchingRoute(window.location);
```
