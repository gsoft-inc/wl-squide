---
toc:
    depth: 2-3
---

# useRouteMatch

Execute [React Router's matching algorithm](https://reactrouter.com/en/main/utils/match-routes) against the registered routes and a given `location` to determine if any route match the location.

## Reference

```ts
const match = useRouteMatch(locationArg)
```

### Parameters

- `locationArg`: The location to match the route paths against.

### Returns

A `Route` object if there's a matching route, otherwise an `Error` is thrown.

## Usage

### Using `useLocation`

```ts
import { useLocation } from "react-router-dom";
import { useRouteMatch } from "@squide/firefly";

const location = useLocation();
const activeRoute = useRouteMatch(location);
```

### Using `window.location`

```ts
import { useRouteMatch } from "@squide/firefly";

const activeRoute = useRouteMatch(window.location);
```
