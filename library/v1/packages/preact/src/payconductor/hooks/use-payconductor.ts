import { PayConductorConfig, PayConductorFrame } from "../types";
type UsePayConductorReturn = PayConductorFrame & Partial<PayConductorConfig>;
export function usePayConductor(): UsePayConductorReturn {
  const ctx = typeof window !== 'undefined' ? window.__PAY_CONDUCTOR__ : null;
  const config = ctx?.config ? {
    publicKey: ctx.config.publicKey,
    intentToken: ctx.config.intentToken,
    theme: ctx.config.theme,
    locale: ctx.config.locale
  } : {};
  const frame = ctx?.frame ? {
    iframe: ctx.frame.iframe,
    isReady: ctx.frame.isReady,
    error: ctx.frame.error
  } : {
    iframe: null,
    isReady: false,
    error: null
  };
  return {
    ...config,
    ...frame
  };
}