import { onMount, useRef, useState, useStore } from "@builder.io/mitosis";
import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";
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

export interface PayConductorEmbedProps extends PayConductorConfig {
	height?: string;
	children?: any;
	showActionButtons?: boolean;
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

	const iframeRef = useRef<any>(null);

	const [configSent, setConfigSent] = useState(false);

	onMount(() => {
		state.iframeUrl = buildIframeUrl({
			publicKey: props.publicKey,
		});
		state.isLoaded = true;
		state.pendingMap = createPendingRequestsMap();

		const frame: PayConductorFrame = {
			iframe: iframeRef,
			get isReady() {
				return state.isReady;
			},
			get error() {
				return state.error;
			},
		};

		const config: PayConductorConfig = {
			publicKey: props.publicKey,
			intentToken: props.intentToken,
			theme: props.theme,
			locale: props.locale,
			paymentMethods: props.paymentMethods,
			defaultPaymentMethod: props.defaultPaymentMethod,
		};

		const api: PayConductorApi = {
			confirmPayment: (options: { intentToken: string }) =>
				confirmPayment(iframeRef, state.pendingMap, options),
			validate: (data: unknown) =>
				validatePayment(iframeRef, state.pendingMap, data),
			reset: () => resetPayment(iframeRef, state.pendingMap),
			getSelectedPaymentMethod: () => state.selectedPaymentMethod,
		};

		window.PayConductor = {
			frame,
			config,
			api,
			selectedPaymentMethod: state.selectedPaymentMethod,
		};

		const sendConfigToIframe = async () => {
			if (!configSent && iframeRef) {
				setConfigSent(true);
				sendConfig(iframeRef, state.pendingMap, {
					intentToken: props.intentToken,
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
						sendConfigToIframe();
					}
				},
				(val) => {
					state.error = val;
				},
				props.onReady,
				props.onError,
				(data) => props.onPaymentComplete?.(data as PaymentResult),
				(data) => props.onPaymentFailed?.(data as PaymentResult),
				(data) => props.onPaymentPending?.(data as PaymentResult),
				(method) => {
					state.selectedPaymentMethod = method;
					if (window.PayConductor) {
						window.PayConductor.selectedPaymentMethod = method;
					}
					props.onPaymentMethodSelected?.(method);
				},
			);
		};

		window.addEventListener("message", eventHandler);
	});

	return (
		<div
			class="payconductor"
			id="payconductor"
			style={{
				width: "100%",
				position: "relative",
			}}
		>
			{props.children}
			{state.isLoaded && (
				<iframe
					allow="payment"
					ref={iframeRef}
					src={state.iframeUrl}
					style={{
						width: "100%",
						height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
						border: "none",
					}}
					title="PayConductor"
				/>
			)}
		</div>
	);
}
