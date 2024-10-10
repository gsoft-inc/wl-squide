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

function registerTrackingListeners(runtime: FireflyRuntime) {
    let bootstrappingSpan: RuntimeTrackerSpan;
    let localModuleRegistrationSpan: RuntimeTrackerSpan;
    let localModuleDeferredRegistrationSpan: RuntimeTrackerSpan;
    let remoteModuleRegistrationSpan: RuntimeTrackerSpan;
    let remoteModuleDeferredRegistrationSpan: RuntimeTrackerSpan;
    let publicDataFetchSpan: RuntimeTrackerSpan;
    let protectedDataFetchSpan: RuntimeTrackerSpan;

    runtime.eventBus.addListener(ApplicationBootstrappingStartedEvent, () => {
        bootstrappingSpan = runtime.tracker.startSpan("squide-boostrapping");
    });

    runtime.eventBus.addListener(ApplicationBoostrappedEvent, () => {
        if (bootstrappingSpan) {
            bootstrappingSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleRegistrationStartedEvent, (payload: unknown) => {
        localModuleRegistrationSpan = runtime.tracker.startChildSpan("local-module-registration", bootstrappingSpan, {
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
        localModuleDeferredRegistrationSpan = runtime.tracker.startChildSpan("local-module-deferred-registration", bootstrappingSpan, {
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
        remoteModuleRegistrationSpan = runtime.tracker.startChildSpan("remote-module-registration", bootstrappingSpan, {
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
        remoteModuleDeferredRegistrationSpan = runtime.tracker.startChildSpan("remote-module-deferred-registration", bootstrappingSpan, {
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

    runtime.eventBus.addListener(ModulesRegisteredEvent, () => {
        bootstrappingSpan.addEvent("modules-registered");
    });

    runtime.eventBus.addListener(ModulesReadyEvent, () => {
        bootstrappingSpan.addEvent("modules-ready");
    });

    runtime.eventBus.addListener(MswReadyEvent, () => {
        bootstrappingSpan.addEvent("msw-ready");
    });

    runtime.eventBus.addListener(PublicDataFetchStartedEvent, () => {
        publicDataFetchSpan = runtime.tracker.startChildSpan("public-data-fetch", bootstrappingSpan);
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        if (publicDataFetchSpan) {
            publicDataFetchSpan.end();
        }
    });

    runtime.eventBus.addListener(ProtectedDataFetchStartedEvent, () => {
        protectedDataFetchSpan = runtime.tracker.startChildSpan("protected-data-fetch", bootstrappingSpan);
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        if (protectedDataFetchSpan) {
            protectedDataFetchSpan.end();
        }
    });
}
