# @payconductor-sdk-web/library-rsc

React Server Components (RSC) SDK for [PayConductor](https://payconductor.ai) payment integration. Optimized for the Next.js App Router.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-rsc.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-rsc)

## Requirements

- Next.js **v13+** (App Router)
- React **v18+**

## Installation

```bash
npm install @payconductor-sdk-web/library-rsc payconductor-sdk
# or
yarn add @payconductor-sdk-web/library-rsc payconductor-sdk
# or
pnpm add @payconductor-sdk-web/library-rsc payconductor-sdk
# or
bun add @payconductor-sdk-web/library-rsc payconductor-sdk
```

## Quick Start

### 1. Create a Server Action (payconductor-sdk runs server-side)

```ts
// app/actions/orders.ts
'use server';

import {
  AvailablePaymentMethods,
  Configuration,
  DocumentType,
  OrderApi,
  type OrderCreateRequest,
} from 'payconductor-sdk';

const config = new Configuration({
  username: process.env.PAYCONDUCTOR_CLIENT_ID!,
  password: process.env.PAYCONDUCTOR_CLIENT_SECRET!,
});
const orderApi = new OrderApi(config);

export async function createDraftOrder(): Promise<string> {
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
  return data.id;
}
```

### 2. Create a Client Component for the checkout form

```tsx
// components/CheckoutForm.tsx
'use client';

import {
  PayConductorCheckoutElement,
  usePayConductor,
  usePayconductorElement,
  type PaymentMethod,
  type PaymentResult,
} from '@payconductor-sdk-web/library-rsc';
import { useState } from 'react';
import { createDraftOrder } from '@/app/actions/orders';

export function CheckoutForm() {
  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalize = async () => {
    if (!isReady) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Call Server Action — payconductor-sdk runs server-side, credentials never exposed
      const orderId = await createDraftOrder();

      // 2. Confirm payment with the obtained orderId
      const result: PaymentResult = await confirmPayment({ orderId });
      if (result.status === 'succeeded') alert('Payment successful!');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethod = getSelectedPaymentMethod();

  return (
    <div>
      {/* The iframe is rendered here */}
      <PayConductorCheckoutElement height="600px" />

      {selectedMethod && <p>Selected method: <strong>{selectedMethod}</strong></p>}

      <button type="button" onClick={handleFinalize} disabled={!isReady || isProcessing}>
        {isProcessing ? 'Processing...' : 'Checkout'}
      </button>

      {errorMessage && <div>{errorMessage}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### 3. Use in a Server Component page

```tsx
// app/checkout/page.tsx
import { PayConductor } from '@payconductor-sdk-web/library-rsc';
import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <main>
      <h1>Checkout</h1>
      <PayConductor
        publicKey={process.env.NEXT_PUBLIC_PAYCONDUCTOR_PUBLIC_KEY!}
        locale="pt-BR"
        debug={true}
        theme={{ primaryColor: '#0066ff', borderRadius: '8px' }}
        onReady={() => console.log('Ready')}
        onError={(err) => console.error(err)}
        onPaymentComplete={(result) => console.log('Complete:', result)}
        onPaymentMethodSelected={(method) => console.log('Method:', method)}
      >
        <CheckoutForm />
      </PayConductor>
    </main>
  );
}
```

## API Reference

### `<PayConductor />`

Provider component that initializes the payment session. Marked with `"use client"` internally for RSC compatibility. **Does not render the iframe directly** — use `<PayConductorCheckoutElement>` inside your Client Component.

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
| `onReady` | `() => void` | Called when the iframe is ready |
| `onError` | `(error: Error) => void` | Called when an error occurs |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Called when payment succeeds |
| `onPaymentFailed` | `(result: PaymentResult) => void` | Called when payment fails |
| `onPaymentPending` | `(result: PaymentResult) => void` | Called when payment is pending |
| `onPaymentMethodSelected` | `(method: PaymentMethod) => void` | Called when user selects a payment method |

### `<PayConductorCheckoutElement />`

Renders the payment iframe. **Use only in Client Components** (`'use client'`).

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

### `usePayConductor()`

Hook that provides frame state. **Use only in Client Components**.

```tsx
'use client';
const { isReady, error } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Whether the iframe is ready |
| `error` | `string \| null` | Error message, if any |

### `usePayconductorElement()`

Hook that provides payment action methods. **Use only in Client Components**.

```tsx
'use client';
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
  PixPaymentData,
  CreditCardPaymentData,
  BankSlipPaymentData,
  NuPayPaymentData,
  PicPayPaymentData,
  CardPaymentData,
  BillingDetails,
} from '@payconductor-sdk-web/library-rsc';
```

## Differences from `@payconductor-sdk-web/library-react`

| | `library-react` | `library-rsc` |
|--|--|--|
| Target | Plain React apps | Next.js App Router |
| `PayConductor` | Client component | `"use client"` — compatible with Server Components |
| Order creation | Module-level `OrderApi` | Server Action (credentials never reach the browser) |
| Env vars | `import.meta.env.VITE_*` | `process.env.*` (server-side) |

## Payment Flow

```
1. Server Component renders <PayConductor publicKey="pk_xxx" ...>
   └─ Registers window.PayConductor, stores iframeUrl

2. Client Component renders <PayConductorCheckoutElement />
   └─ Reads iframeUrl, renders the iframe

3. iframe loads → fetches payment methods → sends Ready
   SDK receives Ready → sends config (theme, locale, paymentMethods)

4. User selects payment method
   └─ onPaymentMethodSelected fires
   └─ getSelectedPaymentMethod() returns the chosen method

5. User clicks "Checkout" (your button, outside the iframe)
   └─ Server Action creates Draft order via payconductor-sdk → returns orderId
   └─ confirmPayment({ orderId })
   └─ iframe collects form data → POST /orders/:id/confirm

6. SDK receives PaymentComplete/Failed/Pending → callbacks fire
```

## License

MIT
