# PayConductor SDK Web

A unified payment SDK that provides seamless integration with PayConductor's payment iframe across multiple JavaScript frameworks.

![NPM Version RSC](https://img.shields.io/npm/v/%40payconductor-sdk-web%2Flibrary-rsc)
![NPM Version React](https://img.shields.io/npm/v/%40payconductor-sdk-web%2Flibrary-react)

## Features

- **Multi-Framework Support** - Works with React, Vue, Svelte, Qwik, Angular, and Web Components
- **TypeScript First** - Full type definitions included
- **Secure Communication** - Built-in postMessage-based communication with payment iframe
- **Customizable Theming** - Flexible theme configuration to match your brand
- **Flexible Checkout Layout** - Developer controls where the iframe is rendered via `<PayConductorCheckoutElement>`
- **Payment Method Selection** - Detect which payment method the user chose before confirming
- **Lightweight** - Minimal bundle footprint

## Installation

```bash
npm install @payconductor-sdk-web/library-react
# or
yarn add @payconductor-sdk-web/library-react
# or
pnpm add @payconductor-sdk-web/library-react
# or
bun add @payconductor-sdk-web/library-react
```

## Quick Start

### React

```tsx
import {
  PayConductor,
  PayConductorCheckoutElement,
  usePayConductor,
  usePayconductorElement,
  type PaymentMethod,
  type PaymentResult,
} from '@payconductor-sdk-web/library-react';
import {
  AvailablePaymentMethods,
  Configuration,
  DocumentType,
  OrderApi,
  type OrderCreateRequest,
} from 'payconductor-sdk';

const sdkConfig = new Configuration({
  username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || 'your_client_id',
  password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || 'your_client_secret',
});
const orderApi = new OrderApi(sdkConfig);

function CheckoutForm() {
  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  const handleFinalize = async () => {
    // 1. Create the Draft order via payconductor-sdk to get the orderId
    const orderRequest: OrderCreateRequest = {
      chargeAmount: 100.00,
      clientIp: '0.0.0.0',
      customer: {
        documentNumber: '12345678900',
        documentType: DocumentType.Cpf,
        email: 'customer@example.com',
        name: 'Customer Name',
      },
      discountAmount: 0,
      externalId: `order-${Date.now()}`,
      payment: {
        paymentMethod: 'Draft',
        availablePaymentMethods: [
          AvailablePaymentMethods.CreditCard,
          AvailablePaymentMethods.Pix,
          AvailablePaymentMethods.BankSlip,
        ],
      },
      shippingFee: 0,
      taxFee: 0,
    };
    const { data } = await orderApi.orderCreate(orderRequest);

    // 2. Confirm payment with the obtained orderId
    const result: PaymentResult = await confirmPayment({ orderId: data.id });
    console.log(result);
  };

  return (
    <div>
      <PayConductorCheckoutElement height="600px" />
      <button onClick={handleFinalize} disabled={!isReady}>
        Checkout
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}

function App() {
  return (
    <PayConductor
      publicKey="pk_test_123"
      locale="pt-BR"
      debug={true}
      theme={{ primaryColor: '#0066ff' }}
      onReady={() => console.log('Ready')}
      onPaymentComplete={(result) => console.log(result)}
      onPaymentMethodSelected={(method: PaymentMethod) => console.log(method)}
    >
      <CheckoutForm />
    </PayConductor>
  );
}
```

### Vue

```vue
<template>
  <PayConductor
    public-key="pk_test_123"
    locale="pt-BR"
    :theme="{ primaryColor: '#0066ff' }"
    @payment-complete="onPaymentComplete"
    @payment-method-selected="onPaymentMethodSelected"
  >
    <PayConductorCheckoutElement height="600px" />
    <button @click="handleFinalize" :disabled="!isReady">
      Checkout
    </button>
  </PayConductor>
</template>

<script setup>
import { PayConductor, PayConductorCheckoutElement, usePayConductor, usePayconductorElement } from '@payconductor-sdk-web/library-vue';
import { AvailablePaymentMethods, Configuration, DocumentType, OrderApi } from 'payconductor-sdk';

const { isReady } = usePayConductor();
const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

const sdkConfig = new Configuration({
  username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || 'your_client_id',
  password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || 'your_client_secret',
});
const orderApi = new OrderApi(sdkConfig);

const handleFinalize = async () => {
  // 1. Create the Draft order via payconductor-sdk to get the orderId
  const { data } = await orderApi.orderCreate({
    chargeAmount: 100.00,
    clientIp: '0.0.0.0',
    customer: {
      documentNumber: '12345678900',
      documentType: DocumentType.Cpf,
      email: 'customer@example.com',
      name: 'Customer Name',
    },
    discountAmount: 0,
    externalId: `order-${Date.now()}`,
    payment: {
      paymentMethod: 'Draft',
      availablePaymentMethods: [
        AvailablePaymentMethods.CreditCard,
        AvailablePaymentMethods.Pix,
        AvailablePaymentMethods.BankSlip,
      ],
    },
    shippingFee: 0,
    taxFee: 0,
  });

  // 2. Confirm payment with the obtained orderId
  await confirmPayment({ orderId: data.id });
};

const onPaymentComplete = (result) => console.log(result);
const onPaymentMethodSelected = (method) => console.log(method);
</script>
```

### Svelte

```svelte
<script>
  import {
    PayConductor,
    PayConductorCheckoutElement,
    usePayConductor,
    usePayconductorElement,
  } from '@payconductor-sdk-web/library-svelte';
  import { AvailablePaymentMethods, Configuration, DocumentType, OrderApi } from 'payconductor-sdk';

  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  const sdkConfig = new Configuration({
    username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || 'your_client_id',
    password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || 'your_client_secret',
  });
  const orderApi = new OrderApi(sdkConfig);

  async function handleFinalize() {
    const { data } = await orderApi.orderCreate({
      chargeAmount: 100.00,
      clientIp: '0.0.0.0',
      customer: {
        documentNumber: '12345678900',
        documentType: DocumentType.Cpf,
        email: 'customer@example.com',
        name: 'Customer Name',
      },
      discountAmount: 0,
      externalId: `order-${Date.now()}`,
      payment: {
        paymentMethod: 'Draft',
        availablePaymentMethods: [
          AvailablePaymentMethods.CreditCard,
          AvailablePaymentMethods.Pix,
          AvailablePaymentMethods.BankSlip,
        ],
      },
      shippingFee: 0,
      taxFee: 0,
    });
    const result = await confirmPayment({ orderId: data.id });
    console.log(result);
  }
</script>

<PayConductor
  publicKey="pk_test_123"
  locale="pt-BR"
  debug={true}
  theme={{ primaryColor: '#0066ff' }}
  onPaymentComplete={(result) => console.log(result)}
  onPaymentMethodSelected={(method) => console.log(method)}
>
  <PayConductorCheckoutElement height="600px" />
  <button on:click={handleFinalize} disabled={!$isReady}>
    Checkout
  </button>
</PayConductor>
```

## Payment Flow

```
1. Mount <PayConductor publicKey="pk_xxx" ...>
   └─ Registers window.PayConductor, adds message listener
   └─ Stores iframeUrl internally (no iframe rendered yet)

2. Mount <PayConductorCheckoutElement height="600px" />
   └─ Reads iframeUrl from window.PayConductor
   └─ Renders the payment iframe
   └─ iframe loads → fetches payment methods → sends Ready

3. SDK receives Ready → sends config (theme, locale, paymentMethods)

4. User selects payment method
   └─ onPaymentMethodSelected callback fires
   └─ getSelectedPaymentMethod() returns the chosen method

5. User clicks "Confirm" button (your button, outside the iframe)
   └─ Your backend creates a Draft order → returns { id: "ord_xxx" }
   └─ element.confirmPayment({ orderId: "ord_xxx" })
   └─ iframe collects form data → POST /orders/:id/confirm

6. SDK receives PaymentComplete/Failed/Pending → callbacks fire
```

## API Reference

### `<PayConductor />`

Provider component that initializes the payment session. **Does not render the iframe directly** — use `<PayConductorCheckoutElement>` for that.

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your PayConductor public key |
| `theme` | `PayConductorTheme` | Theme customization options |
| `locale` | `string` | Locale (e.g., `'pt-BR'`, `'en-US'`) |
| `paymentMethods` | `PaymentMethod[] \| "all"` | Payment methods to display |
| `defaultPaymentMethod` | `PaymentMethod` | Pre-selected payment method |
| `paymentMethodsConfig` | `PaymentMethodConfig[]` | Per-method config (installments, discounts) |
| `methodsDirection` | `"vertical" \| "horizontal"` | Layout direction of payment methods |
| `showPaymentButtons` | `boolean` | Whether to show native action buttons in iframe |
| `nuPayConfig` | `NuPayData` | Required when NuPay is an available method |
| `debug` | `boolean` | Enable prefixed console.log for key events |
| `onReady` | `() => void` | Called when iframe is ready |
| `onError` | `(error: Error) => void` | Called when an error occurs |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Called when payment succeeds |
| `onPaymentFailed` | `(result: PaymentResult) => void` | Called when payment fails |
| `onPaymentPending` | `(result: PaymentResult) => void` | Called when payment is pending |
| `onPaymentMethodSelected` | `(method: PaymentMethod) => void` | Called when user selects a payment method |

### `<PayConductorCheckoutElement />`

Component that renders the payment iframe. Place it inside `<PayConductor>` wherever you want the iframe to appear in your layout.

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

### `usePayConductor()`

Hook that provides frame state.

```tsx
const { isReady, error } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Whether iframe is ready |
| `error` | `string \| null` | Error message if any |

### `usePayconductorElement()`

Hook that provides payment actions.

```tsx
const {
  init,
  confirmPayment,
  validate,
  reset,
  getSelectedPaymentMethod,
  updateConfig,
  updateorderId,
  update,
  submit,
} = usePayconductorElement();
```

| Method | Signature | Description                                 |
|--------|-----------|---------------------------------------------|
| `init` | `(config: PayConductorConfig) => Promise<void>` | Sends full config to iframe                 |
| `confirmPayment` | `(options: { orderId: string }) => Promise<PaymentResult>` | Triggers payment confirmation in iframe     |
| `validate` | `(data: unknown) => Promise<boolean>` | Validates current form data                 |
| `reset` | `() => Promise<void>` | Resets the payment form                     |
| `getSelectedPaymentMethod` | `() => PaymentMethod \| null` | Returns the payment method selected by user |
| `updateConfig` | `(config: Partial<PayConductorConfig>) => void` | Updates theme, locale, or paymentMethods    |
| `updateorderId` | `(orderId: string) => void` | Updates the order id in the iframe          |
| `update` | `(options: UpdateOptions) => void` | Updates billing details                     |
| `submit` | `() => Promise<SubmitResult>` | Submits the form (validate + format)        |

## Payment Types

```typescript
import type {
  PaymentConfirmData,
  PixPaymentData,
  CreditCardPaymentData,
  BankSlipPaymentData,
  NuPayPaymentData,
  PicPayPaymentData,
  CardPaymentData,
} from '@payconductor-sdk-web/library-react';

// Union of all payment data types (passed via confirmPayment)
type PaymentConfirmData =
  | PixPaymentData         // { paymentMethod: 'Pix', expirationInSeconds? }
  | CreditCardPaymentData  // { paymentMethod: 'CreditCard', card, installments, softDescriptor? }
  | BankSlipPaymentData    // { paymentMethod: 'BankSlip', expirationInDays? }
  | NuPayPaymentData       // { paymentMethod: 'NuPay', nuPay: NuPayData }
  | PicPayPaymentData;     // { paymentMethod: 'PicPay' }
```

## Supported Payment Methods

| Method | Enum value |
|--------|-----------|
| Pix | `PaymentMethod.Pix` |
| Credit Card | `PaymentMethod.CreditCard` |
| Debit Card | `PaymentMethod.DebitCard` |
| Bank Slip (Boleto) | `PaymentMethod.BankSlip` |
| NuPay | `PaymentMethod.NuPay` |
| PicPay | `PaymentMethod.PicPay` |
| Apple Pay | `PaymentMethod.ApplePay` |
| Google Pay | `PaymentMethod.GooglePay` |
| Amazon Pay | `PaymentMethod.AmazonPay` |

## Theming

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
| React | `@payconductor-sdk-web/library-react` |
| Vue | `@payconductor-sdk-web/library-vue` |
| Svelte | `@payconductor-sdk-web/library-svelte` |
| Qwik | `@payconductor-sdk-web/library-qwik` |
| Angular | `@payconductor-sdk-web/library-angular` |
| Solid | `@payconductor-sdk-web/library-solid` |
| Preact | `@payconductor-sdk-web/library-preact` |
| Web Components | `@payconductor-sdk-web/library-webcomponent` |
| React (Next.js RSC) | `@payconductor-sdk-web/library-rsc` |

## Development

```bash
# Sync iframe types and constants
bun sync

# Build all packages
bun build

# Run React example
cd examples/react && bun dev
```

## License

MIT
