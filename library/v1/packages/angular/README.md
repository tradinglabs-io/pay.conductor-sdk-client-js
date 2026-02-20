# @payconductor-sdk-web/library-angular

Angular SDK for [PayConductor](https://payconductor.ai) payment integration.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-angular.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-angular)

## Requirements

Minimum Angular version: **v14**.

## Installation

```bash
npm install @payconductor-sdk-web/library-angular payconductor-sdk
# or
yarn add @payconductor-sdk-web/library-angular payconductor-sdk
# or
pnpm add @payconductor-sdk-web/library-angular payconductor-sdk
# or
bun add @payconductor-sdk-web/library-angular payconductor-sdk
```

## Quick Start

```ts
// checkout.component.ts
import { Component, OnInit } from '@angular/core';
import {
  PayConductorModule,
  type PaymentMethod,
  type PaymentResult,
} from '@payconductor-sdk-web/library-angular';
import {
  AvailablePaymentMethods,
  Configuration,
  DocumentType,
  OrderApi,
  type OrderCreateRequest,
} from 'payconductor-sdk';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [PayConductorModule],
  template: `
    <pay-conductor
      publicKey="pk_test_123"
      locale="pt-BR"
      [debug]="true"
      [theme]="theme"
      (ready)="onReady()"
      (error)="onError($event)"
      (paymentComplete)="onPaymentComplete($event)"
      (paymentMethodSelected)="onPaymentMethodSelected($event)"
    >
      <!-- The iframe is rendered here -->
      <pay-conductor-checkout-element height="600px" />

      <p *ngIf="selectedMethod">
        Selected method: <strong>{{ selectedMethod }}</strong>
      </p>

      <button type="button" [disabled]="!isReady || isProcessing" (click)="handleFinalize()">
        {{ isProcessing ? 'Processing...' : 'Checkout' }}
      </button>

      <div *ngIf="errorMessage">{{ errorMessage }}</div>
    </pay-conductor>
  `,
})
export class CheckoutComponent {
  isReady = false;
  isProcessing = false;
  errorMessage: string | null = null;
  selectedMethod: PaymentMethod | null = null;

  theme = { primaryColor: '#0066ff', borderRadius: '8px' };

  private readonly orderApi = new OrderApi(
    new Configuration({
      username: import.meta.env['PAYCONDUCTOR_CLIENT_ID'] || 'your_client_id',
      password: import.meta.env['PAYCONDUCTOR_CLIENT_SECRET'] || 'your_client_secret',
    }),
  );

  async handleFinalize(): Promise<void> {
    if (!this.isReady) return;
    this.isProcessing = true;
    this.errorMessage = null;

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
      const { data } = await this.orderApi.orderCreate(orderRequest);

      // 2. Confirm payment — inject PayConductorElementService to call confirmPayment
      // (see usePayconductorElement equivalent in Angular)
    } catch (err: unknown) {
      this.errorMessage = err instanceof Error ? err.message : 'Payment failed';
    } finally {
      this.isProcessing = false;
    }
  }

  onReady(): void {
    this.isReady = true;
    console.log('Ready');
  }

  onError(err: Error): void {
    console.error('Error:', err);
  }

  onPaymentComplete(result: PaymentResult): void {
    console.log('Complete:', result);
  }

  onPaymentMethodSelected(method: PaymentMethod): void {
    console.log('Method:', method);
    this.selectedMethod = method;
  }
}
```

## API Reference

### `PayConductorModule`

Import this module to access `PayConductor` and `PayConductorCheckoutElement` components.

### `<pay-conductor>`

Provider component that initializes the payment session.

| Input | Type | Description |
|-------|------|-------------|
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

| Output | Type | Description |
|--------|------|-------------|
| `ready` | `EventEmitter<void>` | Emitted when the iframe is ready |
| `error` | `EventEmitter<Error>` | Emitted when an error occurs |
| `paymentComplete` | `EventEmitter<PaymentResult>` | Emitted when payment succeeds |
| `paymentFailed` | `EventEmitter<PaymentResult>` | Emitted when payment fails |
| `paymentPending` | `EventEmitter<PaymentResult>` | Emitted when payment is pending |
| `paymentMethodSelected` | `EventEmitter<PaymentMethod>` | Emitted when user selects a payment method |

### `<pay-conductor-checkout-element>`

Renders the payment iframe. Place it inside `<pay-conductor>`.

| Input | Type | Description |
|-------|------|-------------|
| `height` | `string` | Iframe height (default: `'600px'`) |

## TypeScript

```ts
import type {
  PaymentResult,
  PaymentMethod,
  PayConductorTheme,
  PayConductorConfig,
  PaymentConfirmData,
} from '@payconductor-sdk-web/library-angular';
```

## License

MIT
