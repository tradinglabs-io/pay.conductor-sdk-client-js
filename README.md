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
import { PayConductor, useElement, usePayConductor, type PaymentResult } from '@payconductor-sdk-client-js/library-react';
import { useState, useEffect } from 'react';

function Checkout() {
  const { isReady, error } = usePayConductor();
  const { submit, confirmPayment, update } = useElement();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    update({ billingDetails: { name: clientName, email: clientEmail } });
  }, [clientName, clientEmail, update]);

  const handlePay = async () => {
    const { error: submitError } = await submit();
    if (submitError) {
      console.error(submitError.message);
      return;
    }
    const result: PaymentResult = await confirmPayment({
      intentToken: 'pi_xxx_intent_token_xxx',
      returnUrl: window.location.href,
    });
    console.log(result);
  };

  return (
    <PayConductor
      publicKey="pk_test_123"
      intentToken="pi_test_abc123"
      theme={{ primaryColor: '#0066ff' }}
      locale="pt-BR"
      onReady={() => console.log('Ready')}
      onPaymentComplete={(result) => console.log(result)}
    >
      <input placeholder="Name" value={clientName} onInput={(e) => setClientName(e.currentTarget.value)} />
      <input placeholder="Email" value={clientEmail} onInput={(e) => setClientEmail(e.currentTarget.value)} />
      <button onClick={handlePay} disabled={!isReady}>Pay</button>
    </PayConductor>
  );
}
```

### Vue

```vue
<template>
  <PayConductor
    public-key="pk_test_123"
    intent-token="pi_test_abc123"
    :theme="{ primaryColor: '#0066ff' }"
    locale="pt-BR"
    @payment-complete="onPaymentComplete"
  >
    <input v-model="clientName" placeholder="Name" />
    <input v-model="clientEmail" placeholder="Email" />
    <button @click="handlePay" :disabled="!isReady">Pay</button>
  </PayConductor>
</template>

<script setup>
import { ref, watch } from 'vue';
import { PayConductor, useElement, usePayConductor } from '@payconductor-sdk-client-js/library-vue';

const { isReady } = usePayConductor();
const { submit, confirmPayment, update } = useElement();
const clientName = ref('');
const clientEmail = ref('');

watch([clientName, clientEmail], () => {
  update({ billingDetails: { name: clientName.value, email: clientEmail.value } });
});

const handlePay = async () => {
  const { error: submitError } = await submit();
  if (submitError) return;
  const result = await confirmPayment({ intentToken: 'pi_xxx_intent_token_xxx', returnUrl: window.location.href });
  console.log(result);
};

const onPaymentComplete = (result) => console.log(result);
</script>
```

### Svelte

```svelte
<script>
  import { PayConductor, useElement, usePayConductor } from '@payconductor-sdk-client-js/library-svelte';

  const { isReady, error } = usePayConductor();
  const { submit, confirmPayment, update } = useElement();

  let clientName = '';
  let clientEmail = '';

  $: update({ billingDetails: { name: clientName, email: clientEmail } });

  const handlePay = async () => {
    const { error: submitError } = await submit();
    if (submitError) return;
    const result = await confirmPayment({ intentToken: 'pi_xxx_intent_token_xxx', returnUrl: window.location.href });
    console.log(result);
  };
</script>

<PayConductor
  publicKey="pk_test_123"
  intentToken="pi_test_abc123"
  theme={{ primaryColor: '#0066ff' }}
  locale="pt-BR"
  onPaymentComplete={(result) => console.log(result)}
>
  <input bind:value={clientName} placeholder="Name" />
  <input bind:value={clientEmail} placeholder="Email" />
  <button on:click={handlePay} disabled={!$isReady}>Pay</button>
</PayConductor>
```

## API Reference

### PayConductor

Main component that initializes the payment iframe.

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your PayConductor public key |
| `intentToken` | `string` | Payment intent token |
| `theme` | `PayConductorTheme` | Theme customization options |
| `locale` | `string` | Locale (e.g., 'en-US', 'pt-BR') |
| `height` | `string` | Iframe height (default: '500px') |
| `onReady` | `function` | Called when iframe is ready |
| `onError` | `function` | Called when an error occurs |
| `onPaymentComplete` | `function` | Called when payment is completed |

### usePayConductor

Hook that provides frame state and config.

```tsx
const { isReady, error, publicKey, intentToken, theme, locale } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Whether frame is ready |
| `error` | `string \| null` | Error message if any |
| `publicKey` | `string` | Public key from config |
| `intentToken` | `string` | Intent token from config |
| `theme` | `PayConductorTheme` | Theme from config |
| `locale` | `string` | Locale from config |

### useElement

Hook that provides payment methods.

```tsx
const { submit, confirmPayment, update, validate, reset, getSelectedPaymentMethod, updateConfig, updateIntentToken } = useElement();
```

| Method | Description |
|--------|-------------|
| `submit()` | Submits the payment form, returns `{ error?, paymentMethod? }` |
| `confirmPayment(options)` | Confirms the payment with `{ intentToken, returnUrl? }` |
| `update(options)` | Updates billing details `{ billingDetails?: { name, email, phone, address } }` |
| `validate(data)` | Validates payment data |
| `reset()` | Resets the payment form |
| `getSelectedPaymentMethod()` | Returns the selected payment method |
| `updateConfig(config)` | Updates theme, locale, or paymentMethods config |
| `updateIntentToken(token)` | Updates the intent token |

## Theming

Customize the SDK appearance with the theme prop:

```javascript
const theme = {
  primaryColor: '#0066ff',
  secondaryColor: '#5a6b7c',
  backgroundColor: 'transparent',
  surfaceColor: '#f8fafc',
  textColor: '#0f172a',
  textSecondaryColor: '#64748b',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  warningColor: '#f59e0b',
  borderColor: '#e2e8f0',
  disabledColor: '#cbd5e1',
  fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' },
  fontWeight: { normal: 400, medium: 500, bold: 600 },
  lineHeight: '1.5',
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  borderRadius: '8px',
  borderWidth: '1px',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  inputBackground: '#ffffff',
  inputBorderColor: '#cbd5e1',
  inputBorderRadius: '8px',
  inputHeight: '44px',
  inputPadding: '12px 16px',
  buttonHeight: '48px',
  buttonPadding: '16px 24px',
  buttonBorderRadius: '8px',
  transitionDuration: '0.2s',
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
