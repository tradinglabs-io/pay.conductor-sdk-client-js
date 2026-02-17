import { PayConductorFrame } from "../types";
export function useFrame(): PayConductorFrame {
  const ctx = typeof window !== 'undefined' ? window.__payConductor : null;
  return ctx?.frame || {
    iframe: null,
    isReady: false,
    error: null
  };
}