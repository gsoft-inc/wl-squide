import { isFunction, isNil, registerModule, type AbstractRuntime, type DeferedRegisterationFunction, type Logger, type ModuleRegistrationStatus } from "@squide/core";
import { loadRemote } from "./loadRemote.ts";
import { RemoteEntryPoint, RemoteModuleName, type RemoteDefinition } from "./remoteDefinition.ts";

let registrationStatus: ModuleRegistrationStatus = "none";

export function getRemoteModulesRegistrationStatus() {
    return registrationStatus;
}

// Added to facilitate the unit tests.
export function resetRemoteModulesRegistrationStatus() {
    registrationStatus = "none";
}

interface DeferedRegistration {
    url: string;
    containerName: string;
    index: string;
    fct: DeferedRegisterationFunction;
}

const deferedRegistrations: DeferedRegistration[] = [];

export interface RegisterRemoteModulesOptions {
    context?: unknown;
}

export interface RemoteModuleRegistrationError {
    // The remote base URL.
    url: string;
    // The remote container name.
    containerName: string;
    // The remote resource module name.
    moduleName: string;
    // The registration error.
    error: unknown;
}

export async function registerRemoteModules(remotes: RemoteDefinition[], runtime: AbstractRuntime, { context }: RegisterRemoteModulesOptions = {}) {
    if (registrationStatus !== "none") {
        throw new Error("[squide] [remote] registerRemoteModules() can only be called once.");
    }

    const errors: RemoteModuleRegistrationError[] = [];

    runtime.logger.information(`[squide] [remote] Found ${remotes.length} remote module${remotes.length !== 1 ? "s" : ""} to register.`);

    registrationStatus = "in-progress";

    await Promise.allSettled(remotes.map(async (x, index) => {
        let remoteUrl;

        const containerName = x.name;

        try {
            // Is included in the try/catch becase the URL could be invalid and cause an error.
            remoteUrl = new URL(RemoteEntryPoint, x.url).toString();

            runtime.logger.information(`[squide] [remote] ${index + 1}/${remotes.length} Loading module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            const module = await loadRemote(remoteUrl, containerName, RemoteModuleName);

            if (isNil(module.register)) {
                throw new Error(`[squide] [remote] A "register" function is not available for module "${RemoteModuleName}" of container "${containerName}" from remote "${remoteUrl}". Make sure your remote "./register.js" file export a function named "register".`);
            }

            runtime.logger.information(`[squide] [remote] ${index + 1}/${remotes.length} Registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            const optionalDeferedRegistration = await registerModule(module.register, runtime, context);

            if (isFunction(optionalDeferedRegistration)) {
                deferedRegistrations.push({
                    url: remoteUrl,
                    containerName: x.name,
                    index: `${index + 1}/${remotes.length}`,
                    fct: optionalDeferedRegistration
                });
            }

            runtime.logger.information(`[squide] [remote] ${index + 1}/${remotes.length} Container "${containerName}" of remote "${remoteUrl}" registration completed.`);
        } catch (error: unknown) {
            runtime.logger.error(
                `[squide] [remote] ${index + 1}/${remotes.length} An error occured while registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`,
                error
            );

            errors.push({
                url: remoteUrl ?? `Partial URL is: "${x.url}"`,
                containerName,
                moduleName: RemoteModuleName,
                error
            });
        }
    }));

    registrationStatus = deferedRegistrations.length > 0 ? "registered" : "ready";

    return errors;
}

export async function completeRemoteModuleRegistration<TData = unknown>(logger: Logger, data?: TData) {
    if (registrationStatus === "none" || registrationStatus === "in-progress") {
        throw new Error("[squide] [remote] completeRemoteModuleRegistration() can only be called once registerRemoteModules() terminated.");
    }

    if (registrationStatus !== "registered" && deferedRegistrations.length > 0) {
        throw new Error("[squide] [remote] completeRemoteModuleRegistration() can only be called once.");
    }

    if (registrationStatus === "ready") {
        // No defered registrations were returned by the remote modules, skip the completion process.
        return Promise.resolve();
    }

    registrationStatus = "in-completion";

    const errors: RemoteModuleRegistrationError[] = [];

    await Promise.allSettled(deferedRegistrations.map(({ url, containerName, index, fct }) => {
        let optionalPromise;

        logger.information(`[squide] [remote] ${index} Completing registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`);

        try {
            optionalPromise = fct(data);
        } catch (error: unknown) {
            logger.error(
                `[squide] [remote] ${index} An error occured while completing the registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`,
                error
            );

            errors.push({
                url,
                containerName,
                moduleName: RemoteModuleName,
                error
            });
        }

        logger.information(`[squide] [remote] ${index} Completed registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`);

        return optionalPromise;
    }));

    registrationStatus = "ready";

    return errors;
}
