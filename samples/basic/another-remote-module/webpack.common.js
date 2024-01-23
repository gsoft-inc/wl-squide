// @ts-check

/**
 * @param {boolean} isHost
 * @returns {Record<string, any>}
 */
export function getSharedDependencies(isHost) {
    return {
        "@basic/shared": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}
