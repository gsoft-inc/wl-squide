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

export const features = {
    i18next: true
};
