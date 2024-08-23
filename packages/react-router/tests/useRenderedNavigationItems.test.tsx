import { renderHook } from "@testing-library/react";
import { useCallback, type ReactNode } from "react";
import renderer from "react-test-renderer";
import type { NavigationItem, RootNavigationItem } from "../src/navigationItemRegistry.ts";
import { isNavigationLink, useRenderedNavigationItems, type NavigationLinkRenderProps, type NavigationSectionRenderProps, type RenderItemFunction, type RenderSectionFunction } from "../src/useRenderedNavigationItems.tsx";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, key: string, index: number, level: number) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, key: string, index: number, level: number) => ReactNode;

interface TestComponentProps {
    navigationItems: RootNavigationItem[];
}

// Not the prettiest mock but it's simpler than using createMemoryRouter and
// it provides an adequate testing experience when combined with snapshot tests.
function Link(props: Record<string, unknown>) {
    return (
        <div {...props} />
    );
}

function TestComponent({ navigationItems }: TestComponentProps) {
    const renderLinkItem: RenderLinkItemFunction = useCallback(({ label, linkProps, additionalProps }, key, index, level) => {
        return (
            <li key={key} {...additionalProps} data-key={key} data-index={index.toString()} data-level={level.toString()}>
                <Link {...linkProps}>
                    {label}
                </Link>
            </li>
        );
    }, []);

    const renderLinkSection: RenderSectionItemFunction = useCallback(({ label, section, additionalProps }, key, index, level) => {
        return (
            <li key={key} {...additionalProps} data-key={key} data-index={index.toString()} data-level={level.toString()}>
                {label}
                {section}
            </li>
        );
    }, []);

    const renderItem: RenderItemFunction = useCallback((item, key, index, level) => {
        if (!item.canRender || (item.canRender && item.canRender())) {
            return isNavigationLink(item) ? renderLinkItem(item, key, index, level) : renderLinkSection(item, key, index, level);
        }
    }, [renderLinkItem, renderLinkSection]);

    const renderSection: RenderSectionFunction = useCallback((elements, key, index, level) => {
        return (
            <ul key={key} data-key={key} data-index={index.toString()} data-level={level.toString()}>
                {elements}
            </ul>
        );
    }, []);

    // eslint-disable-next-line testing-library/render-result-naming-convention
    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>{renderedNavigationItems}</>
    );
}

test("highest priority goes first", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            to: "/foo"
        },
        {
            $label: "Bar",
            $priority: 5,
            to: "/bar"
        },
        {
            $label: "Toto",
            $priority: 99,
            to: "/toto"
        },
        {
            $label: "Tutu",
            to: "/tutu"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("negative priority goes last", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            to: "/foo"
        },
        {
            $label: "Bar",
            to: "/bar"
        },
        {
            $label: "Toto",
            $priority: -1,
            to: "/toto"
        },
        {
            $label: "Tutu",
            to: "/tutu"
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
            $label: "Foo",
            to: "/foo"
        },
        {
            $label: "Bar",
            children: [
                {
                    $label: "Toto",
                    to: "/toto"
                },
                {
                    $label: "Tutu",
                    to: "/tutu"
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
            $label: "Foo",
            to: "/foo"
        },
        {
            $label: "Bar",
            children: [
                {
                    $label: "Toto",
                    to: "/toto"
                },
                {
                    $label: "Tutu",
                    children: [
                        {
                            $label: "Titi",
                            to: "/titi"
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

test("link item additionalProps are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            $additionalProps: {
                style: { color: "red" }
            },
            to: "/foo"
        },
        {
            $label: "Bar",
            to: "/bar"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("section item additionalProps are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            children: [
                {
                    $label: "Bar",
                    to: "/bar"
                }
            ],
            $additionalProps: {
                style: { color: "red" }
            }
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("link item custom keys are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $key: "foo",
            $label: "Foo",
            $additionalProps: {
                style: { color: "red" }
            },
            to: "/foo"
        },
        {
            $key: "bar",
            $label: "Bar",
            to: "/bar"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("section item custom keys are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $key: "foo",
            $label: "Foo",
            children: [
                {
                    $label: "Bar",
                    to: "/bar"
                }
            ],
            $additionalProps: {
                style: { color: "red" }
            }
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("nested item custom keys are rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            children: [
                {
                    $key: "bar",
                    $label: "Bar",
                    to: "/bar"
                }
            ],
            $additionalProps: {
                style: { color: "red" }
            }
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("when a link item canRender prop return false, the item is not rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $canRender: () => false,
            $label: "Foo",
            to: "/foo"
        },
        {
            $label: "Bar",
            to: "/bar"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("when a section item canRender prop return false, the item is not rendered", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $canRender: () => false,
            $label: "Foo",
            children: [
                {
                    $label: "Bar",
                    to: "/bar"
                }
            ]
        },
        {
            $label: "acme",
            to: "/acme"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("when the canRender prop of all the root items return false, do not render the root section", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $canRender: () => false,
            $label: "Foo",
            to: "/foo"
        },
        {
            $canRender: () => false,
            $label: "Bar",
            to: "/bar"
        }
    ];

    const tree = renderer
        .create(<TestComponent navigationItems={navigationItems} />)
        .toJSON();

    expect(tree).toMatchSnapshot();
});

test("when the canRender prop of all the items of a nested section return false, do not render the section", () => {
    const navigationItems: RootNavigationItem[] = [
        {
            $label: "Foo",
            children: [
                {
                    $canRender: () => false,
                    $label: "Bar",
                    to: "/bar"
                }
            ]
        },
        {
            $label: "John",
            children: [
                {
                    $label: "Doe",
                    children: [
                        {
                            $canRender: () => false,
                            $label: "Acme",
                            to: "/acme"
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

test("doesn't rerender when the navigation items haven't changed", () => {
    const initialItems: NavigationItem[] = [
        {
            $label: "Foo",
            to: "/foo"
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
    const initialItems: NavigationItem[] = [
        {
            $label: "Foo",
            to: "/foo"
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
                $label: "Bar",
                to: "/bar"
            }
        ]
    });

    expect(renderItem).toHaveBeenCalledTimes(2);
    expect(renderSection).toHaveBeenCalledTimes(2);
});
