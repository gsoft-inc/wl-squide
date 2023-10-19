---
toc:
    depth: 2-3
---

# ManagedRoutes

A placeholder indicating where in the routing tree should the managed routes be rendered. The `ManagedRoutes` placeholder concept is similar to React Router's [outlet](https://reactrouter.com/en/main/components/outlet), it's a pipeline to inject routes at a predetermined location.

> A managed route is a route that is neither [hoisted](../runtime/runtime-class.md#register-an-hoisted-route) or nested with a [parentPath](../runtime/runtime-class.md#register-nested-routes-under-an-existing-route) or [parentName](../runtime/runtime-class.md#register-a-named-route) option.

## Reference

```tsx
runtime.registerRoute({
    children: [
        ManagedRoutes
    ]
}, { hoist: true });
```

### Parameters

None

## Usage

The registration of the route including the `ManagedRoutes` placeholder must be [hoisted](../runtime/runtime-class.md#register-an-hoisted-route), otherwise there will be an infinite loop as the placeholder will render in the placeholder.

```tsx !#20,27 shell/src/register.tsx
import { ManagedRoutes } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { AuthenticatedLayout } from "./AuthenticatedLayout.tsx";

runtime.registerRoute({
    // Pathless route to declare a root layout.
    $visibility: "public",
    element: <RootLayout />,
    children: [
        {
            // Pathless route to declare a root error boundary.
            $visibility: "public",
            errorElement: <RootErrorBoundary />,
            children: [
                {
                    // Pathless route to declare an authenticated layout.
                    element: <AuthenticatedLayout />
                    children: [
                        ManagedRoutes
                    ]
                }
            ]
        }
    ]
}, {
    hoist: true
});
```
