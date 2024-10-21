import {
    isFunction,
    LocalModuleDeferredRegistrationCompletedEvent,
    LocalModuleDeferredRegistrationFailedEvent,
    LocalModuleDeferredRegistrationStartedEvent,
    LocalModuleRegistrationCompletedEvent,
    LocalModuleRegistrationFailedEvent,
    LocalModuleRegistrationStartedEvent,
    registerLocalModules,
    type LocalModuleDeferredRegistrationStartedEventPayload,
    type LocalModuleRegistrationStartedEventPayload,
    type ModuleRegisterFunction,
    type ModuleRegistrationError,
    type RegisterModulesOptions,
    type Runtime,
    type RuntimeTrackerSpan
} from "@squide/core";
import {
    registerRemoteModules,
    RemoteModuleDeferredRegistrationCompletedEvent,
    RemoteModuleDeferredRegistrationFailedEvent,
    RemoteModuleDeferredRegistrationStartedEvent,
    RemoteModuleRegistrationCompletedEvent,
    RemoteModuleRegistrationFailedEvent,
    RemoteModuleRegistrationStartedEvent,
    type RemoteDefinition,
    type RemoteModuleDeferredRegistrationStartedEventPayload,
    type RemoteModuleRegistrationError,
    type RemoteModuleRegistrationStartedEventPayload
} from "@squide/module-federation";
import { setMswAsReady } from "@squide/msw";
import { ApplicationBoostrappedEvent, ModulesReadyEvent, ModulesRegisteredEvent, MswReadyEvent, ProtectedDataReadyEvent, PublicDataReadyEvent } from "./AppRouterReducer.ts";
import type { FireflyRuntime } from "./FireflyRuntime.tsx";
import { ProtectedDataFetchStartedEvent } from "./useProtectedDataQueries.ts";
import { PublicDataFetchStartedEvent } from "./usePublicDataQueries.ts";

export const ApplicationBootstrappingStartedEvent = "squide-app-bootstrapping-started";

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

    registerTrackingListeners(runtime);

    runtime.eventBus.dispatch(ApplicationBootstrappingStartedEvent);

    let localModuleErrors: ModuleRegistrationError[] = [];
    let remoteModuleErrors: RemoteModuleRegistrationError[] = [];

    if (localModules) {
        localModuleErrors = await registerLocalModules<TRuntime, TContext, TData>(localModules, runtime, { context });
    }

    if (remotes) {
        remoteModuleErrors = await registerRemoteModules(remotes, runtime, { context });
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

type DataFetchState = "none" | "fetching-data" | "public-data-ready" | "protected-data-ready" | "data-ready";

export const GlobalDataFetchingStartedEvent = "squide-global-data-fetching-started";
export const GlobalDataReadyEvent = "squide-global-data-ready";

function registerDataFetchEventsReducer(runtime: Runtime) {
    let dataFetchState: DataFetchState = "none";

    runtime.eventBus.addListener(PublicDataFetchStartedEvent, () => {
        if (dataFetchState === "none") {
            dataFetchState = "fetching-data";

            runtime.eventBus.dispatch(GlobalDataFetchingStartedEvent);
        }
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        if (dataFetchState === "fetching-data") {
            dataFetchState = "public-data-ready";
        } else if (dataFetchState === "protected-data-ready") {
            dataFetchState = "data-ready";

            runtime.eventBus.dispatch(GlobalDataReadyEvent);
        }
    });

    runtime.eventBus.addListener(ProtectedDataFetchStartedEvent, () => {
        if (dataFetchState === "none") {
            dataFetchState = "fetching-data";

            runtime.eventBus.dispatch(GlobalDataFetchingStartedEvent);
        }
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        if (dataFetchState === "fetching-data") {
            dataFetchState = "protected-data-ready";
        } else if (dataFetchState === "public-data-ready") {
            dataFetchState = "data-ready";

            runtime.eventBus.dispatch(GlobalDataReadyEvent);
        }
    });
}

function registerTrackingListeners(runtime: FireflyRuntime) {
    let bootstrappingSpan: RuntimeTrackerSpan;
    let localModuleRegistrationSpan: RuntimeTrackerSpan;
    let localModuleDeferredRegistrationSpan: RuntimeTrackerSpan;
    let remoteModuleRegistrationSpan: RuntimeTrackerSpan;
    let remoteModuleDeferredRegistrationSpan: RuntimeTrackerSpan;
    let dataFetchSpan: RuntimeTrackerSpan;

    registerDataFetchEventsReducer(runtime);

    runtime.eventBus.addListener(ApplicationBootstrappingStartedEvent, () => {
        bootstrappingSpan = runtime.tracker.startSpan("squide-boostrapping");
    });

    runtime.eventBus.addListener(ApplicationBoostrappedEvent, () => {
        if (bootstrappingSpan) {
            bootstrappingSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleRegistrationStartedEvent, (payload: unknown) => {
        localModuleRegistrationSpan = bootstrappingSpan.startChildSpan("local-module-registration", {
            attributes: {
                "app.module_count": (payload as LocalModuleRegistrationStartedEventPayload).moduleCount
            }
        });
    });

    runtime.eventBus.addListener(LocalModuleRegistrationCompletedEvent, () => {
        if (localModuleRegistrationSpan) {
            localModuleRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleRegistrationFailedEvent, (payload: unknown) => {
        if (localModuleRegistrationSpan) {
            localModuleRegistrationSpan.addError(payload as Error);
        }
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationStartedEvent, (payload: unknown) => {
        localModuleDeferredRegistrationSpan = bootstrappingSpan.startChildSpan("local-module-deferred-registration", {
            attributes: {
                "app.registration_count": (payload as LocalModuleDeferredRegistrationStartedEventPayload).registrationCount
            }
        });
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationCompletedEvent, () => {
        if (localModuleDeferredRegistrationSpan) {
            localModuleDeferredRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationFailedEvent, (payload: unknown) => {
        if (localModuleDeferredRegistrationSpan) {
            localModuleDeferredRegistrationSpan.addError(payload as Error);
        }
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationStartedEvent, (payload: unknown) => {
        remoteModuleRegistrationSpan = bootstrappingSpan.startChildSpan("remote-module-registration", {
            attributes: {
                "app.remote_count": (payload as RemoteModuleRegistrationStartedEventPayload).remoteCount
            }
        });
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationCompletedEvent, () => {
        if (remoteModuleRegistrationSpan) {
            remoteModuleRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationFailedEvent, (payload: unknown) => {
        if (remoteModuleRegistrationSpan) {
            remoteModuleRegistrationSpan.addError(payload as Error);
        }
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationStartedEvent, (payload: unknown) => {
        remoteModuleDeferredRegistrationSpan = bootstrappingSpan.startChildSpan("remote-module-deferred-registration", {
            attributes: {
                "app.registration_count": (payload as RemoteModuleDeferredRegistrationStartedEventPayload).registrationCount
            }
        });
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationCompletedEvent, () => {
        if (remoteModuleDeferredRegistrationSpan) {
            remoteModuleDeferredRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationFailedEvent, (payload: unknown) => {
        if (remoteModuleDeferredRegistrationSpan) {
            remoteModuleDeferredRegistrationSpan.addError(payload as Error);
        }
    });

    runtime.eventBus.addListener(GlobalDataFetchingStartedEvent, () => {
        dataFetchSpan = bootstrappingSpan.startActiveChildSpan("data-fetch");
    });

    runtime.eventBus.addListener(GlobalDataReadyEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.end();
        }
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.addEvent("public-data-ready");
        }
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.addEvent("protected-data-ready");
        }
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
}
