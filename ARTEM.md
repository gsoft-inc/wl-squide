# How to reproduce the issue

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

