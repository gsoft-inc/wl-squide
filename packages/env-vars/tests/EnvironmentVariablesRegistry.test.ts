import { EnvironmentVariablesRegistry } from "../src/EnvironmentVariablesRegistry.ts";

declare module "../src/EnvironmentVariablesRegistry.ts" {
    interface EnvironmentVariables {
        foo: string;
        bar: number;
        john: string;
    }
}

describe("add", () => {
    test("should add a new variable", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.add("foo", "bar");

        expect(registry.getVariable("foo")).toBe("bar");
    });

    test("when a variable already exist and the value is the same, do nothing", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.add("foo", "bar");
        registry.add("foo", "bar");

        expect(registry.getVariable("foo")).toBe("bar");
    });

    test("when a variable already exist and the value is different, throw an error", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.add("foo", "bar1");

        expect(() => registry.add("foo", "bar2")).toThrow();
    });
});

describe("addVariables", () => {
    test("add all variables", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.addVariables({
            foo: "1",
            bar: 2
        });

        expect(registry.getVariable("foo")).toBe("1");
        expect(registry.getVariable("bar")).toBe(2);
    });

    test("when one of the variable already exist and the value is different, throw an error", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.add("foo", "1");

        expect(() => registry.addVariables({
            foo: "2",
            bar: 2
        })).toThrow();
    });
});

describe("getVariable", () => {
    test("when the key doesn't match any value, throw an error", () => {
        const registry = new EnvironmentVariablesRegistry();

        expect(() => registry.getVariable("foo")).toThrow();
    });
});

describe("getVariables", () => {
    test("return all the variables", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.addVariables({
            "foo": "1",
            bar: 2
        });

        const variables = registry.getVariables();

        expect(Object.keys(variables).length).toBe(2);
        expect(variables["foo"]).toBe("1");
        expect(variables["bar"]).toBe(2);
    });

    test("the returned variables object is immutable", () => {
        const registry = new EnvironmentVariablesRegistry();

        registry.add("foo", "1");

        const result1 = registry.getVariables();
        const result2 = registry.getVariables();

        expect(result1).toBe(result2);

        registry.add("bar", 2);

        const result3 = registry.getVariables();

        expect(result1).not.toBe(result3);
        expect(result2).not.toBe(result3);

        registry.addVariables({
            john: "doe"
        });

        const result4 = registry.getVariables();

        expect(result3).not.toBe(result4);
    });
});
