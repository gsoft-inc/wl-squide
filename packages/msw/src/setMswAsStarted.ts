let isStarted = false;

export function setMswAsStarted() {
    isStarted = true;
}

export function isMswStarted() {
    return isStarted;
}

// Strictly for Jest tests, this is NOT ideal.
export function __resetMswStatus() {
    isStarted = false;
}
