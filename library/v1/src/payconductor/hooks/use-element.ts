import { POST_MESSAGES } from "../constants";
import type {
	BillingDetails,
	PayConductorConfig,
	PaymentMethod,
	PaymentResult,
} from "../iframe/types";
import {
	confirmPayment,
	createPendingRequestsMap,
	sendMessageToIframe,
} from "../internal";

export type SubmitResult = {
	error?: {
		message: string;
		code?: string;
		type?: "validation_error" | "payment_error";
	};
	paymentMethod?: PaymentMethod;
};

export type ConfirmPaymentOptions = {
	intentToken: string;
	returnUrl?: string;
};

export type UpdateOptions = {
	billingDetails?: Partial<BillingDetails>;
	address?: Partial<BillingDetails["address"]>;
};

export interface UseElementReturn {
	confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
	validate: (data: unknown) => Promise<boolean>;
	reset: () => Promise<void>;
	getSelectedPaymentMethod: () => PaymentMethod | null;
	updateConfig: (
		config: Partial<Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">>,
	) => void;
	updateIntentToken: (intentToken: string) => void;
	update: (options: UpdateOptions) => void;
	submit: () => Promise<SubmitResult>;
}

function getIframeFromContext(ctx: typeof window.PayConductor): HTMLIFrameElement | null {
	if (!ctx?.frame?.iframe) return null;
	const iframeRef = ctx.frame.iframe;
	if (iframeRef instanceof HTMLIFrameElement) {
		return iframeRef;
	}
	if (iframeRef && typeof iframeRef === "object" && "value" in iframeRef) {
		const value = iframeRef.value;
		if (value instanceof HTMLIFrameElement) {
			return value;
		}
	}
	return null;
}

export function useElement(): UseElementReturn {
	const ctx = typeof window !== "undefined" ? window.PayConductor : null;

	const sendToIframe = (type: string, data?: unknown) => {
		if (!ctx) return;
		const iframe = getIframeFromContext(ctx);
		if (iframe?.contentWindow) {
			iframe.contentWindow.postMessage({ type, data }, "*");
		}
	};

	if (!ctx) {
		return {
			confirmPayment: async () => {
				throw new Error("PayConductor not initialized");
			},
			validate: async () => {
				throw new Error("PayConductor not initialized");
			},
			reset: async () => {
				throw new Error("PayConductor not initialized");
			},
			getSelectedPaymentMethod: () => null,
			updateConfig: () => {
				throw new Error("PayConductor not initialized");
			},
			updateIntentToken: () => {
				throw new Error("PayConductor not initialized");
			},
			update: () => {
				throw new Error("PayConductor not initialized");
			},
			submit: async () => {
				throw new Error("PayConductor not initialized");
			},
		};
	}

	return {
		confirmPayment: async (
			options: ConfirmPaymentOptions,
		): Promise<PaymentResult> => {
			const iframe = getIframeFromContext(ctx);
			const pendingMap = createPendingRequestsMap();

			if (!options.intentToken) {
				throw new Error("Intent token is required");
			}

			return confirmPayment(iframe || undefined, pendingMap, options);
		},
		validate: ctx.api.validate,
		reset: ctx.api.reset,
		getSelectedPaymentMethod: (): PaymentMethod | null => {
			return ctx?.selectedPaymentMethod ?? null;
		},
		updateConfig: (
			config: Partial<
				Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">
			>,
		) => {
			const currentConfig = ctx.config;
			sendToIframe(POST_MESSAGES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				intentToken: currentConfig?.intentToken,
				theme: config.theme ?? currentConfig?.theme,
				locale: config.locale ?? currentConfig?.locale,
				paymentMethods: config.paymentMethods ?? currentConfig?.paymentMethods,
			});
		},
		updateIntentToken: (intentToken: string) => {
			const currentConfig = ctx.config;
			sendToIframe(POST_MESSAGES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				intentToken: intentToken,
				theme: currentConfig?.theme,
				locale: currentConfig?.locale,
				paymentMethods: currentConfig?.paymentMethods,
			});
		},
		update: (options: UpdateOptions) => {
			sendToIframe(POST_MESSAGES.UPDATE, options);
		},
		submit: async (): Promise<SubmitResult> => {
			const iframe = getIframeFromContext(ctx);
			const pendingMap = createPendingRequestsMap();

			try {
				await sendMessageToIframe(
					iframe || undefined,
					pendingMap,
					POST_MESSAGES.CONFIRM_PAYMENT,
					{},
				);
				return { paymentMethod: undefined };
			} catch (error) {
				const message = error instanceof Error ? error.message : "Payment failed";
				return {
					error: {
						message,
						code: "payment_error",
						type: "payment_error",
					},
				};
			}
		},
	};
}
