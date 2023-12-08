export type MswStateChangedListener = () => void;

export class MswState {
    #isStarted = false;

    readonly #stateChangedListeners = new Set<MswStateChangedListener>();

    addStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.add(callback);
    }

    removeStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.delete(callback);
    }

    setAsStarted() {
        if (!this.#isStarted) {
            this.#isStarted = true;

            this.#stateChangedListeners.forEach(x => {
                x();
            });
        }
    }

    get isStarted() {
        return this.#isStarted;
    }

    // Strictly for Jest tests, this is NOT ideal.
    _reset() {
        this.#isStarted = false;
    }
}

const mswState = new MswState();

export function setMswAsStarted() {
    mswState.setAsStarted();
}

export function isMswStarted() {
    return mswState.isStarted;
}

export function addMswStateChangedListener(callback: MswStateChangedListener) {
    mswState.addStateChangedListener(callback);
}

export function removeMswStateChangedListener(callback: MswStateChangedListener) {
    mswState.removeStateChangedListener(callback);
}

// Strictly for Jest tests, this is NOT ideal.
export function __resetMswStatus() {
    mswState._reset();
}
