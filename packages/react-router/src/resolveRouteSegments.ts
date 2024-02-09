export function resolveRouteSegments(to: string, values: Record<string, string>) {
    let resolvedRoute = to;

    for (const [key, value] of Object.entries(values)) {
        resolvedRoute = resolvedRoute.replace(`:${key}`, value);
    }

    return resolvedRoute;
}
