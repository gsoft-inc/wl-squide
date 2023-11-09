export class ApiError extends Error {
    readonly #status: number;
    readonly #statusText: string;
    readonly #stack?: string;

    constructor(status: number, statusText: string, innerStack?: string) {
        super(`${status} ${statusText}`);

        this.#status = status;
        this.#statusText = statusText;
        this.#stack = innerStack;
    }

    get status() {
        return this.#status;
    }

    get statusText() {
        return this.#statusText;
    }

    get stack() {
        return this.#stack;
    }
}

export function isApiError(error?: unknown): error is ApiError {
    return error !== undefined && error !== null && error instanceof ApiError;
}

export async function fetchJson(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }

    const data = await response.json();

    return data;
}

export async function postJson(url: string, body?: unknown) {
    const response = await fetch(url, {
        body: body ? JSON.stringify(body) : undefined,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }
}

