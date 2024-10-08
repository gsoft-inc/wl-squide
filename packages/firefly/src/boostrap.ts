import { isFunction, registerLocalModules, type ModuleRegisterFunction, type ModuleRegistrationError, type RegisterModulesOptions, type TrackerSpan } from "@squide/core";
import { registerRemoteModules, type RemoteDefinition, type RemoteModuleRegistrationError } from "@squide/module-federation";
import { setMswAsReady } from "@squide/msw";
import { ApplicationBoostrappedEvent, DeferredRegistrationsUpdatedEvent, ModulesReadyEvent, ModulesRegisteredEvent, MswReadyEvent, ProtectedDataReadyEvent, ProtectedDataUpdatedEvent, PublicDataReadyEvent, PublicDataUpdatedEvent } from "./AppRouterReducer.ts";
import type { FireflyRuntime } from "./FireflyRuntime.tsx";

export type StartMswFunction<TRuntime = FireflyRuntime> = (runtime: TRuntime) => Promise<void>;

export interface BootstrapAppOptions<TRuntime extends FireflyRuntime = FireflyRuntime, TContext = unknown, TData = unknown> extends RegisterModulesOptions<TContext> {
    localModules?: ModuleRegisterFunction<TRuntime, TContext, TData>[];
    remotes?: RemoteDefinition[];
    startMsw?: StartMswFunction<TRuntime>;
}

export async function bootstrap<TRuntime extends FireflyRuntime = FireflyRuntime, TContext = unknown, TData = unknown>(runtime: TRuntime, options: BootstrapAppOptions<TRuntime, TContext, TData> = {}) {
    const {
        localModules,
        remotes,
        context,
        startMsw
    } = options;

    // Track squide boostrapping performance.
    const bootstrappingSpan = await runtime.tracker.startSpan("squide-boostrapping");

    registerTrackingListeners(runtime, bootstrappingSpan);

    let localModuleErrors: ModuleRegistrationError[] = [];
    let remoteModuleErrors: RemoteModuleRegistrationError[] = [];

    if (localModules) {
        localModuleErrors = await registerLocalModules<TRuntime, TContext, TData>(localModules, runtime, { context });

        // TODO: Trace module load failure?
        // TODO: Also log modules errors to the console
    }

    if (remotes) {
        remoteModuleErrors = await registerRemoteModules(remotes, runtime, { context });

        // TODO: Trace module load failure?
        // TODO: Also log modules errors to the console
    }

    if (runtime.isMswEnabled) {
        if (!isFunction(startMsw)) {
            throw new Error("[squide] When MSW is enabled, the \"startMsw\" option must be provided.");
        }

        startMsw(runtime)
            .then(() => {
                // Indicate to resources that are dependent on MSW that the service has been started.
                setMswAsReady();
            })
            .catch((error: unknown) => {
                runtime.logger.debug("[squide] An error occured while starting MSW.", error);
            });
    }

    return {
        localModuleErrors,
        remoteModuleErrors
    };
}

function registerTrackingListeners(runtime: FireflyRuntime, bootstrappingSpan: TrackerSpan) {
    // End bootstrapping tracking.
    runtime.eventBus.addListener(ApplicationBoostrappedEvent, () => {
        bootstrappingSpan.end();
    });

    runtime.eventBus.addListener(ModulesRegisteredEvent, () => {
        bootstrappingSpan.addEvent("modules-registered");
    });

    runtime.eventBus.addListener(ModulesReadyEvent, () => {
        bootstrappingSpan.addEvent("modules-ready");
    });

    runtime.eventBus.addListener(MswReadyEvent, () => {
        bootstrappingSpan.addEvent("msw-ready");
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        bootstrappingSpan.addEvent("public-data-ready");
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        bootstrappingSpan.addEvent("protected-data-ready");
    });

    runtime.eventBus.addListener(PublicDataUpdatedEvent, () => {
        bootstrappingSpan.addEvent("public-data-updated");
    });

    runtime.eventBus.addListener(ProtectedDataUpdatedEvent, () => {
        bootstrappingSpan.addEvent("protected-data-updated");
    });

    runtime.eventBus.addListener(DeferredRegistrationsUpdatedEvent, () => {
        bootstrappingSpan.addEvent("deferred-registrations-updated");
    });
}
