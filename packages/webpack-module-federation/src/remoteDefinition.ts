// By conventions:
//  - The remote entry point must be "/remoteEntry.js"
//  - The module name must be "register"
export interface RemoteDefinition {
    // The base URL of the remote
    url: string;
    // The container name of the remote
    name: string;
}

export const RemoteEntryPoint = "remoteEntry.js";
export const RemoteModuleName = "./register";
