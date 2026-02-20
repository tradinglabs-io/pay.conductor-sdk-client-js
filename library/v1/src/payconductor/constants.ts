import type { IncomingMessageType, OutgoingMessageType } from "./types";
import {
	API_BASE_URL_PROD,
	DEFAULT_LOCALE as SHARED_DEFAULT_LOCALE,
	IFRAME_BASE_URL_DEV,
	IFRAME_BASE_URL_PROD,
	IFRAME_DEFAULT_HEIGHT as SHARED_IFRAME_DEFAULT_HEIGHT,
	REQUEST_TIMEOUT_MS,
} from "./iframe/constants";

const isDev =
	typeof window !== "undefined" &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.port === "5175");

export const IFRAME_BASE_URL = isDev ? IFRAME_BASE_URL_DEV : IFRAME_BASE_URL_PROD;

export const ALLOWED_ORIGINS = isDev ? [IFRAME_BASE_URL_DEV] : [IFRAME_BASE_URL_PROD];

export const API_BASE_URL = API_BASE_URL_PROD;

export const DEFAULT_LOCALE = SHARED_DEFAULT_LOCALE;
export const IFRAME_DEFAULT_HEIGHT = SHARED_IFRAME_DEFAULT_HEIGHT;
export const REQUEST_TIMEOUT = REQUEST_TIMEOUT_MS;

export const MESSAGE_TYPES: Record<
	OutgoingMessageType | IncomingMessageType,
	OutgoingMessageType | IncomingMessageType
> = {
	INIT: "INIT",
	CONFIG: "CONFIG",
	UPDATE: "UPDATE",
	CONFIRM_PAYMENT: "CONFIRM_PAYMENT",
	VALIDATE: "VALIDATE",
	RESET: "RESET",
	READY: "READY",
	ERROR: "ERROR",
	PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
	PAYMENT_FAILED: "PAYMENT_FAILED",
	PAYMENT_PENDING: "PAYMENT_PENDING",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	PAYMENT_METHOD_SELECTED: "PAYMENT_METHOD_SELECTED",
} as const;

export const ERROR_CODES = {
	INVALID_CLIENT: "invalid_client",
	INVALID_TOKEN: "invalid_token",
	NETWORK_ERROR: "network_error",
	IFRAME_NOT_READY: "iframe_not_ready",
	PAYMENT_DECLINED: "payment_declined",
	VALIDATION_ERROR: "validation_error",
	TIMEOUT: "timeout",
} as const;
