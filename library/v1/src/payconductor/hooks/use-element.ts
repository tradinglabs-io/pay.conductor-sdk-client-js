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
	sendInit,
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
	orderId: string;
	returnUrl?: string;
};

export type UpdateOptions = {
	billingDetails?: Partial<BillingDetails>;
	address?: Partial<BillingDetails["address"]>;
};

export interface UsePayconductorElementReturn {
	init: (config: PayConductorConfig) => Promise<void>;
	confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
	validate: (data: unknown) => Promise<boolean>;
	reset: () => Promise<void>;
	getSelectedPaymentMethod: () => PaymentMethod | null;
	updateConfig: (
		config: Partial<Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">>,
	) => void;
	updateorderId: (orderId: string) => void;
	update: (options: UpdateOptions) => void;
	submit: () => Promise<SubmitResult>;
}

function getIframeFromContext(ctx: typeof window.PayConductor): HTMLIFrameElement | null {
	if (ctx?.frame?.iframe) {
		const iframeRef = ctx.frame.iframe;
		if (iframeRef instanceof HTMLIFrameElement) return iframeRef;
		if (iframeRef && typeof iframeRef === "object") {
			if ("current" in iframeRef) {
				const el = (iframeRef as any).current;
				if (el instanceof HTMLIFrameElement) return el;
			}
			if ("value" in iframeRef) {
				const el = (iframeRef as any).value;
				if (el instanceof HTMLIFrameElement) return el;
			}
		}
	}
	return (document.querySelector(".payconductor-element iframe") as HTMLIFrameElement) ?? null;
}

export function usePayconductorElement(): UsePayconductorElementReturn {
	const getCtx = () => (typeof window !== "undefined" ? window.PayConductor : null);

	const sendToIframe = (type: string, data?: unknown) => {
		const ctx = getCtx();
		if (!ctx) return;
		const iframe = getIframeFromContext(ctx);
		if (iframe?.contentWindow) {
			iframe.contentWindow.postMessage({ type, data }, "*");
		}
	};

	return {
		init: async (config: PayConductorConfig): Promise<void> => {
			const iframe = getIframeFromContext(getCtx());
			const pendingMap = createPendingRequestsMap();
			return sendInit(iframe || undefined, pendingMap, config);
		},
		confirmPayment: async (
			options: ConfirmPaymentOptions,
		): Promise<PaymentResult> => {
			const iframe = getIframeFromContext(getCtx());
			const pendingMap = createPendingRequestsMap();

			if (!options.orderId) {
				throw new Error("Order ID is required");
			}

			return confirmPayment(iframe || undefined, pendingMap, options);
		},
		validate: (data: unknown) => {
			const ctx = getCtx();
			if (!ctx) return Promise.resolve(false);
			return ctx.api.validate(data);
		},
		reset: () => {
			const ctx = getCtx();
			if (!ctx) return Promise.resolve();
			return ctx.api.reset();
		},
		getSelectedPaymentMethod: (): PaymentMethod | null => {
			return getCtx()?.selectedPaymentMethod ?? null;
		},
		updateConfig: (
			config: Partial<
				Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">
			>,
		) => {
			const currentConfig = getCtx()?.config;
			sendToIframe(POST_MESSAGES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				orderId: currentConfig?.orderId,
				theme: config.theme ?? currentConfig?.theme,
				locale: config.locale ?? currentConfig?.locale,
				paymentMethods: config.paymentMethods ?? currentConfig?.paymentMethods,
			});
		},
		updateorderId: (orderId: string) => {
			const currentConfig = getCtx()?.config;
			sendToIframe(POST_MESSAGES.CONFIG, {
				publicKey: currentConfig?.publicKey,
				orderId: orderId,
				theme: currentConfig?.theme,
				locale: currentConfig?.locale,
				paymentMethods: currentConfig?.paymentMethods,
			});
		},
		update: (options: UpdateOptions) => {
			sendToIframe(POST_MESSAGES.UPDATE, options);
		},
		submit: async (): Promise<SubmitResult> => {
			const iframe = getIframeFromContext(getCtx());
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
