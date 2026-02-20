import { $, component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
	PayConductor,
	PayConductorCheckoutElement,
	usePayConductor,
	usePayconductorElement,
} from "@payconductor-sdk-web/library-qwik";
import {
	AvailablePaymentMethods,
	Configuration,
	DocumentType,
	OrderApi,
	type OrderCreateRequest,
	type PaymentResult,
} from "payconductor-sdk";

export default component$(() => {
	const { isReady, error } = usePayConductor();
	const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

	const errorMessage = useSignal<string | null>(null);
	const isProcessing = useSignal(false);
	const selectedMethod = useSignal<string | null>(null);

	const handleFinalize = $(async () => {
		if (!isReady) return;

		isProcessing.value = true;
		errorMessage.value = null;

		try {
			// Create SDK client inside the handler (required for Qwik QRL serialization)
			const config = new Configuration({
				username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || "your_client_id",
				password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || "your_client_secret",
			});
			const orderApi = new OrderApi(config);

			// 1. Create the Draft order via payconductor-sdk to get the orderId
			const orderRequest: OrderCreateRequest = {
				chargeAmount: 100.00,
				clientIp: "0.0.0.0",
				customer: {
					documentNumber: "12345678900",
					documentType: DocumentType.Cpf,
					email: "customer@example.com",
					name: "Customer Name",
				},
				discountAmount: 0,
				externalId: `order-${Date.now()}`,
				payment: {
					paymentMethod: "Draft",
					availablePaymentMethods: [
						AvailablePaymentMethods.CreditCard,
						AvailablePaymentMethods.Pix,
						AvailablePaymentMethods.BankSlip,
					],
				},
				shippingFee: 0,
				taxFee: 0,
			};

			const { data: orderData } = await orderApi.orderCreate(orderRequest);

			// 2. Confirm payment with the obtained orderId
			const result: PaymentResult = await confirmPayment({ orderId: orderData.id });
			console.log("Payment result:", result);

			if (result.status === "succeeded") {
				alert("Payment successful!");
			}
		} catch (err: unknown) {
			errorMessage.value = err instanceof Error ? err.message : "Payment failed";
		} finally {
			isProcessing.value = false;
		}
	});

	const handleReady = $(() => {
		console.log("PayConductor ready");
	});

	const handleError = $((err: Error) => {
		console.error("Error:", err);
	});

	const handlePaymentComplete = $((result: PaymentResult) => {
		console.log("Payment complete:", result);
	});

	const handlePaymentMethodSelected = $((method: string) => {
		console.log("Payment method selected:", method);
		selectedMethod.value = method;
	});

	return (
		<div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px" }}>
			<h1>PayConductor Checkout</h1>

			<PayConductor
				debug={true}
				locale="pt-BR"
				onError={handleError}
				onPaymentComplete={handlePaymentComplete}
				onPaymentMethodSelected={handlePaymentMethodSelected}
				onReady={handleReady}
				publicKey="pk_test_123"
				theme={{
					primaryColor: "#0066ff",
					fontFamily: "Roboto, sans-serif",
					borderRadius: "8px",
				}}
			>
				<PayConductorCheckoutElement height="500px" />

				{selectedMethod.value && (
					<p style={{ margin: "12px 0", color: "#64748b" }}>
						Selected method: <strong>{selectedMethod.value}</strong>
					</p>
				)}

				<button
					disabled={!isReady || isProcessing.value}
					onClick$={handleFinalize}
					style={{
						width: "100%",
						padding: "16px",
						backgroundColor: isReady ? "#0066ff" : "#cfd7df",
						color: "#ffffff",
						border: "none",
						borderRadius: "8px",
						cursor: isReady ? "pointer" : "not-allowed",
						fontSize: "16px",
						fontWeight: 600,
						marginTop: "16px",
					}}
					type="button"
				>
					{isProcessing.value ? "Processing..." : "Checkout"}
				</button>

				{errorMessage.value && (
					<div style={{ color: "#fa755a", marginTop: "16px" }}>
						{errorMessage.value}
					</div>
				)}

				{error && (
					<div style={{ color: "#fa755a", marginTop: "16px" }}>
						Error: {error}
					</div>
				)}
			</PayConductor>
		</div>
	);
});

export const head: DocumentHead = {
	title: "PayConductor Checkout",
};
