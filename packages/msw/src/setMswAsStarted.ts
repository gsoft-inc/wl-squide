let isStarted = false;

export function setMswAsStarted() {
    isStarted = true;
}

export function isMswStarted() {
    return isStarted;
}
