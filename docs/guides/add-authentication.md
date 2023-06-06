---
order: 80
---

# Add authentication

Most of our applications (if not all) will eventually require the user to authenticate. To support that, `@squide` [Runtime](/references/runtime/runtime-class.md) class accepts a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function that is available to every module of the application once the registration flow is completed.

When combined with a React Router's authentication boundary and a login page, the `sessionAccessor` function allow 
