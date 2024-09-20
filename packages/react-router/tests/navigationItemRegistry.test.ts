/*

add:
    - when a root link is added, return the \"registered\" registration status
    - when a root section is added, return the \"registered\" registration status
    - when a root section is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array
    - when a root section is added and do not complete any pending registration, return an empty \"completedPendingRegistrations\" array
    - when a root link is added, return an empty \"completedPendingRegistrations\" array
    - when a nested section is pending for registration, return the \"pending\" registration status
    - when a nested link is pending for registration, return the \"pending\" registration status
    - when a nested link is added, return the \"registered\" registration status
    - when a nested section is added, return the \"registered\" registration status
    - when a nested section is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array
        -> make sure to test that the nested items are all returned with the completedPendingRegistrations array

    - when an item is nested under a nested section, return the \"registered\" registration status
    - when a static item is nested under a deferred section, throw an error
    - when a deferred item is neste under a static section, throw an error

getItems:
    - when a nested item is registered, a new instance of the array is returned
    - when pending registrations are completed, a new instance of the array is returned
        -> Might not test anything because it requires a call to "add" anyway?

NavigationItemDeferredRegistrationScope:
    - when an item is added, return the \"registered\" registration status
    - when a nested item is pending, return the \"pending\" registration status
    - when a nested item is added, return the \"registered\" registration status
    - when a nested section is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array

NavigationItemDeferredRegistrationTransactionalScope:
    - when an item is added, return the \"registered\" registration status
    - when a nested item that "should" be pending is added, return the \"registered\" registration status
    - when a nested item is added, return the \"registered\" registration status
    - when there "should" be pending registration, the scope can be completed


*/

import { NavigationItemDeferredRegistrationScope, NavigationItemDeferredRegistrationTransactionalScope, NavigationItemRegistry } from "../src/navigationItemRegistry.ts";

describe("add", () => {
    test("can add a single deferred item", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "1"
        });

        expect(registry.getItems("foo")[0]).toBeDefined();
        expect(registry.getItems("foo")[0].$label).toBe("1");
        expect(registry.getItems("foo")[0].to).toBe("1");
    });

    test("can add a single static item", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $label: "1",
            to: "1"
        });

        expect(registry.getItems("foo")[0]).toBeDefined();
        expect(registry.getItems("foo")[0].$label).toBe("1");
        expect(registry.getItems("foo")[0].to).toBe("1");
    });

    test("can add multiple items", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "2"
        });

        expect(registry.getItems("foo").length).toBe(2);
    });

    test("can add items for different menus", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "2"
        });

        registry.add("bar", "deferred", {
            $label: "3",
            to: "3"
        });

        expect(registry.getItems("foo").length).toBe(2);
        expect(registry.getItems("bar").length).toBe(1);
    });
});

describe("getItems", () => {
    test("an empty array is returned when there's no registered items for the specified menu id", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "2"
        });

        registry.add("bar", "deferred", {
            $label: "3",
            to: "3"
        });

        expect(Array.isArray(registry.getItems("toto"))).toBeTruthy();
        expect(registry.getItems("toto").length).toBe(0);
    });

    test("the returned items are immutable", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        });

        const result1 = registry.getItems("foo");
        const result2 = registry.getItems("foo");

        expect(result1).toBe(result2);

        registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        });

        const result3 = registry.getItems("foo");

        expect(result1).not.toBe(result3);
        expect(result2).not.toBe(result3);
    });
});

describe("clearDeferredItems", () => {
    test("clear all deferred items", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "2"
        });

        registry.add("bar", "deferred", {
            $label: "3",
            to: "3"
        });

        expect(registry.getItems("foo").length).toBe(2);
        expect(registry.getItems("bar").length).toBe(1);

        registry.clearDeferredItems();

        expect(registry.getItems("foo").length).toBe(1);
        expect(registry.getItems("bar").length).toBe(0);
    });

    test("do not clear static items", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $label: "1",
            to: "1"
        });

        expect(registry.getItems("foo").length).toBe(1);

        registry.clearDeferredItems();

        expect(registry.getItems("foo")[0]).toBeDefined();
        expect(registry.getItems("foo")[0].$label).toBe("1");
        expect(registry.getItems("foo")[0].to).toBe("1");
    });

    test("when there's no deferred items to clear, do not mutate the menu arrays", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $label: "1",
            to: "1"
        });

        const array1 = registry.getItems("foo");

        registry.clearDeferredItems();

        const array2 = registry.getItems("foo");

        expect(array1).toBe(array2);
    });
});

describe("NavigationItemDeferredRegistrationScope", () => {
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
});

describe("NavigationItemDeferredRegistrationTransactionalScope", () => {
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
});
