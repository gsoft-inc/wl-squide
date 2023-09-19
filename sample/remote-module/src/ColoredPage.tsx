import { useBackgroundColor } from "@sample/shared";

export default function ColoredPage() {
    const backgroundColor = useBackgroundColor();

    return (
        <div style={{ backgroundColor }}>
            The background color is "{backgroundColor}"
        </div>
    );
}
