import { component$, useSignal, $, type QwikSubmitEvent } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { PayConductor, usePayment, useFrame } from '@payconductor-sdk-client-js/library-qwik';

export default component$(() => {
  const { isReady, error: frameError } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

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
        const paymentMethod = await createPaymentMethod({
          billingDetails: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        });
        console.log('Payment method created:', paymentMethod);

        const result = await confirmPayment(paymentMethod.id);
        console.log('Payment confirmed:', result);
      } catch (error: any) {
        errorMessage.value = error.message || 'Payment failed';
      } finally {
        isProcessing.value = false;
      }
    };

    doPayment();
  });

  const handleReady = $(() => {
    console.log('PayConductor is ready');
  });

  const handleError = $((error: Error) => {
    console.error('Error:', error);
  });

  const handlePaymentComplete = $((result: any) => {
    console.log('Payment completed:', result);
    alert('Payment successful!');
  });

  return (
    <>
      <h1>PayConductor Checkout</h1>
      
      <PayConductor
        clientId="client_123"
        token="order_abc123"
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
        <form onSubmit$={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="John Doe"
              style={{ width: '100%', padding: '12px', border: '1px solid #e6ebf1', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input 
              type="email" 
              placeholder="john@example.com"
              style={{ width: '100%', padding: '12px', border: '1px solid #e6ebf1', borderRadius: '4px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!isReady || isProcessing.value}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isReady ? '#0066ff' : '#cfd7df',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: isReady ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            {isProcessing.value ? 'Processing...' : 'Pay'}
          </button>

          {errorMessage.value && (
            <div style={{ color: '#fa755a', marginTop: '16px' }}>
              {errorMessage.value}
            </div>
          )}

          {frameError && (
            <div style={{ color: '#fa755a', marginTop: '16px' }}>
              Frame error: {frameError}
            </div>
          )}
        </form>
      </PayConductor>
    </>
  );
});

export const head: DocumentHead = {
  title: 'PayConductor Checkout'
};
