import type { PayConductorConfig } from "./types";
export declare function buildIframeUrl(config: PayConductorConfig): string;
export declare function generateRequestId(): string;
export declare function isValidOrigin(origin: string, allowedOrigins: string[]): boolean;
