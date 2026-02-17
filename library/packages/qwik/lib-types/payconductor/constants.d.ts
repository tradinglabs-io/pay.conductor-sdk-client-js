import { IncomingMessageType, OutgoingMessageType } from "./types";
export declare const IFRAME_BASE_URL = "https://iframe.payconductor.ai";
export declare const ALLOWED_ORIGINS: string[];
export declare const DEFAULT_LOCALE = "pt-BR";
export declare const IFRAME_DEFAULT_HEIGHT = "600px";
export declare const REQUEST_TIMEOUT = 30000;
export declare const MESSAGE_TYPES: Record<OutgoingMessageType | IncomingMessageType, OutgoingMessageType | IncomingMessageType>;
export declare const ERROR_CODES: {
    readonly INVALID_CLIENT: "invalid_client";
    readonly INVALID_TOKEN: "invalid_token";
    readonly NETWORK_ERROR: "network_error";
    readonly IFRAME_NOT_READY: "iframe_not_ready";
    readonly PAYMENT_DECLINED: "payment_declined";
    readonly VALIDATION_ERROR: "validation_error";
    readonly TIMEOUT: "timeout";
};
