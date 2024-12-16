// @ts-check

export function getSharedDependencies() {
    return {
        "@basic/shared": {
            singleton: true,
            eager: true
        },
        "useless-lib": {
            singleton: true,
            eager: true
        }
    };
}
