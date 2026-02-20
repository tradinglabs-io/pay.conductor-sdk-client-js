# PayConductor SDK Web - Svelte Example

Example integration of [PayConductor](https://payconductor.ai) with Svelte.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-svelte.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-svelte)

## Requirements

Minimum Svelte version: **v4**.

## Installation

```sh
npm install @payconductor-sdk-web/library-svelte payconductor-sdk
# or
yarn add @payconductor-sdk-web/library-svelte payconductor-sdk
# or
pnpm add @payconductor-sdk-web/library-svelte payconductor-sdk
# or
bun add @payconductor-sdk-web/library-svelte payconductor-sdk
```

## Run the example

```sh
bun install
bun dev
```

## Quick Start

```svelte
<script lang="ts">
  import {
    PayConductor,
    PayConductorCheckoutElement,
    usePayConductor,
    usePayconductorElement,
    type PaymentMethod,
    type PaymentResult,
  } from '@payconductor-sdk-web/library-svelte';
  import {
    AvailablePaymentMethods,
    Configuration,
    DocumentType,
    OrderApi,
    type OrderCreateRequest,
  } from 'payconductor-sdk';

  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  const sdkConfig = new Configuration({
    username: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_ID || 'your_client_id',
    password: import.meta.env.VITE_PAYCONDUCTOR_CLIENT_SECRET || 'your_client_secret',
  });
  const orderApi = new OrderApi(sdkConfig);

  let errorMessage: string | null = null;
  let isProcessing = false;

  $: selectedMethod = getSelectedPaymentMethod();

  async function handleFinalize() {
    if (!$isReady) return;

    isProcessing = true;
    errorMessage = null;

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
      console.log('Result:', result);

      if (result.status === 'succeeded') {
        alert('Payment successful!');
      }
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : 'Payment failed';
    } finally {
      isProcessing = false;
    }
  }
</script>

<PayConductor
  publicKey="pk_test_123"
  locale="pt-BR"
  debug={true}
  theme={{ primaryColor: '#0066ff', borderRadius: '8px' }}
  onReady={() => console.log('Ready')}
  onPaymentComplete={(result) => console.log('Complete:', result)}
  onPaymentMethodSelected={(method) => console.log('Method:', method)}
>
  <!-- The iframe is rendered here -->
  <PayConductorCheckoutElement height="600px" />

  {#if selectedMethod}
    <p>Selected method: <strong>{selectedMethod}</strong></p>
  {/if}

  <button
    type="button"
    disabled={!$isReady || isProcessing}
    on:click={handleFinalize}
  >
    {isProcessing ? 'Processing...' : 'Checkout'}
  </button>

  {#if errorMessage}
    <div style="color: #fa755a">{errorMessage}</div>
  {/if}

  {#if $error}
    <div style="color: #fa755a">Error: {$error}</div>
  {/if}
</PayConductor>
```

## API Reference

### `<PayConductor />`

Provider component that initializes the payment session. **Does not render the iframe directly** — use `<PayConductorCheckoutElement>` for that.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your PayConductor public key |
| `theme` | `PayConductorTheme` | Theme options |
| `locale` | `string` | Locale (e.g. `'pt-BR'`, `'en-US'`) |
| `paymentMethods` | `PaymentMethod[] \| "all"` | Available payment methods |
| `defaultPaymentMethod` | `PaymentMethod` | Pre-selected payment method |
| `paymentMethodsConfig` | `PaymentMethodConfig[]` | Per-method config (installments, discounts) |
| `methodsDirection` | `"vertical" \| "horizontal"` | Payment method layout direction |
| `showPaymentButtons` | `boolean` | Show action buttons inside the iframe |
| `nuPayConfig` | `NuPayData` | Required when NuPay is available |
| `debug` | `boolean` | Enable detailed console logs |
| `onReady` | `() => void` | Called when the iframe is ready |
| `onError` | `(error: Error) => void` | Called on error |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Called when payment succeeds |
| `onPaymentFailed` | `(result: PaymentResult) => void` | Called when payment fails |
| `onPaymentPending` | `(result: PaymentResult) => void` | Called when payment is pending |
| `onPaymentMethodSelected` | `(method: PaymentMethod) => void` | Called when the user selects a method |

### `<PayConductorCheckoutElement />`

Component that renders the payment iframe. Place it inside `<PayConductor>` wherever you want the iframe to appear.

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

### `usePayConductor()`

Store that provides frame state.

```svelte
<script>
  const { isReady, error } = usePayConductor();
  // $isReady, $error are Svelte stores
</script>
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `Readable<boolean>` | Whether the iframe is ready (Svelte store) |
| `error` | `Readable<string \| null>` | Error message (Svelte store) |

### `usePayconductorElement()`

Provides payment action methods.

```svelte
<script>
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
</script>
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `init` | `(config: PayConductorConfig) => Promise<void>` | Sends full config to the iframe |
| `confirmPayment` | `({ orderId: string }) => Promise<PaymentResult>` | Confirms payment in the iframe |
| `validate` | `(data: unknown) => Promise<boolean>` | Validates form data |
| `reset` | `() => Promise<void>` | Resets the payment form |
| `getSelectedPaymentMethod` | `() => PaymentMethod \| null` | Returns the method selected by the user |
| `updateConfig` | `(config: Partial<PayConductorConfig>) => void` | Updates theme, locale or methods |
| `updateorderId` | `(orderId: string) => void` | Updates the orderId in the iframe |
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
} from '@payconductor-sdk-web/library-svelte';
```

## Payment Flow

```
1. <PayConductor publicKey="pk_xxx"> mounts
   └─ Registers window.PayConductor, stores iframeUrl

2. <PayConductorCheckoutElement /> mounts
   └─ Reads iframeUrl, registers iframe at window.PayConductor.frame.iframe
   └─ Renders the iframe

3. iframe loads → fetches payment methods → sends Ready
   SDK receives Ready → sends config (theme, locale, paymentMethods)

4. User selects payment method
   └─ onPaymentMethodSelected is called
   └─ getSelectedPaymentMethod() returns the method

5. User clicks "Checkout" (merchant button, outside the iframe)
   └─ payconductor-sdk creates Draft order → returns { id: "ord_xxx" }
   └─ confirmPayment({ orderId: "ord_xxx" })
   └─ iframe collects form data → POST /orders/:id/confirm

6. SDK receives PaymentComplete/Failed/Pending → callbacks fire
```
