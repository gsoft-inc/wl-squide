import { mergeDeferredRegistrations } from "../src/federation/mergeDeferredRegistrations.ts";
import type { DeferredRegistrationFunction } from "../src/index.ts";

function noop() {}

test("when deferred registrations are provided, all the deferred registrations are called", async () => {
    const fct1: DeferredRegistrationFunction = jest.fn();
    const fct2: DeferredRegistrationFunction = jest.fn();
    const fct3: DeferredRegistrationFunction = jest.fn();

    const mergeFunction = mergeDeferredRegistrations([fct1, fct2, fct3]);

    await mergeFunction!("foo", "register");

    expect(fct1).toHaveBeenCalledTimes(1);
    expect(fct2).toHaveBeenCalledTimes(1);
    expect(fct3).toHaveBeenCalledTimes(1);
});

test("when deferred registrations are provided, all the deferred registrations are called with the provided data and state", async () => {
    const fct1: DeferredRegistrationFunction<string> = jest.fn();
    const fct2: DeferredRegistrationFunction<string> = jest.fn();
    const fct3: DeferredRegistrationFunction<string> = jest.fn();

    const mergeFunction = mergeDeferredRegistrations([fct1, fct2, fct3]);

    await mergeFunction!("foo", "register");

    expect(fct1).toHaveBeenCalledWith("foo", "register");
    expect(fct2).toHaveBeenCalledWith("foo", "register");
    expect(fct3).toHaveBeenCalledWith("foo", "register");
});

test("when void results are provided, the void results are ignored", async () => {
    const fct1: DeferredRegistrationFunction<string> = jest.fn();
    const fct2: DeferredRegistrationFunction<string> = jest.fn();

    const mergeFunction = mergeDeferredRegistrations([noop(), fct1, noop(), fct2]);

    await mergeFunction!("foo", "register");

    expect(fct1).toHaveBeenCalledWith("foo", "register");
    expect(fct2).toHaveBeenCalledWith("foo", "register");
});

test("when no deferred registrations are provided, return undefined", () => {
    const mergeFunction = mergeDeferredRegistrations([noop(), noop()]);

    expect(mergeFunction).toBeUndefined();
});

test("when a single deferred registration is provided, the deferred registration is called", async () => {
    const fct: DeferredRegistrationFunction<string> = jest.fn();

    const mergeFunction = mergeDeferredRegistrations([fct]);

    await mergeFunction!("foo", "register");

    expect(fct).toHaveBeenCalledWith("foo", "register");
});

test("when a single deferred registration is provided, return the deferred registration", async () => {
    const fct: DeferredRegistrationFunction<string> = () => {};

    const mergeFunction = mergeDeferredRegistrations([fct]);

    expect(mergeFunction).toBe(fct);
});
