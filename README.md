# PayConductor SDK Client JS

A unified payment SDK that provides seamless integration with PayConductor's payment iframe across multiple JavaScript frameworks.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-client-js.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-client-js)

## Features

- **Multi-Framework Support** - Works with React, Vue, Svelte, Qwik, Angular, and Web Components
- **TypeScript First** - Full type definitions included
- **Secure Communication** - Built-in postMessage-based communication with payment iframe
- **Customizable Theming** - Flexible theme configuration to match your brand
- **Lightweight** - Minimal bundle footprint

## Installation

```bash
npm install @payconductor-sdk-client-js
# or
yarn add @payconductor-sdk-client-js
# or
pnpm add @payconductor-sdk-client-js
# or
bun add @payconductor-sdk-client-js
```

## Quick Start

### React

```tsx
import { PayConductor, usePayment, useFrame } from '@payconductor-sdk-client-js/library-react';

function Checkout() {
  const { isReady } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  const handlePay = async () => {
    const { id } = await createPaymentMethod({ billingDetails: { name: 'John Doe' } });
    await confirmPayment(id);
  };

  return (
    <PayConductor
      clientId="client_123"
      token="ord_abc123token"
      theme={{ primaryColor: '#0066ff' }}
      onReady={() => console.log('Ready')}
      onPaymentComplete={(result) => console.log(result)}
    >
      <button onClick={handlePay} disabled={!isReady}>Pay</button>
    </PayConductor>
  );
}
```

### Vue

```vue
<template>
  <PayConductor
    client-id="client_123"
    token="ord_abc123token"
    :theme="{ primaryColor: '#0066ff' }"
    @payment-complete="onPaymentComplete"
  >
    <button @click="handlePay" :disabled="!isReady">Pay</button>
  </PayConductor>
</template>

<script setup>
import { PayConductor, usePayment, useFrame } from '@payconductor-sdk-client-js/library-vue';

const { isReady } = useFrame();
const { createPaymentMethod, confirmPayment } = usePayment();

const handlePay = async () => {
  const { id } = await createPaymentMethod({ billingDetails: { name: 'John Doe' } });
  await confirmPayment(id);
};

const onPaymentComplete = (result) => console.log(result);
</script>
```

### Svelte

```svelte
<script>
  import { PayConductor, usePayment, useFrame } from '@payconductor-sdk-client-js/library-svelte';

  const { isReady } = useFrame();
  const { createPaymentMethod, confirmPayment } = usePayment();

  const handlePay = async () => {
    const { id } = await createPaymentMethod({ billingDetails: { name: 'John Doe' } });
    await confirmPayment(id);
  };
</script>

<PayConductor
  clientId="client_123"
  token="ord_abc123token"
  theme={{ primaryColor: '#0066ff' }}
  onPaymentComplete={(result) => console.log(result)}
>
  <button on:click={handlePay} disabled={!$isReady}>Pay</button>
</PayConductor>
```

## API Reference

### PayConductor

Main component that initializes the payment iframe.

| Prop | Type | Description |
|------|------|-------------|
| `clientId` | `string` | Your PayConductor client ID |
| `token` | `string` | Order token |
| `theme` | `object` | Theme customization options |
| `locale` | `string` | Locale (e.g., 'en-US', 'pt-BR') |
| `height` | `string` | Iframe height (default: '500px') |
| `onReady` | `function` | Called when iframe is ready |
| `onError` | `function` | Called when an error occurs |
| `onPaymentComplete` | `function` | Called when payment is completed |

### usePayment

Hook that provides payment methods.

```tsx
const { createPaymentMethod, confirmPayment, validate, reset } = usePayment();
```

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

| Property | Type | Description |
|----------|------|-------------|
| `iframe` | `HTMLIFrameElement` | Reference to iframe element |
| `isReady` | `boolean` | Whether frame is ready |
| `error` | `string \| null` | Error message if any |

## Theming

Customize the SDK appearance with the theme prop:

```javascript
const theme = {
  primaryColor: '#0066ff',
  secondaryColor: '#5a6b7c',
  backgroundColor: '#ffffff',
  errorColor: '#fa755a',
  successColor: '#28a745',
  fontFamily: 'Roboto, sans-serif',
  borderRadius: '8px',
  inputBackground: '#ffffff',
  inputBorderColor: '#e6ebf1',
  buttonHeight: '44px',
  buttonPadding: '16px'
};
```

## Supported Frameworks

| Framework | Package |
|-----------|---------|
| React | `@payconductor-sdk-client-js/library-react` |
| Vue | `@payconductor-sdk-client-js/library-vue` |
| Svelte | `@payconductor-sdk-client-js/library-svelte` |
| Qwik | `@payconductor-sdk-client-js/library-qwik` |
| Angular | `@payconductor-sdk-client-js/library-angular` |
| Web Components | `@payconductor-sdk-client-js/library-custom-element` |

## License

MIT
