import {
	PayConductor,
	PayConductorCheckoutElement,
	type PaymentMethod,
	type PaymentResult,
	usePayConductor,
	usePayconductorElement,
} from "@payconductor-sdk-web/library-react";
import {
	AvailablePaymentMethods,
	Configuration,
	DocumentType,
	OrderApi,
	type OrderCreateRequest,
} from "payconductor-sdk";
import { useState } from "react";

const sdkConfig = new Configuration({
	username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || "your_client_id",
	password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || "your_client_secret",
});

const orderApi = new OrderApi(sdkConfig);

function CheckoutForm() {
	const { isReady, error } = usePayConductor();
	const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFinalize = async () => {
		if (!isReady) return;

		setIsProcessing(true);
		setErrorMessage(null);

		try {
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
			const message = err instanceof Error ? err.message : "Payment failed";
			setErrorMessage(message);
		} finally {
			setIsProcessing(false);
		}
	};

	const selectedMethod = getSelectedPaymentMethod();

	return (
		<div>
			<PayConductorCheckoutElement height="500px" />

			{selectedMethod && (
				<p style={{ margin: "12px 0", color: "#64748b" }}>
					Selected method: <strong>{selectedMethod}</strong>
				</p>
			)}

			<button
				disabled={!isReady || isProcessing}
				onClick={handleFinalize}
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
				{isProcessing ? "Processing..." : "Checkout"}
			</button>

			{errorMessage && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>{errorMessage}</div>
			)}

			{error && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>Error: {error}</div>
			)}
		</div>
	);
}

export default function App() {
	const handlePaymentMethodSelected = (method: PaymentMethod) => {
		console.log("Payment method selected:", method);
	};

	const handlePaymentComplete = (result: PaymentResult) => {
		console.log("Payment complete:", result);
	};

	return (
		<div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px" }}>
			<h1>PayConductor Checkout</h1>

			<PayConductor
				debug={true}
				locale="pt-BR"
				onError={(err) => console.error("Error:", err)}
				onPaymentComplete={handlePaymentComplete}
				onPaymentMethodSelected={handlePaymentMethodSelected}
				onReady={() => console.log("PayConductor ready")}
				publicKey="pk_test_123"
				theme={{
					primaryColor: "#0066ff",
					fontFamily: "Roboto, sans-serif",
					borderRadius: "8px",
				}}
			>
				<CheckoutForm />
			</PayConductor>
		</div>
	);
}
