/*

TODO:

- Don't forget to update the reactRouterRuntime tests
    -> It should add tests to register nested navigation items with a section id
    -> It should add tests to validate the registration of pending registrations (#validateNavigationItemRegistrations)

Routes tests:

-> returned registration menuId and sectionId should match the parent
        -> also add this for toutes

*/

import { NavigationItemDeferredRegistrationScope, NavigationItemDeferredRegistrationTransactionalScope, NavigationItemRegistry } from "../src/navigationItemRegistry.ts";

describe("add", () => {
    test("can add a single deferred item", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "/1"
        });

        expect(registry.getItems("foo")[0]).toBeDefined();
        expect(registry.getItems("foo")[0].$label).toBe("1");
        expect(registry.getItems("foo")[0].to).toBe("/1");
    });

    test("can add a single static item", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        });

        expect(registry.getItems("foo")[0]).toBeDefined();
        expect(registry.getItems("foo")[0].$label).toBe("1");
        expect(registry.getItems("foo")[0].to).toBe("/1");
    });

    test("can add multiple items", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "/1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        });

        expect(registry.getItems("foo").length).toBe(2);
    });

    test("can add items for different menus", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "/1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        });

        registry.add("bar", "deferred", {
            $label: "3",
            to: "/3"
        });

        expect(registry.getItems("foo").length).toBe(2);
        expect(registry.getItems("bar").length).toBe(1);
    });

    test("when a root link is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a root identified section is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $key: "1",
            $label: "1",
            children: []
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a root anonymous section is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $label: "1",
            children: []
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested link is pending for registration, return the \"pending\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("pending");
        expect(result.menuId).toBe("foo");
        expect(result.sectionId).toBe("bar");
    });

    test("when a nested identified section is pending for registration, return the \"pending\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $key: "1",
            $label: "1",
            children: []
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("pending");
        expect(result.menuId).toBe("foo");
        expect(result.sectionId).toBe("bar");
    });

    test("when a nested anonymous section is pending for registration, return the \"pending\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $label: "1",
            children: []
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("pending");
    });

    test("when a nested link is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result2 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });

    test("when a nested identified section is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result2 = registry.add("foo", "static", {
            $key: "toto",
            $label: "toto",
            children: []
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });

    test("when a nested anonymous section is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result2 = registry.add("foo", "static", {
            $label: "toto",
            children: []
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });

    test("when a root identified section is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "bar"
        });

        const result3 = registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(2);
        expect(result3.completedPendingRegistrations[0]).toBe(result1.item);
        expect(result3.completedPendingRegistrations[1]).toBe(result2.item);
    });

    test("when a root identified section is added for another section and do not complete any pending registration, return an empty \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "bar"
        });

        const result3 = registry.add("foo", "static", {
            $key: "toto",
            $label: "toto",
            children: []
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(0);
    });

    test("when a root identified section is added for another menu and do not complete any pending registration, return an empty \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "bar"
        });

        const result3 = registry.add("toto", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(0);
    });

    test("when a root anonymous section is added, return an empty \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "bar"
        });

        const result3 = registry.add("foo", "static", {
            $label: "section",
            children: []
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(0);
    });

    test("when a root link is added, return an empty \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        });

        expect(result.registrationStatus).toBe("registered");
        expect(result.completedPendingRegistrations.length).toBe(0);
    });

    test("when a deeply nested link is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "root",
            children: [
                {
                    $label: "nested",
                    children: [
                        {
                            $key: "bar",
                            $label: "bar",
                            children: []
                        }
                    ]
                }
            ]
        });

        const result2 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });

    test("when a deeply nested section is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "root",
            children: [
                {
                    $label: "nested",
                    children: [
                        {
                            $key: "bar",
                            $label: "bar",
                            children: []
                        }
                    ]
                }
            ]
        });

        const result2 = registry.add("foo", "static", {
            $label: "1",
            children: []
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });

    test("when a deeply nested section registered as a single block is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "root",
            children: [
                {
                    $label: "nested-1",
                    children: [
                        {
                            $key: "bar",
                            $label: "bar",
                            children: []
                        }
                    ]
                }
            ]
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("registered");
        expect(result2.completedPendingRegistrations.length).toBe(1);
        expect(result2.completedPendingRegistrations[0]).toBe(result1.item);
    });

    // TODO: Add a similar test for routes
    test("when registering a multiple sections as a single block complete pending registrations at multiple nesting level, add all the registered items to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "toto"
        });

        const result3 = registry.add("foo", "static", {
            $label: "root",
            children: [
                {
                    $key: "toto",
                    $label: "toto",
                    children: [
                        {
                            $key: "bar",
                            $label: "bar",
                            children: []
                        }
                    ]
                }
            ]
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(2);
        expect(result3.completedPendingRegistrations[0]).toBe(result2.item);
        expect(result3.completedPendingRegistrations[1]).toBe(result1.item);
    });

    // TODO: Add a similar test for routes
    test("when registering a root item trigger a chain reaction of pending registrations completion, add all the registered items to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();

        const result1 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.add("foo", "static", {
            $key: "bar",
            $label: "2",
            children: []
        }, {
            sectionId: "toto"
        });

        const result3 = registry.add("foo", "static", {
            $label: "root",
            children: [
                {
                    $label: "nested",
                    children: [
                        {
                            $key: "toto",
                            $label: "toto",
                            children: []
                        }
                    ]
                }
            ]
        });

        expect(result1.registrationStatus).toBe("pending");
        expect(result2.registrationStatus).toBe("pending");
        expect(result3.registrationStatus).toBe("registered");
        expect(result3.completedPendingRegistrations.length).toBe(2);
        expect(result3.completedPendingRegistrations[0]).toBe(result2.item);
        expect(result3.completedPendingRegistrations[1]).toBe(result1.item);
    });

    test("when a static item is nested under a deferred section, throw an error", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "deferred", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        expect(result.registrationStatus).toBe("registered");

        expect(() => {
            registry.add("foo", "static", {
                $label: "1",
                to: "/1"
            }, {
                sectionId: "bar"
            });
        }).toThrow();
    });

    test("when a deferred item is nested under a static section, throw an error", () => {
        const registry = new NavigationItemRegistry();

        const result = registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        expect(result.registrationStatus).toBe("registered");

        expect(() => {
            registry.add("foo", "deferred", {
                $label: "1",
                to: "/1"
            }, {
                sectionId: "bar"
            });
        }).toThrow();
    });

    test("when a nested item is registered under a section without a predefined children array, register the item", () => {
        const registry = new NavigationItemRegistry();

        const item = {
            $key: "bar",
            $label: "bar"
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const result1 = registry.add("foo", "static", item);

        const result2 = registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result1.registrationStatus).toBe("registered");
        expect(result2.registrationStatus).toBe("registered");
    });
});

describe("getItems", () => {
    test("an empty array is returned when there's no registered items for the specified menu id", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "deferred", {
            $label: "1",
            to: "/1"
        });

        registry.add("foo", "static", {
            $label: "2",
            to: "/2"
        });

        registry.add("bar", "deferred", {
            $label: "3",
            to: "/3"
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

    test("when a nested item is registered, a new instance of the array is returned", () => {
        const registry = new NavigationItemRegistry();

        registry.add("foo", "static", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result1 = registry.getItems("foo");

        registry.add("foo", "static", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = registry.getItems("foo");

        expect(result1).not.toBe(result2);
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

    test("when an item is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationScope(registry);

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested item is pending, return the \"pending\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationScope(registry);

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("pending");
    });

    test("when a nested item is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationScope(registry);

        scope.addItem("foo", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested section is added and complete the pending registration of nested items, add the registered items to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationScope(registry);

        const result1 = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        const result2 = scope.addItem("foo", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        expect(result2.registrationStatus).toBe("registered");
        expect(result2.completedPendingRegistrations.length).toBe(1);
        expect(result2.completedPendingRegistrations[0]).toBe(result1.item);
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

    test("when an item is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested item is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

        scope.addItem("foo", {
            $key: "bar",
            $label: "bar",
            children: []
        });

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested item that \"should\" be pending is added, return the \"registered\" registration status", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

        const result = scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when there \"should\" be pending registrations, the scope can be completed", () => {
        const registry = new NavigationItemRegistry();
        const scope = new NavigationItemDeferredRegistrationTransactionalScope(registry);

        scope.addItem("foo", {
            $label: "1",
            to: "/1"
        }, {
            sectionId: "bar"
        });

        scope.addItem("foo", {
            $label: "2",
            to: "/2"
        }, {
            sectionId: "bar"
        });

        scope.addItem("foo", {
            $key: "bar",
            $label: "bat",
            children: []
        }, {
            sectionId: "toto"
        });

        scope.addItem("foo", {
            $key: "toto",
            $label: "toto",
            children: []
        });

        scope.complete();

        expect(registry.getPendingRegistrations().getPendingSectionIds().length).toBe(0);
    });
});
