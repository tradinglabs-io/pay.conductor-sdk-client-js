import {
	IFRAME_BASE_URL_DEV,
	IFRAME_BASE_URL_PROD,
	IFRAME_DEFAULT_HEIGHT,
	REQUEST_TIMEOUT_MS,
} from "./iframe/constants";
import { IncomingMessage, OutgoingMessage } from "./iframe/types";

const isDev =
	typeof window !== "undefined" &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.port === "5175");

export const IFRAME_BASE_URL = isDev ? IFRAME_BASE_URL_DEV : IFRAME_BASE_URL_PROD;

export const ALLOWED_ORIGINS = [IFRAME_BASE_URL_DEV, IFRAME_BASE_URL_PROD];

export const IFRAME_DEFAULT_HEIGHT_VALUE = IFRAME_DEFAULT_HEIGHT;
export const REQUEST_TIMEOUT = REQUEST_TIMEOUT_MS;

export const MESSAGE_TYPES = {
	INIT: OutgoingMessage.Init,
	CONFIG: OutgoingMessage.Config,
	UPDATE: OutgoingMessage.Update,
	CONFIRM_PAYMENT: OutgoingMessage.ConfirmPayment,
	VALIDATE: OutgoingMessage.Validate,
	RESET: OutgoingMessage.Reset,
	READY: IncomingMessage.Ready,
	ERROR: IncomingMessage.Error,
	PAYMENT_COMPLETE: IncomingMessage.PaymentComplete,
	PAYMENT_FAILED: IncomingMessage.PaymentFailed,
	PAYMENT_PENDING: IncomingMessage.PaymentPending,
	VALIDATION_ERROR: IncomingMessage.ValidationError,
	PAYMENT_METHOD_SELECTED: IncomingMessage.PaymentMethodSelected,
} as const;

export const ERROR_CODES = {
	INVALID_CLIENT: "InvalidClient",
	INVALID_TOKEN: "InvalidToken",
	NETWORK_ERROR: "NetworkError",
	IFRAME_NOT_READY: "IframeNotReady",
	PAYMENT_DECLINED: "PaymentDeclined",
	VALIDATION_ERROR: "ValidationError",
	TIMEOUT: "Timeout",
} as const;
