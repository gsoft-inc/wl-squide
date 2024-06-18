export class GlobalDataQueriesError extends Error {
    readonly #errors: Error[];

    constructor(message: string, errors: Error[]) {
        super(message);

        this.#errors = errors;
    }

    get errors() {
        return this.#errors;
    }
}
