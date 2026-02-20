import { ALLOWED_ORIGINS, MESSAGE_TYPES, REQUEST_TIMEOUT } from "./constants";
import type { CreatePaymentMethodOptions, PaymentMethod, PaymentResult, PayConductorConfig } from "./types";
import { generateRequestId, isValidOrigin } from "./utils";
export type PendingRequest = {
  resolve: (value: any) => void;
  reject: (error: any) => void;
};
export function createPendingRequestsMap(): Map<string, PendingRequest> {
  return new Map<string, PendingRequest>();
}
export function sendMessageToIframe(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, type: keyof typeof MESSAGE_TYPES, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!iframe || !("contentWindow" in iframe)) {
      reject(new Error("Iframe not defined"));
      return;
    }
    if (!iframe?.contentWindow) {
      reject(new Error("Iframe not ready"));
      return;
    }
    if (!pendingMap) {
      reject(new Error("Pending requests not initialized"));
      return;
    }
    const requestId = generateRequestId();
    pendingMap.set(requestId, {
      resolve,
      reject
    });
    iframe.contentWindow.postMessage({
      type,
      data,
      requestId
    }, "*");
    setTimeout(() => {
      if (pendingMap?.has(requestId)) {
        pendingMap.delete(requestId);
        reject(new Error("Request timeout"));
      }
    }, REQUEST_TIMEOUT);
  });
}
export function createPaymentMethod(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: CreatePaymentMethodOptions): Promise<PaymentMethod> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CREATE_PAYMENT_METHOD, options);
}
import type { ConfirmPaymentOptions } from "./types";
import { SubmitResult } from "./hooks/use-element";
export function confirmPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: ConfirmPaymentOptions): Promise<PaymentResult> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
    intentToken: options.intentToken,
    returnUrl: options.returnUrl
  });
}
export function validatePayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, data: any): Promise<boolean> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.VALIDATE, data);
}
export function resetPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<void> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.RESET);
}
export function submitPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<SubmitResult> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.SUBMIT);
}
export function sendConfig(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, config: Pick<PayConductorConfig, "intentToken" | "theme" | "locale" | "paymentMethods">): Promise<void> {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIG, config);
}
export function handleMessageEvent(event: MessageEvent, pendingMap: Map<string, PendingRequest> | null, setIsReady: (value: boolean) => void, setError: (value: string | null) => void, onReady?: () => void, onError?: (error: Error) => void, onPaymentComplete?: (data: any) => void) {
  if (!isValidOrigin(event.origin, ALLOWED_ORIGINS)) {
    return;
  }
  const payload = event.data;
  const {
    requestId,
    type,
    data,
    error
  } = payload;
  if (requestId && pendingMap?.has(requestId)) {
    const {
      resolve,
      reject
    } = pendingMap.get(requestId)!;
    pendingMap.delete(requestId);
    if (error) {
      reject(new Error(error.message));
    } else {
      resolve(data);
    }
    return;
  }
  switch (type) {
    case MESSAGE_TYPES.READY:
      setIsReady(true);
      onReady?.();
      break;
    case MESSAGE_TYPES.ERROR:
      setError(error?.message || "Unknown error");
      onError?.(new Error(error?.message));
      break;
    case MESSAGE_TYPES.PAYMENT_COMPLETE:
      onPaymentComplete?.(data);
      break;
  }
}