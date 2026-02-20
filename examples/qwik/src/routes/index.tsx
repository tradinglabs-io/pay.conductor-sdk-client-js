import { $, component$, type QwikSubmitEvent, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
	PayConductor,
	useElement,
	usePayConductor,
} from "@payconductor-sdk-client-js/library-qwik";

export default component$(() => {
	const { isReady, error } = usePayConductor();
	const { submit, confirmPayment } = useElement();

	const errorMessage = useSignal<string | null>(null);
	const isProcessing = useSignal(false);

	const handleSubmit = $((event: QwikSubmitEvent<HTMLFormElement>) => {
		event.nativeEvent?.preventDefault();

		if (!isReady) {
			return;
		}

		isProcessing.value = true;
		errorMessage.value = null;

		const doPayment = async () => {
			try {
				const { error: submitError } = await submit();

				if (submitError) {
					errorMessage.value = submitError.message || "Validation failed";
					isProcessing.value = false;
					return;
				}

				const result = await confirmPayment({
					intentToken: "pi_xxx_intent_token_xxx",
					returnUrl: window.location.href,
				});

				console.log("Payment result:", result);

				if (result.status === "succeeded") {
					alert("Payment successful!");
				}
			} catch (err: any) {
				errorMessage.value = err.message || "Payment failed";
			} finally {
				isProcessing.value = false;
			}
		};

		doPayment();
	});

	const handleReady = $(() => {
		console.log("PayConductor is ready");
	});

	const handleError = $((err: Error) => {
		console.error("Error:", err);
	});

	const handlePaymentComplete = $((result: any) => {
		console.log("Payment completed:", result);
	});

	return (
		<>
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
				<form onSubmit$={handleSubmit}>
					<div style={{ marginBottom: "16px" }}>
						<label style={{ display: "block", marginBottom: "8px" }}>
							Nome completo
						</label>
						<input
							placeholder="João Silva"
							style={{
								width: "100%",
								padding: "12px",
								border: "1px solid #e6ebf1",
								borderRadius: "4px",
							}}
							type="text"
						/>
					</div>

					<div style={{ marginBottom: "16px" }}>
						<label style={{ display: "block", marginBottom: "8px" }}>
							Email
						</label>
						<input
							placeholder="joao@exemplo.com"
							style={{
								width: "100%",
								padding: "12px",
								border: "1px solid #e6ebf1",
								borderRadius: "4px",
							}}
							type="email"
						/>
					</div>

					<button
						disabled={!isReady || isProcessing.value}
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
						{isProcessing.value ? "Processando..." : "Pagar agora"}
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
				</form>
			</PayConductor>
		</>
	);
});

export const head: DocumentHead = {
	title: "PayConductor Checkout",
};
