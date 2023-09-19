---
order: 60
icon: question
---

# Troubleshooting

## React context values are undefined

If you cannot shared values through a React context between the host application and the modules, it is most likely because either you are having two instances of React and the host application and the modules are not using the same instance or/and because you are having two instances of the React context.

To fix the issue:

1. Make sure that the `react` and `react-dom` dependencies are shared as a singleton between the host application and the remote modules. A React context value cannot be shared between parts of an application using a different React instance.

2. Make sure that the shared React context is in a library that is shared as a `singleton`.

3. If you are leveraging [eager](https://webpack.js.org/plugins/module-federation-plugin#eager) shared dependencies, make sure that ONLY the host application is configuring the dependencies as `eager`.

If it doesn't fix the issue, update your host application and remote modules webpack build config with `optimize: false`, then build the bundles and serve them. Open a browser, open the DevTools, switch to the Network tab (make sure JS files will be listed), navigate to the home page of the application and inspect the downloaded bundle files. The React context definition should only be included once, otherwise you have multiple instances of the React context.

For more information about shared dependency versioning, refer to: https://github.com/patricklafrance/wmf-versioning.
