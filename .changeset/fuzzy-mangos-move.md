---
"@squide/webpack-module-federation": patch
---

- `eager` was defined for the common shared dependencies of the host applkicationand the modules. This was causing every dependencies to be loaded twice, fixed it.
- `useAreRemotesReady` was never being ready if there was no local modules configured, fixed it.
