# PayConductor SDK Client JS - Svelte

Svelte components for [PayConductor](https://payconductor.ai).

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-client-js.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-client-js)

## Requirements

The minimum supported version of Svelte is v4.

## Installation

```sh
npm install @payconductor-sdk-client-js
# or
yarn add @payconductor-sdk-client-js
# or
pnpm add @payconductor-sdk-client-js
```

## Quick Start

```svelte
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
```

## API Reference

### PayConductor

The component that initializes the PayConductor iframe.

```svelte
<PayConductor
  clientId="your_client_id"
  token="your_token"
  theme={{ primaryColor: '#0066ff' }}
  locale="en-US"
  height="500px"
  onReady={() => {}}
  onError={(error) => {}}
  onPaymentComplete={(result) => {}}
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
| `onReady` | `function` | Called when the iframe is ready |
| `onError` | `function` | Called when an error occurs |
| `onPaymentComplete` | `function` | Called when payment is complete |

### usePayment

Svelte store that provides payment methods.

```svelte
<script>
  const { createPaymentMethod, confirmPayment, validate, reset } = usePayment();
</script>
```

#### Returns

| Method | Description |
|--------|-------------|
| `createPaymentMethod(options)` | Creates a new payment method |
| `confirmPayment(paymentMethodId)` | Confirms the payment |
| `validate(data)` | Validates payment data |
| `reset()` | Resets the payment form |

### useFrame

Svelte store that provides frame state.

```svelte
<script>
  const { iframe, isReady, error } = useFrame();
</script>
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `iframe` | `HTMLIFrameElement` | Reference to the iframe element |
| `isReady` | `boolean` | Whether the frame is ready (Svelte store) |
| `error` | `string | null` | Error message if any (Svelte store) |

## TypeScript Support

PayConductor SDK Client JS is packaged with TypeScript declarations.

```ts
import { PaymentResult, PaymentMethod } from '@payconductor-sdk-client-js/library-svelte';
```
