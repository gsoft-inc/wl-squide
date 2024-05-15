import { useAppRouterState } from "./AppRouterContext.ts";
import { usePublicData } from "./usePublicData.ts";

export function useTanstackQueryPublicData() {
    const { canFetchPublicData, setPublicDataAsReady } = usePublicData();
    const { isPublicDataReady } = useAppRouterState();

    const queryOptions = {
        enabled: canFetchPublicData,
        throwOnError: !isPublicDataReady
    };

    return { publicQueryOptions: queryOptions, canFetchPublicData, setPublicDataAsReady };
}
