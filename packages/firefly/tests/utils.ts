export function suppressConsoleErrorMessage(partialMessage: string) {
    const originalError = console.error;

    const mock = jest.spyOn(console, "error").mockImplementation((...args) => {
        if (typeof args[0] === "string" && args[0].includes(partialMessage)) {
            return;
        }

        return originalError.call(console, args);
    });

    return () => {
        mock.mockRestore();
    };
}
