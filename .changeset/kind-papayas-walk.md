---
"@squide/msw": major
---

This is a new package to help with [Mock Service Worker](https://mswjs.io/) in a federated application.

It helps to register their request handlers:

**In module:**

```ts
const mswPlugin = getMswPlugin(runtime);
mswPlugin.registerRequestHandlers(requestHandlers);
```

**In the host app:**

```ts
import("../mocks/browser.ts").then(({ startMsw }) => {
     startMsw(mswPlugin.requestHandlers);

     setMswAsStarted();
});
```

And offer an utility to wait for MSW to be started before rendering the app:

```ts
const isMswStarted = useIsMswStarted(process.env.USE_MSW);
```
