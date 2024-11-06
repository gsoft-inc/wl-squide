# How to reproduce the issue

- Clone the repo: `git clone https://github.com/gsoft-inc/wl-squide.git`

- Checkout the repro branch: `git checkout troubleshoot-msw-2.6.0`

- Install the codebase with PNPM, execute at the root of the monorepo: `pnpm install`

- Compile the core packages of the monorepo by executing at the root of the monorepo: `pnpm dev`

- In **another terminal**, start the sample application by executing at the root of the monorepo: `pnpm dev-endpoints`

- You should now have 2 terminals open running scripts

- Once the sample application is started, open a browser and navigate to `http://localhost:8080`. 

- The application should render a login page. Use `temp` as the username and `temp` as the password. (Note that sometimes, with a fresh install, MSW is having issues starting the request handlers, you might have to refresh the page with CTRL+F5 a couple of times. It's a new thing by the way that we noticed in the past days.)

- You should be redirected to an homepage. The homepage request handler is in the HOST app, which should work properly with `2.6.0`.

- To reproduce the issue, you have to navigate to a page registered by a REMOTE app.

- The easiest way to do this is to navigate to "Tabs" page by clicking on the "Tabs" link in the top menu of the application.

- Once in the "Tabs" page, click on the "Episodes" link (the tab). The "Episodes" page is registered by the remote module of the sample application.

- You should notice that page loads indefinitely (you should "Loading...")

- Alternatively, you could login to the sample application using `temp` / `temp` and navigate directly to `http://localhost:8080/federated-tabs/episodes` by manually typing the url in your browser.

## How to fix the issue

- You can fix the issue by adding `msw` as a singleton dependency. As mentionned, this is not ideal though. To add `msw` as a singleton dependency, "uncomment" the following [block](https://github.com/gsoft-inc/wl-squide/blob/troubleshoot-msw-2.6.0/packages/webpack-configs/src/defineConfig.ts#L81-L84).

## Sample application topology

- The sample application code is located [here](https://github.com/gsoft-inc/wl-squide/tree/troubleshoot-msw-2.6.0/samples/endpoints)

- (Do not mind the express server, it's a recent addition to test end to end tracing with Honeycomb. It's not configured in a way that should mangle with MSW, at least, to my understanding)

- The sample application has 3 apps: [host](https://github.com/gsoft-inc/wl-squide/tree/troubleshoot-msw-2.6.0/samples/endpoints/host), [remote-module](https://github.com/gsoft-inc/wl-squide/tree/troubleshoot-msw-2.6.0/samples/endpoints/remote-module) and [local-module](https://github.com/gsoft-inc/wl-squide/tree/troubleshoot-msw-2.6.0/samples/endpoints/local-module). 

- `host` is the HOST app that instanciate a registry (through a Runtime object), provides the registry to the modules and then start the MSW service. The parts that should be of interest to you are:
    - [The registration](https://github.com/gsoft-inc/wl-squide/blob/troubleshoot-msw-2.6.0/samples/endpoints/host/src/bootstrap.tsx#L23-L31)
    - [The bootstrap function](https://github.com/gsoft-inc/wl-squide/blob/troubleshoot-msw-2.6.0/packages/firefly/src/boostrap.ts)

- `remote-module` is a REMOTE app, using [Module Federation](https://module-federation.io/). It registers it's request handlers in the [src/register.tsx](https://github.com/gsoft-inc/wl-squide/blob/troubleshoot-msw-2.6.0/samples/endpoints/remote-module/src/register.tsx#L144-L146) file.

- `local-module` is more like a LIBRARY that register pages and request handlers than an actual app. It's loaded at build time rather than at RUNTIME like a REMOTE app. I don't think this project is of interest to you.

## Devtools debugging

If you want to see the actual MSW source code with the Devtools, it's usually available in the following section of the "Sources" tabs:

```
webpack-internal://
├── node_modules
├──── .pnpm
├────── @mswjs+interceptors@0.36.10/node_modules/@mswjs/interceptors/lib/browser
```

