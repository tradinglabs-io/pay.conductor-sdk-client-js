<script lang="ts">
  import { PayConductor, useElement, usePayConductor, type PaymentResult } from '@payconductor-sdk-client-js/library-svelte';

  const { isReady, error } = usePayConductor();
  const { submit, confirmPayment, update } = useElement();

  let errorMessage = null;
  let isProcessing = false;
  let clientName = '';
  let clientEmail = '';

  $: update({ billingDetails: { name: clientName, email: clientEmail } });

  async function handleSubmit(event) {
    event.preventDefault();

    if (!$isReady) {
      return;
    }

    isProcessing = true;
    errorMessage = null;

    try {
      const { error: submitError } = await submit();

      if (submitError) {
        errorMessage = submitError.message || 'Validation failed';
        isProcessing = false;
        return;
      }

      const result: PaymentResult = await confirmPayment({
        intentToken: 'pi_xxx_intent_token_xxx',
        returnUrl: window.location.href,
      });

      console.log('Payment result:', result);

      if (result.status === 'succeeded') {
        alert('Payment successful!');
      }
    } catch (err) {
      errorMessage = err.message || 'Payment failed';
    } finally {
      isProcessing = false;
    }
  }

  function handleReady() {
    console.log('PayConductor is ready');
  }

  function handleError(err) {
    console.error('Error:', err);
  }

  function handlePaymentComplete(result) {
    console.log('Payment completed:', result);
    alert('Payment successful!');
  }
</script>

<h1>PayConductor Checkout</h1>

<PayConductor
  publicKey="pk_test_123"
  intentToken="pi_test_abc123"
  theme={{ 
    primaryColor: '#0066ff',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '8px'
  }}
  locale="pt-BR"
  height="500px"
  onReady={handleReady}
  onError={handleError}
  onPaymentComplete={handlePaymentComplete}
>
  <form on:submit={handleSubmit}>
    <div style="margin-bottom: 16px">
      <label style="display: block; margin-bottom: 8px">
        Nome completo
      </label>
      <input 
        type="text" 
        placeholder="João Silva"
        bind:value={clientName}
        style="width: 100%; padding: 12px; border: 1px solid #e6ebf1; border-radius: 4px"
      />
    </div>
    
    <div style="margin-bottom: 16px">
      <label style="display: block; margin-bottom: 8px">
        Email
      </label>
      <input 
        type="email" 
        placeholder="joao@exemplo.com"
        bind:value={clientEmail}
        style="width: 100%; padding: 12px; border: 1px solid #e6ebf1; border-radius: 4px"
      />
    </div>
    
    <button 
      type="submit" 
      disabled={!$isReady || isProcessing}
      style="width: 100%; padding: 16px; background-color: {$isReady ? '#0066ff' : '#cfd7df'}; color: #ffffff; border: none; border-radius: 4px; cursor: {$isReady ? 'pointer' : 'not-allowed'}; font-size: 16px; font-weight: 600"
    >
      {isProcessing ? 'Processando...' : 'Pagar agora'}
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
  </form>
</PayConductor>
