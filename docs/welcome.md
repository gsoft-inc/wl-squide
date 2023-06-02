---
order: 100
icon: home
layout: central
---

<style>
    #welcome h1 {
        display: none;
    }

    .squide-container {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin-top: 5rem;
    }

    .squide-inner h1 {
        display: block;
        margin-bottom: 1rem;
        font-size: 2.5rem;
    }

    /* Always hide the header anchor */
    .squide-inner h1 a {
        display: none !important;
    }

    .squide-tagline > p {
        font-size: 1.5rem;
    }

    .squide-buttons p {
        display: inline-flex;
        column-gap: 18px;
    }
</style>

:::squide-container
:::squide-inner
# 🦑 @squide (with an "e")
:::squide-tagline
The federated application shell for Workleap apps
:::squide-buttons
[!button size="l" icon="rocket" text="Get started"](/getting-started)
[!button size="l" variant="info" icon="arrow-right" iconAlign="right" text="API reference"](/references)
:::
:::







