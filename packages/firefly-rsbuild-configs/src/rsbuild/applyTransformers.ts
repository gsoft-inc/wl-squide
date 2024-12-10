import type { RsbuildConfig } from "@rsbuild/core";

export interface RsbuildConfigTransformerContext {
    environment: "dev" | "build";
    verbose: boolean;
}

export type RsbuildConfigTransformer = (config: RsbuildConfig, context: RsbuildConfigTransformerContext) => RsbuildConfig;

export function applyTransformers(config: RsbuildConfig, transformers: RsbuildConfigTransformer[], context: RsbuildConfigTransformerContext) {
    return transformers.reduce((acc, transformer) => transformer(acc, context), config);
}
