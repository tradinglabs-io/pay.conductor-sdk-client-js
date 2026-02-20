import {
	PayConductor,
	type PaymentResult,
	useElement,
	usePayConductor,
} from "@payconductor-sdk-client-js/library-react";
import { useEffect, useState } from "react";

function CheckoutForm() {
	const { isReady, error } = usePayConductor();
	const { update, submit, confirmPayment } = useElement();

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [clientName, setClientName] = useState("");
	const [clientEmail, setClientEmail] = useState("");

	useEffect(() => {
		update({
			billingDetails: {
				name: clientName,
				email: clientEmail,
			},
		});
	}, [clientName, clientEmail, update]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!isReady) {
			return;
		}

		setIsProcessing(true);
		setErrorMessage(null);

		try {
			const { error: submitError } = await submit();

			if (submitError) {
				setErrorMessage(submitError.message || "Validation failed");
				setIsProcessing(false);
				return;
			}

			const result: PaymentResult = await confirmPayment({
				intentToken: "pi_xxx_intent_token_xxx",
				returnUrl: window.location.href,
			});

			console.log("Payment result:", result);

			if (result.status === "succeeded") {
				alert("Payment successful!");
			}
		} catch (err: any) {
			setErrorMessage(err.message || "Payment failed");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div style={{ marginBottom: "16px" }}>
				<label htmlFor="name" style={{ display: "block", marginBottom: "8px" }}>
					Nome completo
				</label>
				<input
					id="name"
					onInput={(e) => setClientName(e.currentTarget.value)}
					placeholder="João Silva"
					style={{
						width: "100%",
						padding: "12px",
						border: "1px solid #e6ebf1",
						borderRadius: "4px",
					}}
					type="text"
					value={clientName}
				/>
			</div>

			<div style={{ marginBottom: "16px" }}>
				<label htmlFor="email" style={{ display: "block", marginBottom: "8px" }}>
					Email
				</label>
				<input
					id="email"
					onInput={(e) => setClientEmail(e.currentTarget.value)}
					placeholder="joao@exemplo.com"
					style={{
						width: "100%",
						padding: "12px",
						border: "1px solid #e6ebf1",
						borderRadius: "4px",
					}}
					type="email"
					value={clientEmail}
				/>
			</div>

			<button
				disabled={!isReady || isProcessing}
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
				}}
				type="submit"
			>
				{isProcessing ? "Processando..." : "Pagar agora"}
			</button>

			{errorMessage && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>{errorMessage}</div>
			)}

			{error && (
				<div style={{ color: "#fa755a", marginTop: "16px" }}>Erro: {error}</div>
			)}
		</form>
	);
}

export default function App() {
	const handleReady = () => {
		console.log("PayConductor pronto");
	};

	const handleError = (err: Error) => {
		console.error("Erro:", err);
	};

	const handlePaymentComplete = (result: PaymentResult) => {
		console.log("Pagamento completo:", result);
	};

	return (
		<div style={{ maxWidth: "500px", margin: "0 auto", padding: "24px" }}>
			<h1>PayConductor Checkout</h1>

			<PayConductor
				height="500px"
				intentToken="pi_test_abc123"
				locale="pt-BR"
				onError={handleError}
				onPaymentComplete={handlePaymentComplete}
				onReady={handleReady}
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
