import type { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";

export type HoneycombSdkOptions = NonNullable<ConstructorParameters<typeof HoneycombWebSDK>[number]>;
export type HoneycombSdkOptionsTransformer = (options: HoneycombSdkOptions) => HoneycombSdkOptions;

// Must specify the return type, otherwise we get a TS4058: Return type of exported function has or is using name X from external module "XYZ" but cannot be named.
export function applyTransformers(options: HoneycombSdkOptions, transformers: HoneycombSdkOptionsTransformer[]): HoneycombSdkOptions {
    return transformers.reduce((acc, transformer) => transformer(acc), options);
}


