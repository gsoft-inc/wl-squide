import { isFunction, registerLocalModules, type ModuleRegisterFunction, type ModuleRegistrationError, type RegisterModulesOptions } from "@squide/core";
import { registerRemoteModules, type RemoteDefinition, type RemoteModuleRegistrationError } from "@squide/module-federation";
import { setMswAsReady } from "@squide/msw";
import type { FireflyRuntime } from "./FireflyRuntime.tsx";

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

    // registerTrackingListeners(runtime);

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
