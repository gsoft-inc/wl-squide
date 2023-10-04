import type { QueryClient } from "@tanstack/react-query";

export interface AppContext {
    name: string;
    queryClient: QueryClient;
}
