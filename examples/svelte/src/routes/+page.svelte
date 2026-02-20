<script lang="ts">
  import {
    PayConductor,
    PayConductorCheckoutElement,
    usePayConductor,
    usePayconductorElement,
    type PaymentMethod,
    type PaymentResult,
  } from '@payconductor-sdk-web/library-svelte';

  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  let errorMessage: string | null = null;
  let isProcessing = false;

  $: selectedMethod = getSelectedPaymentMethod();

  async function handleFinalize() {
    if (!$isReady) return;

    isProcessing = true;
    errorMessage = null;

    try {
      // 1. Crie o pedido no seu backend (Draft) para obter o orderId
      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: {
            paymentMethod: 'Draft',
            availablePaymentMethods: ['CreditCard', 'Pix', 'BankSlip'],
          },
        }),
      });
      const { id: orderId } = await response.json();

      // 2. Confirme o pagamento com o orderId
      const result: PaymentResult = await confirmPayment({ orderId });
      console.log('Resultado do pagamento:', result);

      if (result.status === 'succeeded') {
        alert('Pagamento realizado com sucesso!');
      }
    } catch (err: any) {
      errorMessage = err.message || 'Falha no pagamento';
    } finally {
      isProcessing = false;
    }
  }

  function handlePaymentMethodSelected(method: PaymentMethod) {
    console.log('Método de pagamento selecionado:', method);
  }

  function handlePaymentComplete(result: PaymentResult) {
    console.log('Pagamento completo:', result);
  }
</script>

<div style="max-width: 560px; margin: 0 auto; padding: 24px">
  <h1>PayConductor Checkout</h1>

  <PayConductor
    publicKey="pk_test_123"
    locale="pt-BR"
    debug={true}
    theme={{
      primaryColor: '#0066ff',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
    }}
    onReady={() => console.log('PayConductor pronto')}
    onError={(err) => console.error('Erro:', err)}
    onPaymentComplete={handlePaymentComplete}
    onPaymentMethodSelected={handlePaymentMethodSelected}
  >
    <PayConductorCheckoutElement height="500px" />

    {#if selectedMethod}
      <p style="margin: 12px 0; color: #64748b">
        Método selecionado: <strong>{selectedMethod}</strong>
      </p>
    {/if}

    <button
      type="button"
      disabled={!$isReady || isProcessing}
      on:click={handleFinalize}
      style="width: 100%; padding: 16px; background-color: {$isReady ? '#0066ff' : '#cfd7df'}; color: #ffffff; border: none; border-radius: 8px; cursor: {$isReady ? 'pointer' : 'not-allowed'}; font-size: 16px; font-weight: 600; margin-top: 16px"
    >
      {isProcessing ? 'Processando...' : 'Finalizar compra'}
    </button>

    {#if errorMessage}
      <div style="color: #fa755a; margin-top: 16px">
        {errorMessage}
      </div>
    {/if}

    {#if $error}
      <div style="color: #fa755a; margin-top: 16px">
        Erro: {$error}
      </div>
    {/if}
  </PayConductor>
</div>
