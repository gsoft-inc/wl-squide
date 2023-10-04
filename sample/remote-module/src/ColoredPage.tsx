import { useBackgroundColor } from "@sample/shared";

export function ColoredPage() {
    const backgroundColor = useBackgroundColor();

    return (
        <div style={{ backgroundColor }}>
            The background color is "{backgroundColor}"
        </div>
    );
}

export const Component = ColoredPage;
