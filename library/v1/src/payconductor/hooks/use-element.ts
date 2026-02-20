import { MESSAGE_TYPES } from "../constants";
import {
	createPendingRequestsMap,
	sendMessageToIframe,
} from "../internal";
import {BillingDetails, PayConductorConfig, PaymentMethod, PaymentResult} from "../iframe/types";
import { PayConductorApi } from "../types";

export type SubmitResult = {
	error?: {
		message: string;
		code?: string;
		type?: "validation_error" | "payment_error";
	};
	paymentMethod?: PaymentMethod;
}

export type ConfirmPaymentOptions = {
	intentToken: string;
	returnUrl?: string;
}

export type UpdateOptions = {
	billingDetails?: Partial<BillingDetails>;
	address?: Partial<BillingDetails["address"]>;
}

export interface UseElementReturn extends PayConductorApi {
	updateConfig: (
		config: Partial<Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">>,
	) => void;
	updateIntentToken: (intentToken: string) => void;
	update: (options: UpdateOptions) => void;
	submit: () => Promise<SubmitResult>;
	confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
	getSelectedPaymentMethod: () => PaymentMethod | null;
}

export function useElement(): UseElementReturn {
	const ctx = typeof window !== "undefined" ? window.PayConductor : null;

	const getIframe = () => {
		if (!ctx?.frame?.iframe) return null;
		const iframeRef = ctx.frame.iframe as { value?: HTMLIFrameElement };
		return iframeRef?.value || null;
	};

	const sendToIframe = (type: string, data?: any) => {
		const iframe = getIframe();
		if (iframe?.contentWindow) {
			iframe.contentWindow.postMessage({ type, data }, "*");
		}
	};

	if (!ctx) {
		return {
			createPaymentMethod: async () => {
				throw new Error("PayConductor not initialized");
			},
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
		createPaymentMethod: ctx.api.createPaymentMethod,
		confirmPayment: async (options: ConfirmPaymentOptions) => {
			const iframe = getIframe();
			const pendingMap = createPendingRequestsMap();

			if (!options.intentToken) {
				throw new Error("Intent token is required");
			}

			return sendMessageToIframe(
				iframe || undefined,
				pendingMap,
				MESSAGE_TYPES.CONFIRM_PAYMENT,
				{
					intentToken: options.intentToken,
					returnUrl: options.returnUrl,
				},
			);
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
			sendToIframe(MESSAGE_TYPES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				intentToken: currentConfig?.intentToken,
				theme: config.theme ?? currentConfig?.theme,
				locale: config.locale ?? currentConfig?.locale,
				paymentMethods: config.paymentMethods ?? currentConfig?.paymentMethods,
			});
		},
		updateIntentToken: (intentToken: string) => {
			const currentConfig = ctx.config;
			sendToIframe(MESSAGE_TYPES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				intentToken: intentToken,
				theme: currentConfig?.theme,
				locale: currentConfig?.locale,
				paymentMethods: currentConfig?.paymentMethods,
			});
		},
		update: (options: UpdateOptions) => {
			sendToIframe(MESSAGE_TYPES.UPDATE, options);
		},
		submit: async () => {
			const iframe = getIframe();
			const pendingMap = createPendingRequestsMap();

			try {
				return await submitPayment(iframe || undefined, pendingMap);
			} catch (error: any) {
				return {
					error: {
						message: error.message || "Payment failed",
						code: "payment_error",
						type: "payment_error",
					},
				};
			}
		},
	};
}
