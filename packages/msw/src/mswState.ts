export type MswStateChangedListener = () => void;

export class MswState {
    #isReady = false;

    readonly #stateChangedListeners = new Set<MswStateChangedListener>();

    addStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.add(callback);
    }

    removeStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.delete(callback);
    }

    setAsStarted() {
        if (!this.#isReady) {
            this.#isReady = true;

            this.#stateChangedListeners.forEach(x => {
                x();
            });
        }
    }

    get isReady() {
        return this.#isReady;
    }

    // Strictly for Jest tests, this is NOT ideal.
    _reset() {
        this.#isReady = false;
    }
}

const mswState = new MswState();

export function setMswAsReady() {
    mswState.setAsStarted();
}

export function isMswReady() {
    return mswState.isReady;
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
