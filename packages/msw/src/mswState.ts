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
}

let mswState: MswState;

function getMswState() {
    if (!mswState) {
        mswState = new MswState();
    }

    return mswState;
}

// This function should only be used by tests.
export function __setMswState(state: MswState) {
    mswState = state;
}

export function setMswAsReady() {
    getMswState().setAsStarted();
}

export function isMswReady() {
    return getMswState().isReady;
}

export function addMswStateChangedListener(callback: MswStateChangedListener) {
    getMswState().addStateChangedListener(callback);
}

export function removeMswStateChangedListener(callback: MswStateChangedListener) {
    getMswState().removeStateChangedListener(callback);
}
