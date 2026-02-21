// PayConductor Shared Constants
// Served statically at iframe.payconductor.ai/constants.ts
// Used by the iFrame (imported directly) and the SDK Web (synced with: bun sync)

export const APP_BASE_URL_PROD = "https://app.payconductor.ai";
export const API_BASE_URL_PROD = "https://app.payconductor.ai/api/v1";
export const IFRAME_BASE_URL_PROD = "https://iframe.payconductor.ai/v1";
export const IFRAME_BASE_URL_DEV = "http://localhost:5175/v1";
export const APP_BASE_URL_DEV = "http://localhost:3000";
export const DEFAULT_LOCALE = "pt-BR";
export const REQUEST_TIMEOUT_MS = 30000;
export const IFRAME_DEFAULT_HEIGHT = "600px";
