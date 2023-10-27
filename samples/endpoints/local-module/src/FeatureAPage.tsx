export function FeatureAPage() {
    return (
        <>
            <h1>FeatureA page</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/local-module</code></p>
            <p>This page is only available if the <code>featureA</code> flag is active.</p>
        </>
    );
}

export const Component = FeatureAPage;
