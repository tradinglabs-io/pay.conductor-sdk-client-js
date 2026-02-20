import type { IncomingMessageType, OutgoingMessageType } from "./types";
const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "5175");
export const IFRAME_BASE_URL = isDev ? "http://localhost:5175" : "https://iframe.payconductor.ai";
export const ALLOWED_ORIGINS = isDev ? ["http://localhost:5175"] : ["https://iframe.payconductor.ai"];
export const DEFAULT_LOCALE = "pt-BR";
export const IFRAME_DEFAULT_HEIGHT = "600px";
export const REQUEST_TIMEOUT = 30000;
export const MESSAGE_TYPES: Record<OutgoingMessageType | IncomingMessageType, OutgoingMessageType | IncomingMessageType> = {
  INIT: "INIT",
  CONFIG: "CONFIG",
  UPDATE: "UPDATE",
  SUBMIT: "SUBMIT",
  CREATE_PAYMENT_METHOD: "CREATE_PAYMENT_METHOD",
  CREATE_PIX_PAYMENT: "CREATE_PIX_PAYMENT",
  CREATE_NUPAY_PAYMENT: "CREATE_NUPAY_PAYMENT",
  CREATE_GOOGLE_PAYMENT: "CREATE_GOOGLE_PAYMENT",
  CREATE_APPLE_PAYMENT: "CREATE_APPLE_PAYMENT",
  CONFIRM_PAYMENT: "CONFIRM_PAYMENT",
  VALIDATE: "VALIDATE",
  RESET: "RESET",
  READY: "READY",
  ERROR: "ERROR",
  PAYMENT_METHOD_CREATED: "PAYMENT_METHOD_CREATED",
  PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
  VALIDATION_ERROR: "VALIDATION_ERROR"
} as const;
export const ERROR_CODES = {
  INVALID_CLIENT: "invalid_client",
  INVALID_TOKEN: "invalid_token",
  NETWORK_ERROR: "network_error",
  IFRAME_NOT_READY: "iframe_not_ready",
  PAYMENT_DECLINED: "payment_declined",
  VALIDATION_ERROR: "validation_error",
  TIMEOUT: "timeout"
} as const