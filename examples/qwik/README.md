# PayConductor SDK Client JS - Qwik

Qwik components for [PayConductor](https://payconductor.ai).

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-client-js.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-client-js)

## Requirements

The minimum supported version of Qwik is v1.

## Installation

```sh
npm install @payconductor-sdk-client-js
# or
yarn add @payconductor-sdk-client-js
# or
pnpm add @payconductor-sdk-client-js
```

## Quick Start

```tsx
import { component$, useSignal, $, type Qrl } from '@builder.io/qwik';
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
    <PayConductor
      clientId="your_client_id"
      token="your_token"
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
  );
});
```

## API Reference

### PayConductor

The component that initializes the PayConductor iframe.

```tsx
<PayConductor
  clientId="your_client_id"
  token="your_token"
  theme={{ primaryColor: '#0066ff' }}
  locale="en-US"
  height="500px"
  onReady$={() => {}}
  onError$={(error) => {}}
  onPaymentComplete$={(result) => {}}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `clientId` | `string` | Your PayConductor client ID |
| `token` | `string` | Your PayConductor token/order token |
| `theme` | `object` | Custom theme options |
| `locale` | `string` | Locale for the payment form (e.g., 'en-US', 'pt-BR') |
| `height` | `string` | Height of the iframe (default: '500px') |
| `onReady$` | `QRL` | Called when the iframe is ready |
| `onError$` | `QRL` | Called when an error occurs |
| `onPaymentComplete$` | `QRL` | Called when payment is complete |

### usePayment

Hook that provides payment methods.

```tsx
const { createPaymentMethod, confirmPayment, validate, reset } = usePayment();
```

#### Returns

| Method | Description |
|--------|-------------|
| `createPaymentMethod(options)` | Creates a new payment method |
| `confirmPayment(paymentMethodId)` | Confirms the payment |
| `validate(data)` | Validates payment data |
| `reset()` | Resets the payment form |

### useFrame

Hook that provides frame state.

```tsx
const { iframe, isReady, error } = useFrame();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `iframe` | `HTMLIFrameElement` | Reference to the iframe element |
| `isReady` | `Signal<boolean>` | Whether the frame is ready |
| `error` | `Signal<string | null>` | Error message if any |

## TypeScript Support

PayConductor SDK Client JS is packaged with TypeScript declarations.

```ts
import { PaymentResult, PaymentMethod } from '@payconductor-sdk-client-js/library-qwik';
```
