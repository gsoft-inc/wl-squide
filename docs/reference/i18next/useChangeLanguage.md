---
order: 70
toc:
    depth: 2-3
---

# useChangeLanguage

Provide a function to change the current language of every [i18next](https://www.i18next.com/) instance registered with the [i18nextPlugin](./i18nextPlugin.md) instance.

## Reference

```tsx
const changeLanguage = useChangeLanguage()
```

### Parameters

None

### Returns

A function to change the current language of a `i18nextPlugin` instance.

## Usage

```tsx
import { useChangeLanguage } from "@squide/i18next";

const changeLanguage = useChangeLanguage();

changeLanguage("fr-CA");
```
