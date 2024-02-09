import { resolveRouteSegments } from "../src/resolveRouteSegments.ts";

test("when there's no match, return the original route", () => {
    const to = "/page/:arg1";

    const values = {
        args2: "value-2"
    };

    const result = resolveRouteSegments(to, values);

    expect(result).toBe(result);
});

test("when there's a single match, return the resolved route", () => {
    const to = "/page/:arg1";

    const values = {
        arg1: "value-1"
    };

    const result = resolveRouteSegments(to, values);

    expect(result).toBe("/page/value-1");
});

test("when there's multiple matches, return the resolved route", () => {
    const to = "/page/:arg1/:arg2";

    const values = {
        arg1: "value-1",
        arg2: "value-2"
    };

    const result = resolveRouteSegments(to, values);

    expect(result).toBe("/page/value-1/value-2");
});

test("when there's partial matches, return the partially resolved route", () => {
    const to = "/page/:arg1/:arg2";

    const values = {
        arg2: "value-2"
    };

    const result = resolveRouteSegments(to, values);

    expect(result).toBe("/page/:arg1/value-2");
});
