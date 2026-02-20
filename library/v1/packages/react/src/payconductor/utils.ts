import { IFRAME_BASE_URL } from "./constants";
import type { PayConductorConfig } from "./iframe/types";
export function buildIframeUrl(config: PayConductorConfig): string {
  const params = new URLSearchParams({
    publicKey: config.publicKey
  });
  return `${IFRAME_BASE_URL}?${params.toString()}`;
}
export function generateRequestId(): string {
  return crypto.randomUUID();
}
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}