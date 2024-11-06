// @ts-check

/**
 * @param {boolean} isHost
 * @returns {Record<string, any>}
 */
export function getSharedDependencies(isHost) {
    return {
        "@endpoints/layouts": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@endpoints/shared": {
            singleton: true,
            eager: isHost ? true : undefined
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
