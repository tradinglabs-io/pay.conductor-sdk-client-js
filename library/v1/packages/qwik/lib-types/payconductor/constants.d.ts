import { IncomingMessage, OutgoingMessage } from "./iframe/types";
export declare const IFRAME_BASE_URL: string;
export declare const ALLOWED_ORIGINS: string[];
export declare const IFRAME_DEFAULT_HEIGHT_VALUE = "600px";
export declare const REQUEST_TIMEOUT = 30000;
export declare const POST_MESSAGES: {
    readonly INIT: OutgoingMessage.Init;
    readonly CONFIG: OutgoingMessage.Config;
    readonly UPDATE: OutgoingMessage.Update;
    readonly CONFIRM_PAYMENT: OutgoingMessage.ConfirmPayment;
    readonly VALIDATE: OutgoingMessage.Validate;
    readonly RESET: OutgoingMessage.Reset;
    readonly READY: IncomingMessage.Ready;
    readonly ERROR: IncomingMessage.Error;
    readonly PAYMENT_COMPLETE: IncomingMessage.PaymentComplete;
    readonly PAYMENT_FAILED: IncomingMessage.PaymentFailed;
    readonly PAYMENT_PENDING: IncomingMessage.PaymentPending;
    readonly VALIDATION_ERROR: IncomingMessage.ValidationError;
    readonly PAYMENT_METHOD_SELECTED: IncomingMessage.PaymentMethodSelected;
};
export declare const ERROR_CODES: {
    readonly INVALID_CLIENT: "InvalidClient";
    readonly INVALID_TOKEN: "InvalidToken";
    readonly NETWORK_ERROR: "NetworkError";
    readonly IFRAME_NOT_READY: "IframeNotReady";
    readonly PAYMENT_DECLINED: "PaymentDeclined";
    readonly VALIDATION_ERROR: "ValidationError";
    readonly TIMEOUT: "Timeout";
};
