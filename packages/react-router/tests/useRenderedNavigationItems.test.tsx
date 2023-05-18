import renderer from "react-test-renderer";
import { type RootNavigationItem } from "../src/navigationItemRegistry.ts";
import { useRenderedNavigationItems, type RenderItemFunction, type RenderSectionFunction, isNavigationLink, type NavigationLinkRenderProps, type NavigationSectionRenderProps } from "../src/useRenderedNavigationItems.tsx";
import { useCallback, type ReactElement } from "react";
import { renderHook } from "@testing-library/react";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number) => ReactElement;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactElement;

interface TestComponentProps {
    navigationItems: RootNavigationItem[];
}

// Not the prettiest mock but it's easier than simpler than using createMemoryRouter and
// it provides the required level of testing when combined with snapshot tests.
function Link(props: Record<string, unknown>) {
    return (
        <div {...props} />
    );
}

function TestComponent({ navigationItems }: TestComponentProps) {
    const renderLink: RenderLinkItemFunction = useCallback(({ label, linkProps, additionalProps }, index, level) => {
        return (
            <li key={`${level}-${index}`} {...additionalProps}>
                <Link {...linkProps}>
                    {label}
                </Link>
            </li>
        );
    }, []);

    const renderMenu: RenderSectionItemFunction = useCallback(({ label, section, additionalProps }, index, level) => {
        return (
            <li key={`${level}-${index}`} {...additionalProps}>
                {label}
                {section}
            </li>
        );
    }, []);

    const renderItem: RenderItemFunction = useCallback((item, index, level) => {
        return isNavigationLink(item) ? renderLink(item, index, level) : renderMenu(item, index, level);
    }, [renderLink, renderMenu]);

    const renderSection: RenderSectionFunction = useCallback((elements, index, level) => {
        return (
            <ul key={`${level}-${index}`}>
                {elements}
            </ul>
        );
    }, []);

    // eslint-disable-next-line testing-library/render-result-naming-convention
    return useRenderedNavigationItems(navigationItems, renderItem, renderSection);
}

test("highest priority goes first", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            to: "/foo",
            label: "Foo"
        },
        {
            to: "/bar",
            label: "Bar",
            priority: 5
        },
        {
            to: "/toto",
            label: "Toto",
            priority: 99
        },
        {
            to: "/tutu",
            label: "Tutu"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("support 2 section levels", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            to: "/foo",
            label: "Foo"
        },
        {
            label: "Bar",
            children: [
                {
                    to: "/toto",
                    label: "Toto"
                },
                {
                    to: "/tutu",
                    label: "Tutu"
                }
            ]
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("support 3 section levels", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            to: "/foo",
            label: "Foo"
        },
        {
            label: "Bar",
            children: [
                {
                    to: "/toto",
                    label: "Toto"
                },
                {
                    label: "Tutu",
                    children: [
                        {
                            to: "/titi",
                            label: "Titi"
                        }
                    ]
                }
            ]
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("Link item additionalProps are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            to: "/foo",
            label: "Foo",
            additionalProps: {
                style: { color: "red" }
            }
        },
        {
            to: "/bar",
            label: "Bar"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("Section item additionalProps are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            label: "Foo",
            children: [
                {
                    to: "/bar",
                    label: "Bar"
                }
            ],
            additionalProps: {
                style: { color: "red" }
            }
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("doesn't rerender when the navigation items haven't changed", () => {
    const initialItems = [
        {
            to: "/foo",
            label: "Foo"
        }
    ];

    const renderItem = jest.fn(() => <div>Item</div>);
    const renderSection = jest.fn(() => <div>Section</div>);

    const { rerender } = renderHook(({ navigationItems: x }) => useRenderedNavigationItems(x, renderItem, renderSection), {
        initialProps: {
            navigationItems: initialItems
        }
    });

    rerender({
        navigationItems: initialItems
    });

    expect(renderItem).toHaveBeenCalledTimes(1);
    expect(renderSection).toHaveBeenCalledTimes(1);
});

test("rerender when the navigation items change", () => {
    const initialItems = [
        {
            to: "/foo",
            label: "Foo"
        }
    ];

    const renderItem = jest.fn(() => <div>Item</div>);
    const renderSection = jest.fn(() => <div>Section</div>);

    const { rerender } = renderHook(({ navigationItems: x }) => useRenderedNavigationItems(x, renderItem, renderSection), {
        initialProps: {
            navigationItems: initialItems
        }
    });

    rerender({
        navigationItems: [
            {
                to: "/bar",
                label: "Bar"
            }
        ]
    });

    expect(renderItem).toHaveBeenCalledTimes(2);
    expect(renderSection).toHaveBeenCalledTimes(2);
});
