import React, { useState } from 'react';
import { 
  PayConductor, 
  usePayment, 
  useFrame,
  PaymentResult,
  PaymentMethod
} from '@payconductor-sdk-client-js/library-react';

function CheckoutForm() {
  const { isReady, error: frameError } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if (!isReady) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const paymentMethod: PaymentMethod = await createPaymentMethod({
        billingDetails: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });
      console.log('Payment method created:', paymentMethod);

      const result: PaymentResult = await confirmPayment(paymentMethod.id);
      console.log('Payment confirmed:', result);
    } catch (error: any) {
      setErrorMessage(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Full Name
        </label>
        <input 
          type="text" 
          placeholder="John Doe"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '1px solid #e6ebf1',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Email
        </label>
        <input 
          type="email" 
          placeholder="john@example.com"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '1px solid #e6ebf1',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={!isReady || isProcessing}
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
        {isProcessing ? 'Processing...' : 'Pay'}
      </button>

      {errorMessage && (
        <div style={{ color: '#fa755a', marginTop: '16px' }}>
          {errorMessage}
        </div>
      )}

      {frameError && (
        <div style={{ color: '#fa755a', marginTop: '16px' }}>
          Frame error: {frameError}
        </div>
      )}
    </form>
  );
}

export default function App() {
  const handleReady = () => {
    console.log('PayConductor is ready');
  };

  const handleError = (error: Error) => {
    console.error('Error:', error);
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    console.log('Payment completed:', result);
    alert('Payment successful!');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
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
        <CheckoutForm />
      </PayConductor>
    </div>
  );
}
