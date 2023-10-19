---
"@squide/webpack-module-federation": major
---

- The devserver error overlay is now disabled by default for the remote modules to prevent them from stacking on top of the host application error overlay.
- Remote modules `register` functions can now be `async`.
