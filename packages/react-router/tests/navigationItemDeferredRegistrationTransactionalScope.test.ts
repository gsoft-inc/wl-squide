import { NavigationItemDeferredRegistrationTransactionalScope, NavigationItemRegistry } from "../src/navigationItemRegistry.ts";

test("can add a single item", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    scope.addItem("foo", {
        $label: "Bar",
        to: "/bar"
    });

    expect(scope.getItems("foo")[0]).toBeDefined();
    expect(scope.getItems("foo")[0].$label).toBe("Bar");
    expect(scope.getItems("foo")[0].to).toBe("/bar");
});

test("can add multiple items", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    scope.addItem("foo", {
        $label: "1",
        to: "/1"
    });

    scope.addItem("foo", {
        $label: "2",
        to: "/2"
    });

    scope.addItem("foo", {
        $label: "3",
        to: "/3"
    });

    expect(scope.getItems("foo").length).toBe(3);
});

test("can add items for different menus", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    scope.addItem("foo", {
        $label: "1",
        to: "/1"
    });

    scope.addItem("bar", {
        $label: "2",
        to: "/2"
    });

    expect(scope.getItems("foo").length).toBe(1);
    expect(scope.getItems("bar").length).toBe(1);
});

test("adding an item doesn't add the item to the registry", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    expect(registry.getItems("foo").length).toBe(0);

    scope.addItem("foo", {
        $label: "bar",
        to: "/bar"
    });

    expect(registry.getItems("foo").length).toBe(0);
});

test("when there's no items for the provided menu id, return an empty array", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    scope.addItem("foo", {
        $label: "bar",
        to: "/bar"
    });

    expect(Array.isArray(registry.getItems("toto"))).toBeTruthy();
    expect(registry.getItems("toto").length).toBe(0);
});

test("completing the scope add all the active items to the registry", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    expect(registry.getItems("foo").length).toBe(0);

    scope.addItem("foo", {
        $label: "Bar",
        to: "/bar"
    });

    scope.complete();

    expect(registry.getItems("foo").length).toBe(1);
});

test("completing the scope clears the previously registered deferred items", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    registry.add("foo", "deferred", {
        $label: "1",
        to: "/1"
    });

    registry.add("bar", "deferred", {
        $label: "2",
        to: "/2"
    });

    expect(registry.getItems("foo").length).toBe(1);
    expect(registry.getItems("bar").length).toBe(1);

    scope.addItem("foo", {
        $label: "3",
        to: "3"
    });

    scope.complete();

    expect(registry.getItems("foo").length).toBe(1);
    expect(registry.getItems("bar").length).toBe(0);
    expect(registry.getItems("foo")[0].$label).toBe("3");
});

test("completing the scope clears the scope active items", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

    scope.addItem("foo", {
        $label: "1",
        to: "/1"
    });

    scope.addItem("bar", {
        $label: "2",
        to: "/2"
    });

    scope.complete();

    expect(scope.getItems("foo").length).toBe(0);
    expect(scope.getItems("bar").length).toBe(0);
});


