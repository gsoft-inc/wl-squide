import { FireflyRuntime, ProtectedDataFetchStartedEvent, ProtectedDataReadyEvent, PublicDataFetchStartedEvent, PublicDataReadyEvent } from "@squide/firefly";
import { reduceDataFetchEvents } from "../src/registerHoneycombInstrumentation.ts";

test("when the state is \"none\" and PublicDataFetchStartedEvent is handled, call the onDataFetchingStarted handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
});

test("when the state is \"fetching-data\" and PublicDataFetchStartedEvent is handled, do not call the onDataFetchingStarted handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Should not call onDataFetchingStarted.
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
});

test("when the state is \"none\" and ProtectedDataFetchStartedEvent is handled, call the onDataFetchingStarted handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
});

test("when the state is \"fetching-data\" and ProtectedDataFetchStartedEvent is handled, do not call the onDataFetchingStarted handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);

    // Should not call onDataFetchingStarted.
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
});

test("when the state is \"protected-data-ready\" and PublicDataReadyEvent is handled, call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "protected-data-ready".
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    // Snould call onDataReady.
    runtime.eventBus.dispatch(PublicDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(1);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(1);
});

test("when the state is \"public-data-ready\" and PublicDataReadyEvent is handled, do not call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "public-data-ready".
    runtime.eventBus.dispatch(PublicDataReadyEvent);

    // Should not call onDataReady.
    runtime.eventBus.dispatch(PublicDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(0);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(2);
});

test("when the state is \"data-ready\" and PublicDataReadyEvent is handled, do not call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "data-ready".
    runtime.eventBus.dispatch(PublicDataReadyEvent);
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    // Should not call onDataReady again.
    runtime.eventBus.dispatch(PublicDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(2);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(1);
});

test("when the state is \"public-data-ready\" and ProtectedDataReadyEvent is handled, call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "public-data-ready".
    runtime.eventBus.dispatch(PublicDataReadyEvent);

    // Snould call onDataReady.
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(1);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(1);
});

test("when the state is \"protected-data-ready\" and ProtectedDataReadyEvent is handled, do not call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "protected-data-ready".
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    // Should not call onDataReady.
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(0);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(2);
});

test("when the state is \"data-ready\" and ProtectedDataReadyEvent is handled, do not call the onDataReady handler", () => {
    const runtime = new FireflyRuntime();

    const onDataFetchingStarted = jest.fn();
    const onDataReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();

    reduceDataFetchEvents(
        runtime,
        onDataFetchingStarted,
        onDataReady,
        onPublicDataFetchStarted,
        onPublicDataReady,
        onProtectedDataFetchStarted,
        onProtectedDataReady
    );

    // Will update the state to "fetching-data".
    runtime.eventBus.dispatch(PublicDataFetchStartedEvent);
    runtime.eventBus.dispatch(ProtectedDataFetchStartedEvent);

    // Will update the state to "data-ready".
    runtime.eventBus.dispatch(PublicDataReadyEvent);
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    // Should not call onDataReady again.
    runtime.eventBus.dispatch(ProtectedDataReadyEvent);

    expect(onDataFetchingStarted).toHaveBeenCalledTimes(1);
    expect(onDataReady).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(1);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(2);
});
