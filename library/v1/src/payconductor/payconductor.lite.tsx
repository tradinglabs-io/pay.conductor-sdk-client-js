import { onMount, useState, useStore } from "@builder.io/mitosis";
import type { PayConductorConfig, PaymentMethod, PaymentResult } from "./iframe/types";
import {
	confirmPayment,
	createPendingRequestsMap,
	handleMessageEvent,
	resetPayment,
	sendConfig,
	validatePayment,
} from "./internal";
import type {
	PayConductorApi,
	PayConductorFrame,
	PayConductorState,
	PendingRequest,
} from "./types";
import { buildIframeUrl } from "./utils";

export interface PayConductorEmbedProps extends Omit<PayConductorConfig, "orderId"> {
	children?: any;
	showActionButtons?: boolean;
	debug?: boolean;
	onReady?: () => void;
	onError?: (error: Error) => void;
	onPaymentComplete?: (result: PaymentResult) => void;
	onPaymentFailed?: (result: PaymentResult) => void;
	onPaymentPending?: (result: PaymentResult) => void;
	onPaymentMethodSelected?: (method: PaymentMethod) => void;
}

export default function PayConductor(props: PayConductorEmbedProps) {
	const state = useStore<PayConductorState>({
		isLoaded: false,
		isReady: false,
		error: null as string | null,
		iframeUrl: "",
		pendingMap: null as Map<string, PendingRequest> | null,
		selectedPaymentMethod: null as PaymentMethod | null,
	});

	const [configSent, setConfigSent] = useState(false);

	onMount(() => {
		const log = (...args: any[]) => {
			if (props.debug) {
				console.log("[PayConductor]", ...args);
			}
		};

		log("SDK initializing", { publicKey: props.publicKey });

		const iframeUrl = buildIframeUrl({
			publicKey: props.publicKey,
		});
		state.iframeUrl = iframeUrl;
		state.isLoaded = true;
		state.pendingMap = createPendingRequestsMap();

		log("iframeUrl built:", iframeUrl);
		log("pendingMap created");

		const getIframe = (): HTMLIFrameElement | undefined => {
			const ref = window.PayConductor?.frame?.iframe;
			if (!ref) return undefined;
			if (ref instanceof HTMLIFrameElement) return ref;
			if (typeof ref === "object" && ref !== null) {
				if ("current" in ref) return (ref as any).current ?? undefined;
				if ("value" in ref) return (ref as any).value ?? undefined;
			}
			return ref as HTMLIFrameElement;
		};

		const frame: PayConductorFrame = {
			iframe: null,
			iframeUrl,
			get isReady() {
				return state.isReady;
			},
			get error() {
				return state.error;
			},
		};

		const config: PayConductorConfig = {
			publicKey: props.publicKey,
			theme: props.theme,
			locale: props.locale,
			paymentMethods: props.paymentMethods,
			defaultPaymentMethod: props.defaultPaymentMethod,
		};

		const api: PayConductorApi = {
			confirmPayment: (options: { orderId: string }) => {
				log("confirmPayment called", { orderId: options.orderId });
				return confirmPayment(getIframe(), state.pendingMap, options);
			},
			validate: (data: unknown) => {
				log("validate called", data);
				return validatePayment(getIframe(), state.pendingMap, data);
			},
			reset: () => {
				log("reset called");
				return resetPayment(getIframe(), state.pendingMap);
			},
			getSelectedPaymentMethod: () => state.selectedPaymentMethod,
		};

		window.PayConductor = {
			frame,
			config,
			api,
			selectedPaymentMethod: state.selectedPaymentMethod,
		};

		log("window.PayConductor registered");
		window.dispatchEvent(new CustomEvent("payconductor:registered", { detail: window.PayConductor }));

		const sendConfigToIframe = async () => {
			if (!configSent) {
				const iframe = getIframe();
				if (!iframe) {
					log("sendConfigToIframe: iframe not found, skipping");
					return;
				}
				setConfigSent(true);
				log("sendConfig →", {
					theme: props.theme,
					locale: props.locale,
					paymentMethods: props.paymentMethods,
					defaultPaymentMethod: props.defaultPaymentMethod,
					showPaymentButtons: props.showPaymentButtons,
				});
				sendConfig(iframe, state.pendingMap, {
					theme: props.theme,
					locale: props.locale,
					paymentMethods: props.paymentMethods,
					defaultPaymentMethod: props.defaultPaymentMethod,
					showPaymentButtons: props.showPaymentButtons,
					nuPayConfig: props.nuPayConfig,
				});
			}
		};

		const eventHandler = (event: MessageEvent) => {
			handleMessageEvent(
				event,
				state.pendingMap,
				(val) => {
					state.isReady = val;
					if (val) {
						log("iframe Ready — sending config");
						sendConfigToIframe();
					}
				},
				(val) => {
					state.error = val;
					log("iframe Error:", val);
				},
				() => {
					log("onReady fired");
					props.onReady?.();
				},
				(err) => {
					log("onError fired:", err);
					props.onError?.(err);
				},
				(data) => {
					log("PaymentComplete:", data);
					props.onPaymentComplete?.(data as PaymentResult);
				},
				(data) => {
					log("PaymentFailed:", data);
					props.onPaymentFailed?.(data as PaymentResult);
				},
				(data) => {
					log("PaymentPending:", data);
					props.onPaymentPending?.(data as PaymentResult);
				},
				(method) => {
					log("PaymentMethodSelected:", method);
					state.selectedPaymentMethod = method;
					if (window.PayConductor) {
						window.PayConductor.selectedPaymentMethod = method;
					}
					props.onPaymentMethodSelected?.(method);
				},
			);
		};

		window.addEventListener("message", eventHandler);
		log("SDK initialized — waiting for PayConductorCheckoutElement");
	});

	return (
		<div class="payconductor" id="payconductor" style={{ display: "contents" }}>
			{props.children}
		</div>
	);
}
