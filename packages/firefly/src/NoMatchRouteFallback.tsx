export function NoMatchRouteFallback() {
    return (
        <div>
            <h1>404 not found</h1>
            <p>This page has been dynamically added by Squide to fix an issue with the <code>AppRouter</code> component. <strong>Please replace this page in your application by a <a href="https://reactrouter.com/en/main/start/tutorial#handling-not-found-errors">custom match page</a>.</strong></p>
            <p>The code should be like the following:</p>
            <pre style={{ backgroundColor: "rgb(243, 245, 249)", color: "rgb(21, 25, 40)", padding: "4px 10px", border: "1px solid rgb(225, 229, 239)" }}>
{`runtime.registerRoute({
    $visibility: "public",
    path: "*",
    lazy: import("./NoMatchPage.tsx")
});`}
            </pre>
        </div>
    )
}

export const Component = NoMatchRouteFallback;
