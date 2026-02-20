# @payconductor-sdk-web/library-webcomponent

Web Components SDK for [PayConductor](https://payconductor.ai) payment integration. Framework-agnostic — works with any HTML page or framework.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-webcomponent.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-webcomponent)

## Requirements

Browser with Custom Elements v1 support (all modern browsers).

## Installation

```bash
npm install @payconductor-sdk-web/library-webcomponent payconductor-sdk
# or
yarn add @payconductor-sdk-web/library-webcomponent payconductor-sdk
# or
pnpm add @payconductor-sdk-web/library-webcomponent payconductor-sdk
# or
bun add @payconductor-sdk-web/library-webcomponent payconductor-sdk
```

## Quick Start

```ts
import '@payconductor-sdk-web/library-webcomponent';
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

// Get references to the custom elements
const payConductor = document.querySelector('pay-conductor')!;
const checkoutButton = document.querySelector<HTMLButtonElement>('#checkout-btn')!;

// Listen for ready event
payConductor.addEventListener('ready', () => {
  console.log('PayConductor ready');
  checkoutButton.disabled = false;
});

// Listen for payment events
payConductor.addEventListener('paymentComplete', (e: Event) => {
  const result = (e as CustomEvent).detail;
  console.log('Payment complete:', result);
});

payConductor.addEventListener('paymentMethodSelected', (e: Event) => {
  const method = (e as CustomEvent).detail;
  console.log('Method selected:', method);
});

// Handle checkout button click
checkoutButton.addEventListener('click', async () => {
  checkoutButton.disabled = true;
  checkoutButton.textContent = 'Processing...';

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
    payConductor.dispatchEvent(new CustomEvent('confirmPayment', { detail: { orderId: data.id } }));
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err);
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Checkout';
  }
});
```

```html
<!-- index.html -->
<pay-conductor
  public-key="pk_test_123"
  locale="pt-BR"
  debug="true"
>
  <!-- The iframe is rendered here -->
  <pay-conductor-checkout-element height="600px"></pay-conductor-checkout-element>

  <button id="checkout-btn" type="button" disabled>Checkout</button>
</pay-conductor>
```

## API Reference

### `<pay-conductor>`

Custom element that initializes the payment session.

| Attribute | Type | Description |
|-----------|------|-------------|
| `public-key` | `string` | Your PayConductor public key |
| `locale` | `string` | Locale (e.g. `'pt-BR'`, `'en-US'`) |
| `debug` | `boolean` | Enable prefixed console.log for key events |

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `PayConductorTheme` | Theme customization options (set via JS property) |
| `paymentMethods` | `PaymentMethod[] \| "all"` | Available payment methods |
| `defaultPaymentMethod` | `PaymentMethod` | Pre-selected payment method |

| Event | Detail | Description |
|-------|--------|-------------|
| `ready` | `void` | Fired when the iframe is ready |
| `error` | `Error` | Fired when an error occurs |
| `paymentComplete` | `PaymentResult` | Fired when payment succeeds |
| `paymentFailed` | `PaymentResult` | Fired when payment fails |
| `paymentPending` | `PaymentResult` | Fired when payment is pending |
| `paymentMethodSelected` | `PaymentMethod` | Fired when user selects a payment method |

### `<pay-conductor-checkout-element>`

Custom element that renders the payment iframe. Place it inside `<pay-conductor>`.

| Attribute | Type | Description |
|-----------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

## TypeScript

```ts
import type {
  PaymentResult,
  PaymentMethod,
  PayConductorTheme,
  PayConductorConfig,
  PaymentConfirmData,
} from '@payconductor-sdk-web/library-webcomponent';
```

## License

MIT
