import { toSubscriptionStatusLabel, useSubscription } from "@endpoints/shared";

export function SubscriptionPage() {
    const subscription = useSubscription();

    return (
        <div>
            <h2>Subscription</h2>
            <div>
                <span>Company: </span><span>{subscription?.company}</span>
            </div>
            <div>
                <span>Contact: </span><span>{subscription?.contact}</span>
            </div>
            <div>
                <span>Status: </span><span>{toSubscriptionStatusLabel(subscription?.status)}</span>
            </div>

        </div>
    );
}
