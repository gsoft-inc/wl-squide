---
order: 40
toc:
    depth: 2-3
---

# I18nextNavigationLabel

A React component to localize the label of Squide [navigation items](../runtime/runtime-class.md#register-navigation-items).

## Reference

```tsx
<I18nextNavigationLabel i18next={} namespace="" resourceKey="" />
```

### Properties

- `i18next`: A `i18next` instance.
- `namespace`: An optional namespace for the localized resource. If no namespace is provided, the default namespace is `"navigationItems"`.
- `resourceKey`: A localized resource key.

## Usage

```ts !#7 remote-module/src/register.tsx
import type { FireflyRuntime } from "@squide/firefly";
import { I18nextNavigationLabel } from "@squide/i18next";
import i18n from "i18next";

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n) {
    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="aboutPageLabel"  />
        to: "/about"
    });
}
```
