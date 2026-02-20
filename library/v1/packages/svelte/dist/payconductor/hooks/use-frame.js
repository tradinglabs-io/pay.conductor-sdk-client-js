export function useFrame() {
    const ctx = typeof window !== 'undefined' ? window.__payConductor : null;
    return ctx?.frame || {
        iframe: null,
        isReady: false,
        error: null
    };
}
