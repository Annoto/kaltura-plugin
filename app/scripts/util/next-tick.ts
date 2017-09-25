export function nextTick(cb: () => void): () => number {
    return () => setTimeout(cb, 0);
}
