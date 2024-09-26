---
order: 830
---

# Use environment variables

Environment variables are incredibly useful when working with multiple environments, such as `dev`, `staging`, and `production`, by decoupling configuration from the code. This allows to change an application's behavior without modifying the code itself.

A common example is the URLs of dedicated API services, where each environment uses a different URL.

In webpack, environment variables are typically passed from the CLI to the application code using the [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) and accessed through `process.env`, for example: `process.env.BASE_API_URL`.

While this approach works, it has a few downsides:

- It's not ideal for testing. Code under test that expects an environment variable to be accessible from `process.env` will fail if the value is not mocked or defined.
- It's not well-suited for Storybook and Chromatic. Story code that expects an environment variable to be accessible from `process.env` will fail if the value is not defined.
- It complicates [module development in isolation](./develop-a-module-in-isolation.md). A modular application [shell](./develop-a-module-in-isolation.md#create-a-shell-package) often makes requests to multiple endpoints, which change based on the environment. These endpoints require environment variables to define their URLs. We don't want every module to repeatedly duplicate the shell's environment variables, we want the shell library to include those environment variables.
