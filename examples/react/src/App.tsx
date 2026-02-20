import {
	PayConductor,
	PayConductorCheckoutElement,
	type PaymentMethod,
	type PaymentResult,
	usePayConductor,
	usePayconductorElement,
} from "@payconductor-sdk-web/library-react";
import { useState } from "react";

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
			// 1. Crie o pedido no seu backend (Draft) para obter o orderId
			const response = await fetch("http://localhost:3000/api/v1/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					payment: {
						paymentMethod: "Draft",
						availablePaymentMethods: ["CreditCard", "Pix", "BankSlip"],
					},
				}),
			});
			const { id: orderId } = await response.json();

			// 2. Confirme o pagamento com o orderId
			const result: PaymentResult = await confirmPayment({ orderId });
			console.log("Resultado do pagamento:", result);

			if (result.status === "succeeded") {
				alert("Pagamento realizado com sucesso!");
			}
		} catch (err: any) {
			setErrorMessage(err.message || "Falha no pagamento");
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
					Método selecionado: <strong>{selectedMethod}</strong>
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
				{isProcessing ? "Processando..." : "Finalizar compra"}
			</button>

			{errorMessage && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>{errorMessage}</div>
			)}

			{error && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>Erro: {error}</div>
			)}
		</div>
	);
}

export default function App() {
	const handlePaymentMethodSelected = (method: PaymentMethod) => {
		console.log("Método de pagamento selecionado:", method);
	};

	const handlePaymentComplete = (result: PaymentResult) => {
		console.log("Pagamento completo:", result);
	};

	return (
		<div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px" }}>
			<h1>PayConductor Checkout</h1>

			<PayConductor
				debug={true}
				locale="pt-BR"
				onError={(err) => console.error("Erro:", err)}
				onPaymentComplete={handlePaymentComplete}
				onPaymentMethodSelected={handlePaymentMethodSelected}
				onReady={() => console.log("PayConductor pronto")}
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
