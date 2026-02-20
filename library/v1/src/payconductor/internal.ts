import { ALLOWED_ORIGINS, MESSAGE_TYPES, REQUEST_TIMEOUT } from "./constants";
import type { PayConductorConfig, PaymentMethod, PaymentResult } from "./iframe/types";
import type { ConfirmPaymentOptions, PendingRequest } from "./types";
import { generateRequestId, isValidOrigin } from "./utils";

export function createPendingRequestsMap(): Map<string, PendingRequest> {
	return new Map<string, PendingRequest>();
}

export function sendMessageToIframe(
	iframe: HTMLIFrameElement | Element | undefined,
	pendingMap: Map<string, PendingRequest> | null,
	type: keyof typeof MESSAGE_TYPES,
	data?: unknown,
): Promise<unknown> {
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
		pendingMap.set(requestId, { resolve, reject });

		iframe.contentWindow.postMessage({ type, data, requestId }, "*");

		setTimeout(() => {
			if (pendingMap?.has(requestId)) {
				pendingMap.delete(requestId);
				reject(new Error("Request timeout"));
			}
		}, REQUEST_TIMEOUT);
	});
}

export function confirmPayment(
	iframe: HTMLIFrameElement | Element | undefined,
	pendingMap: Map<string, PendingRequest> | null,
	options: ConfirmPaymentOptions,
): Promise<PaymentResult> {
	return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
		intentToken: options.intentToken,
	}) as Promise<PaymentResult>;
}

export function validatePayment(
	iframe: HTMLIFrameElement | Element | undefined,
	pendingMap: Map<string, PendingRequest> | null,
	data: unknown,
): Promise<boolean> {
	return sendMessageToIframe(
		iframe,
		pendingMap,
		MESSAGE_TYPES.VALIDATE,
		data,
	) as Promise<boolean>;
}

export function resetPayment(
	iframe: HTMLIFrameElement | Element | undefined,
	pendingMap: Map<string, PendingRequest> | null,
): Promise<void> {
	return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.RESET) as Promise<void>;
}

export function sendConfig(
	iframe: HTMLIFrameElement | Element | undefined,
	pendingMap: Map<string, PendingRequest> | null,
	config: Pick<
		PayConductorConfig,
		| "intentToken"
		| "theme"
		| "locale"
		| "paymentMethods"
		| "defaultPaymentMethod"
		| "showPaymentButtons"
	>,
): Promise<void> {
	return sendMessageToIframe(
		iframe,
		pendingMap,
		MESSAGE_TYPES.CONFIG,
		config,
	) as Promise<void>;
}

type MessagePayload = {
	requestId?: string;
	type?: string;
	data?: PaymentResult | { paymentMethod: PaymentMethod };
	error?: { message?: string };
};

export function handleMessageEvent(
	event: MessageEvent,
	pendingMap: Map<string, PendingRequest> | null,
	setIsReady: (value: boolean) => void,
	setError: (value: string | null) => void,
	onReady?: () => void,
	onError?: (error: Error) => void,
	onPaymentComplete?: (data: PaymentResult) => void,
	onPaymentFailed?: (data: PaymentResult) => void,
	onPaymentPending?: (data: PaymentResult) => void,
	onPaymentMethodSelected?: (method: PaymentMethod) => void,
) {
	if (!isValidOrigin(event.origin, ALLOWED_ORIGINS)) {
		return;
	}

	const payload: MessagePayload = event.data;
	const { requestId, type, data, error } = payload;

	if (requestId && pendingMap?.has(requestId)) {
		const { resolve, reject } = pendingMap.get(requestId)!;
		pendingMap.delete(requestId);

		if (error) {
			reject(new Error(error.message));
		} else {
			resolve(data);
		}
		return;
	}

	if (type === MESSAGE_TYPES.READY) {
		setIsReady(true);
		onReady?.();
		return;
	}

	if (type === MESSAGE_TYPES.ERROR) {
		setError(error?.message || "Unknown error");
		onError?.(new Error(error?.message));
		return;
	}

	if (type === MESSAGE_TYPES.PAYMENT_COMPLETE) {
		if (data && typeof data === "object" && "status" in data) {
			onPaymentComplete?.(data);
		}
		return;
	}

	if (type === MESSAGE_TYPES.PAYMENT_FAILED) {
		if (data && typeof data === "object" && "status" in data) {
			onPaymentFailed?.(data);
		}
		return;
	}

	if (type === MESSAGE_TYPES.PAYMENT_PENDING) {
		if (data && typeof data === "object" && "status" in data) {
			onPaymentPending?.(data);
		}
		return;
	}

	if (type === MESSAGE_TYPES.PAYMENT_METHOD_SELECTED) {
		if (data && typeof data === "object" && "paymentMethod" in data) {
			onPaymentMethodSelected?.(data.paymentMethod);
		}
		return;
	}
}
