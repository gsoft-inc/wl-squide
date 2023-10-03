import { isNil, registerModule, type AbstractRuntime, type ModuleRegistrationStatus } from "@squide/core";
import { loadRemote } from "./loadRemote.ts";
import { RemoteEntryPoint, RemoteModuleName, type RemoteDefinition } from "./remoteDefinition.ts";

let registrationStatus: ModuleRegistrationStatus = "none";

// Aliasing to make the name more explicit to external modules.
export { registrationStatus as remoteModulesRegistrationStatus };

export interface RegistrationError {
    // The remote base URL
    url: string;
    // The remote container name
    containerName: string;
    // The remote resource module name
    moduleName: string;
    // The registration error
    error: unknown;
}

export interface RegisterRemoteModulesOptions {
    context?: unknown;
}

export async function registerRemoteModules(remotes: RemoteDefinition[], runtime: AbstractRuntime, { context }: RegisterRemoteModulesOptions = {}) {
    if (registrationStatus !== "none") {
        throw new Error("[squide] registerRemoteModules() can only be called once.");
    }

    const errors: RegistrationError[] = [];

    runtime.logger.information(`[squide] Found ${remotes.length} remote module${remotes.length !== 1 ? "s" : ""} to register.`);

    registrationStatus = "in-progress";

    await Promise.allSettled(remotes.map(async (x, index) => {
        let remoteUrl;

        const containerName = x.name;

        try {
            // Is included in the try/catch becase the URL could be invalid and cause an error.
            remoteUrl = new URL(RemoteEntryPoint, x.url).toString();

            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} Loading module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            const module = await loadRemote(remoteUrl, containerName, RemoteModuleName);

            if (isNil(module.register)) {
                throw new Error(`[squide] A "register" function is not available for module "${RemoteModuleName}" of container "${containerName}" from remote "${remoteUrl}". Make sure your remote "./register.js" file export a function named "register".`);
            }

            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} Registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            registerModule(module.register, runtime, context);

            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} Container "${containerName}" of remote "${remoteUrl}" registration completed.`);
        } catch (error: unknown) {
            runtime.logger.error(
                `[squide] ${index + 1}/${remotes.length} An error occured while registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`,
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

    registrationStatus = "ready";

    return errors;
}
