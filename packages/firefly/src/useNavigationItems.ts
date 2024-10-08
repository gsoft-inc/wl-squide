import { useRuntimeNavigationItems, type UseRuntimeNavigationItemsOptions } from "@squide/react-router";
import { useAppRouterState } from "./AppRouterContext.ts";

export type UseNavigationItemsOptions = UseRuntimeNavigationItemsOptions;

export function useNavigationItems(options?: UseNavigationItemsOptions) {
    // This is not the most sophisticated strategy but it seems to be good enough for now.
    // The idea is that when deferred registrations are used by the consumer applications, the deferred registrations could
    // be updated when the global data is updated. If the deferred registrations are updated, it means that the registered
    // navigation items might have been updated and a re-render must happens to display the new navigation items.
    // Since the "deferredRegistrationsUpdatedAt" state value of the AppRouterReducer is updated everytime the deferred registrations
    // are updated, subscribing to the state with useAppRouterState ensure that the navigation items will be re-rendered.
    // A more sophisticated strategy could be implemented later on if needed, something involving a subscription to the "runtime" changes, or
    // even introducing new module states.
    useAppRouterState();

    return useRuntimeNavigationItems(options);
}
