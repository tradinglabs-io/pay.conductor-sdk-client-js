import { $, component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
	PayConductor,
	PayConductorCheckoutElement,
	usePayConductor,
	usePayconductorElement,
} from "@payconductor-sdk-web/library-qwik";

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
			const result = await confirmPayment({ orderId });
			console.log("Resultado do pagamento:", result);

			if (result.status === "succeeded") {
				alert("Pagamento realizado com sucesso!");
			}
		} catch (err: any) {
			errorMessage.value = err.message || "Falha no pagamento";
		} finally {
			isProcessing.value = false;
		}
	});

	const handleReady = $(() => {
		console.log("PayConductor pronto");
	});

	const handleError = $((err: Error) => {
		console.error("Erro:", err);
	});

	const handlePaymentComplete = $((result: any) => {
		console.log("Pagamento completo:", result);
	});

	const handlePaymentMethodSelected = $((method: any) => {
		console.log("Método selecionado:", method);
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
						Método selecionado: <strong>{selectedMethod.value}</strong>
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
					{isProcessing.value ? "Processando..." : "Finalizar compra"}
				</button>

				{errorMessage.value && (
					<div style={{ color: "#fa755a", marginTop: "16px" }}>
						{errorMessage.value}
					</div>
				)}

				{error && (
					<div style={{ color: "#fa755a", marginTop: "16px" }}>
						Erro: {error}
					</div>
				)}
			</PayConductor>
		</div>
	);
});

export const head: DocumentHead = {
	title: "PayConductor Checkout",
};
