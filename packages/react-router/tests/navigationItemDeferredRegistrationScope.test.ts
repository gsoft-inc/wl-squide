import { NavigationItemDeferredRegistrationScope, NavigationItemRegistry } from "../src/navigationItemRegistry.ts";

test("can add a single item", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationScope(registry);

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
    const scope = new NavigationItemDeferredRegistrationScope(registry);

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
    const scope = new NavigationItemDeferredRegistrationScope(registry);

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

test("adding an item also add the item to the registry", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationScope(registry);

    expect(registry.getItems("foo").length).toBe(0);

    scope.addItem("foo", {
        $label: "Bar",
        to: "/bar"
    });

    expect(registry.getItems("foo").length).toBe(1);
});

test("completing the scope doesn't alter the registry items", () => {
    const registry = new NavigationItemRegistry();
    const scope = new NavigationItemDeferredRegistrationScope(registry);

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
        to: "/3"
    });

    scope.complete();

    expect(registry.getItems("foo").length).toBe(2);
    expect(registry.getItems("bar").length).toBe(1);
    expect(registry.getItems("foo")[0].$label).toBe("1");
});
