import { trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { NodeSDK } from "@opentelemetry/sdk-node";
import cors from "cors";
import express, { type Request, type Response } from "express";

const sdk = new NodeSDK({
    serviceName: "squide-endpoints-sample",
    traceExporter: new OTLPTraceExporter({
        url: "https://api.honeycomb.io/v1/traces",
        headers: {
            "x-honeycomb-team": "xSffNa6OhKeROIg9aG6uAB"
        }
    }),
    instrumentations: [
        ...getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": {
                enabled: false
            }
        }),
        new ExpressInstrumentation()
    ]
});

sdk.start();

const tracer = trace.getTracer("express-server");

const app = express();
const port = 1234;

app.use(cors());

app.get("/api/otherFeatureFlags", (req: Request, res: Response) => {
    tracer.startActiveSpan("other-feature-flags", span => {
        res.json({
            otherA: true,
            otherB: true
        });

        span.end();
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
