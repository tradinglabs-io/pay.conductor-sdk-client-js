# @payconductor-sdk-web/library-vue

Vue SDK for [PayConductor](https://payconductor.ai) payment integration.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-vue.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-vue)

## Requirements

Minimum Vue version: **v3**.

## Installation

```bash
npm install @payconductor-sdk-web/library-vue payconductor-sdk
# or
yarn add @payconductor-sdk-web/library-vue payconductor-sdk
# or
pnpm add @payconductor-sdk-web/library-vue payconductor-sdk
# or
bun add @payconductor-sdk-web/library-vue payconductor-sdk
```

## Quick Start

```vue
<template>
  <PayConductor
    publicKey="pk_test_123"
    locale="pt-BR"
    :debug="true"
    :theme="theme"
    @ready="onReady"
    @error="onError"
    @payment-complete="onPaymentComplete"
    @payment-method-selected="onPaymentMethodSelected"
  >
    <!-- The iframe is rendered here -->
    <PayConductorCheckoutElement height="600px" />

    <p v-if="selectedMethod">
      Selected method: <strong>{{ selectedMethod }}</strong>
    </p>

    <button type="button" :disabled="!isReady || isProcessing" @click="handleFinalize">
      {{ isProcessing ? 'Processing...' : 'Checkout' }}
    </button>

    <div v-if="errorMessage">{{ errorMessage }}</div>
  </PayConductor>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  PayConductor,
  PayConductorCheckoutElement,
  usePayConductor,
  usePayconductorElement,
  type PaymentMethod,
  type PaymentResult,
} from '@payconductor-sdk-web/library-vue';
import {
  AvailablePaymentMethods,
  Configuration,
  DocumentType,
  OrderApi,
  type OrderCreateRequest,
} from 'payconductor-sdk';

const { isReady } = usePayConductor();
const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

const sdkConfig = new Configuration({
  username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || 'your_client_id',
  password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || 'your_client_secret',
});
const orderApi = new OrderApi(sdkConfig);

const theme = { primaryColor: '#0066ff', borderRadius: '8px' };
const errorMessage = ref<string | null>(null);
const isProcessing = ref(false);
const selectedMethod = ref<PaymentMethod | null>(null);

const handleFinalize = async () => {
  if (!isReady.value) return;
  isProcessing.value = true;
  errorMessage.value = null;

  try {
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
    if (result.status === 'succeeded') alert('Payment successful!');
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Payment failed';
  } finally {
    isProcessing.value = false;
  }
};

const onReady = () => console.log('Ready');
const onError = (err: Error) => console.error('Error:', err);
const onPaymentComplete = (result: PaymentResult) => console.log('Complete:', result);
const onPaymentMethodSelected = (method: PaymentMethod) => {
  console.log('Method:', method);
  selectedMethod.value = method;
};
</script>
```

## API Reference

### `<PayConductor />`

Provider component that initializes the payment session. **Does not render the iframe directly** — use `<PayConductorCheckoutElement>` for that.

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your PayConductor public key |
| `theme` | `PayConductorTheme` | Theme customization options |
| `locale` | `string` | Locale (e.g. `'pt-BR'`, `'en-US'`) |
| `paymentMethods` | `PaymentMethod[] \| "all"` | Available payment methods |
| `defaultPaymentMethod` | `PaymentMethod` | Pre-selected payment method |
| `paymentMethodsConfig` | `PaymentMethodConfig[]` | Per-method config (installments, discounts) |
| `methodsDirection` | `"vertical" \| "horizontal"` | Layout direction of payment methods |
| `showPaymentButtons` | `boolean` | Show native action buttons inside the iframe |
| `nuPayConfig` | `NuPayData` | Required when NuPay is an available method |
| `debug` | `boolean` | Enable prefixed console.log for key events |
| `@ready` | `() => void` | Called when the iframe is ready |
| `@error` | `(error: Error) => void` | Called when an error occurs |
| `@payment-complete` | `(result: PaymentResult) => void` | Called when payment succeeds |
| `@payment-failed` | `(result: PaymentResult) => void` | Called when payment fails |
| `@payment-pending` | `(result: PaymentResult) => void` | Called when payment is pending |
| `@payment-method-selected` | `(method: PaymentMethod) => void` | Called when user selects a payment method |

### `<PayConductorCheckoutElement />`

Renders the payment iframe. Place it inside `<PayConductor>`.

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

### `usePayConductor()`

Hook that provides reactive frame state.

```ts
const { isReady, error } = usePayConductor();
// isReady and error are Ref<T>
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `Ref<boolean>` | Whether the iframe is ready |
| `error` | `Ref<string \| null>` | Error message, if any |

### `usePayconductorElement()`

Hook that provides payment action methods.

```ts
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

| Method | Signature | Description |
|--------|-----------|-------------|
| `init` | `(config: PayConductorConfig) => Promise<void>` | Sends full config to the iframe |
| `confirmPayment` | `({ orderId: string }) => Promise<PaymentResult>` | Triggers payment confirmation in iframe |
| `validate` | `(data: unknown) => Promise<boolean>` | Validates current form data |
| `reset` | `() => Promise<void>` | Resets the payment form |
| `getSelectedPaymentMethod` | `() => PaymentMethod \| null` | Returns the payment method selected by user |
| `updateConfig` | `(config: Partial<PayConductorConfig>) => void` | Updates theme, locale, or paymentMethods |
| `updateorderId` | `(orderId: string) => void` | Updates the order id in the iframe |
| `update` | `(options: UpdateOptions) => void` | Updates billing details |
| `submit` | `() => Promise<SubmitResult>` | Submits the form (validate + format) |

## TypeScript

```ts
import type {
  PaymentResult,
  PaymentMethod,
  PayConductorTheme,
  PayConductorConfig,
  PaymentConfirmData,
} from '@payconductor-sdk-web/library-vue';
```

## License

MIT
