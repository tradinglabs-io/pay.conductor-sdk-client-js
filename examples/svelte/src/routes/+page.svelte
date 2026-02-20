<script>
  import { PayConductor, usePayment, useFrame } from '@payconductor-sdk-client-js/library-svelte';

  const { isReady, error: frameError } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  let errorMessage = null;
  let isProcessing = false;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!$isReady) {
      return;
    }

    isProcessing = true;
    errorMessage = null;

    try {
      const paymentMethod = await createPaymentMethod({
        billingDetails: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });
      console.log('Payment method created:', paymentMethod);

      const result = await confirmPayment(paymentMethod.id);
      console.log('Payment confirmed:', result);
    } catch (error) {
      errorMessage = error.message || 'Payment failed';
    } finally {
      isProcessing = false;
    }
  }

  function handleReady() {
    console.log('PayConductor is ready');
  }

  function handleError(error) {
    console.error('Error:', error);
  }

  function handlePaymentComplete(result) {
    console.log('Payment completed:', result);
    alert('Payment successful!');
  }
</script>

<h1>PayConductor Checkout</h1>

<PayConductor
  clientId="client_123"
  token="token_abc123"
  theme={{ 
    primaryColor: '#0066ff',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '8px'
  }}
  locale="en-US"
  height="500px"
  onReady={handleReady}
  onError={handleError}
  onPaymentComplete={handlePaymentComplete}
>
  <form on:submit={handleSubmit}>
    <div style="margin-bottom: 16px">
      <label style="display: block; margin-bottom: 8px">
        Full Name
      </label>
      <input 
        type="text" 
        placeholder="John Doe"
        style="width: 100%; padding: 12px; border: 1px solid #e6ebf1; border-radius: 4px"
      />
    </div>
    
    <div style="margin-bottom: 16px">
      <label style="display: block; margin-bottom: 8px">
        Email
      </label>
      <input 
        type="email" 
        placeholder="john@example.com"
        style="width: 100%; padding: 12px; border: 1px solid #e6ebf1; border-radius: 4px"
      />
    </div>
    
    <button 
      type="submit" 
      disabled={!$isReady || isProcessing}
      style="width: 100%; padding: 16px; background-color: {$isReady ? '#0066ff' : '#cfd7df'}; color: #ffffff; border: none; border-radius: 4px; cursor: {$isReady ? 'pointer' : 'not-allowed'}; font-size: 16px; font-weight: 600"
    >
      {isProcessing ? 'Processing...' : 'Pay'}
    </button>

    {#if errorMessage}
      <div style="color: #fa755a; margin-top: 16px">
        {errorMessage}
      </div>
    {/if}

    {#if $frameError}
      <div style="color: #fa755a; margin-top: 16px">
        Frame error: {$frameError}
      </div>
    {/if}
  </form>
</PayConductor>
