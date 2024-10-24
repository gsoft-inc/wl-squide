import type { Instrumentation, InstrumentationConfig } from "@opentelemetry/instrumentation";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-web";
import { FireflyRuntime } from "@squide/firefly";
import { getHoneycombSdkOptions } from "../src/registerHoneycombInstrumentation.ts";

class DummyInstrumentation implements Instrumentation {
    instrumentationName: string = "dummy";
    instrumentationVersion: string = "1.0.0";

    disable(): void {
        throw new Error("Method not implemented.");
    }

    enable(): void {
        throw new Error("Method not implemented.");
    }

    setTracerProvider(): void {
        throw new Error("Method not implemented.");
    }

    setMeterProvider(): void {
        throw new Error("Method not implemented.");
    }

    setConfig(): void {
        throw new Error("Method not implemented.");
    }

    getConfig(): InstrumentationConfig {
        throw new Error("Method not implemented.");
    }
}

class DummySpanProcessor implements SpanProcessor {
    forceFlush(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    onStart(): void {
        throw new Error("Method not implemented.");
    }

    onEnd(): void {
        throw new Error("Method not implemented.");
    }

    shutdown(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

test("when debug is true", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        debug: true,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when debug is false", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        debug: false,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when the runtime mode is \"development\"", () => {
    const runtime = new FireflyRuntime({
        mode: "development"
    });

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when the runtime mode is \"production\"", () => {
    const runtime = new FireflyRuntime({
        mode: "production"
    });

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("with custom instrumentations", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        instrumentations: [new DummyInstrumentation()],
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("with custom span processors", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        spanProcessors: [new DummySpanProcessor()],
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when fetch instrumentation is false", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        fetchInstrumentation: false,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when fetch instrumentation is a custom function", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        fetchInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when xml http instrumentation is false", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        xmlHttpInstrumentation: false,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when xml http instrumentation is a custom function", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        xmlHttpInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when document load instrumentation is false", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        documentLoadInstrumentation: false,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when document load instrumentation is a custom function", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        documentLoadInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when user interaction instrumentation is false", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        userInteractionInstrumentation: false,
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("when user interaction instrumentation is a custom function", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        userInteractionInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("with a single transformer", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        transformers: [
            options => {
                options.serviceName = "toto";

                return options;
            }
        ],
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});

test("with multiple transformers", () => {
    const runtime = new FireflyRuntime();

    const result = getHoneycombSdkOptions(runtime, "foo", ["/foo"], {
        transformers: [
            options => {
                options.serviceName = "toto";

                return options;
            },
            options => {
                options.apiKey = "toto";

                return options;
            }
        ],
        apiKey: "123"
    });

    expect(result).toMatchSnapshot();
});
