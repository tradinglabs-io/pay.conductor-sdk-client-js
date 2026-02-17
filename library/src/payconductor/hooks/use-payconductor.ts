export function usePayconductor() {
  if (typeof window !== 'undefined') {
    return window.__payConductor || null;
  }
  return null;
}
