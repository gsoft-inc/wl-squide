// @ts-check

export function getSharedDependencies() {
    return {
        "@endpoints/layouts": {
            singleton: true,
            eager: true
        },
        "@endpoints/shared": {
            singleton: true,
            eager: true
        }
    };
}

/**
 * @type {import("@squide/firefly-webpack-configs").FireflyFeatures}
 */
export const features = {
    i18next: true,
    environmentVariables: true,
    honeycomb: true
};
