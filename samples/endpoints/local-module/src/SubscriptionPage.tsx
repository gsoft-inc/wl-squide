import { toSubscriptionStatusLabel, useSubscription } from "@endpoints/shared";

export function SubscriptionPage() {
    const subscription = useSubscription();

    return (
        <>
            <h1>Subscription</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/local-module</code></p>
            <div>
                <span>Company: </span><span>{subscription?.company}</span>
            </div>
            <div>
                <span>Contact: </span><span>{subscription?.contact}</span>
            </div>
            <div>
                <span>Status: </span><span>{toSubscriptionStatusLabel(subscription?.status)}</span>
            </div>

        </>
    );
}

export const Component = SubscriptionPage;
