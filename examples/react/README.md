# PayConductor SDK Client JS - React

React components for [PayConductor](https://payconductor.ai).

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-client-js.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-client-js)

## Requirements

The minimum supported version of React is v16.8.

## Installation

```sh
npm install @payconductor-sdk-client-js
# or
yarn add @payconductor-sdk-client-js
# or
pnpm add @payconductor-sdk-client-js
```

## Quick Start

```jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  PayConductor,
  usePayment,
  useFrame,
} from '@payconductor-sdk-client-js/library-react';

const CheckoutForm = () => {
  const { isReady, error: frameError } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isReady) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const paymentMethod = await createPaymentMethod({
        billingDetails: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });

      const result = await confirmPayment(paymentMethod.id);
      console.log('Payment confirmed:', result);
    } catch (error) {
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
};

const App = () => (
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
    onReady={() => console.log('PayConductor is ready')}
    onError={(error) => console.error('Error:', error)}
    onPaymentComplete={(result) => console.log('Payment complete:', result)}
  >
    <CheckoutForm />
  </PayConductor>
);

ReactDOM.render(<App />, document.body);
```

## API Reference

### PayConductor

The provider component that wraps your application and initializes the PayConductor iframe.

```jsx
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

Hook that provides payment methods.

```jsx
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

```jsx
const { iframe, isReady, error } = useFrame();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `iframe` | `HTMLIFrameElement` | Reference to the iframe element |
| `isReady` | `boolean` | Whether the frame is ready |
| `error` | `string | null` | Error message if any |

## TypeScript Support

PayConductor SDK Client JS is packaged with TypeScript declarations.

```ts
import { PaymentResult, PaymentMethod } from '@payconductor-sdk-client-js/library-react';
```

## Quick Start

```jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  PayConductor,
  usePayment,
  useFrame,
} from '@pay.conductor/sdk-client-js';

const CheckoutForm = () => {
  const { isReady, error: frameError } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isReady) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const paymentMethod = await createPaymentMethod({
        billingDetails: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });

      const result = await confirmPayment(paymentMethod.id);
      console.log('Payment confirmed:', result);
    } catch (error) {
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
};

const App = () => (
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
    onReady={() => console.log('PayConductor is ready')}
    onError={(error) => console.error('Error:', error)}
    onPaymentComplete={(result) => console.log('Payment complete:', result)}
  >
    <CheckoutForm />
  </PayConductor>
);

ReactDOM.render(<App />, document.body);
```

## API Reference

### PayConductor

The provider component that wraps your application and initializes the PayConductor iframe.

```jsx
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

Hook that provides payment methods.

```jsx
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

```jsx
const { iframe, isReady, error } = useFrame();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `iframe` | `HTMLIFrameElement` | Reference to the iframe element |
| `isReady` | `boolean` | Whether the frame is ready |
| `error` | `string | null` | Error message if any |

## TypeScript Support

PayConductor SDK Client JS is packaged with TypeScript declarations.

```ts
import { PaymentResult, PaymentMethod } from '@pay.conductor/sdk-client-js';
```
