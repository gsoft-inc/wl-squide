import type { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import type { Instrumentation } from "@opentelemetry/instrumentation";

export type HoneycombSdkOptions = NonNullable<ConstructorParameters<typeof HoneycombWebSDK>[number]>;
export type HoneycombSdkInstrumentations = (Instrumentation | Instrumentation[])[];
