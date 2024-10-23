import "@squide/env-vars";

declare module "@squide/env-vars" {
    interface EnvironmentVariables {
        authenticationApiBaseUrl: string;
        featureFlagsApiBaseUrl: string;
        otherFeatureFlagsApiUrl: string;
        sessionApiBaseUrl: string;
        subscriptionApiBaseUrl: string;
    }
}
