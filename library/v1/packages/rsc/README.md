# @payconductor-sdk-web/library-rsc

React Server Components SDK for integrating with PayConductor Payment Gateway. Optimized for Next.js App Router.

## Installation

```bash
npm install @payconductor-sdk-web/library-rsc
# or
yarn add @payconductor-sdk-web/library-rsc
# or
pnpm add @payconductor-sdk-web/library-rsc
```

## Basic Usage with Next.js App Router

### 1. Create a client component for checkout

```tsx
// components/CheckoutForm.tsx
"use client";

import {
  useElement,
  usePayConductor,
  type PaymentResult,
} from "@payconductor-sdk-web/library-rsc";
import { useState, useEffect } from "react";

export function CheckoutForm() {
  const { isReady, error } = usePayConductor();
  const { submit, confirmPayment, update } = useElement();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    update({
      billingDetails: {
        name: clientName,
        email: clientEmail,
      },
    });
  }, [clientName, clientEmail, update]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isReady) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await submit();

      if (submitError) {
        setErrorMessage(submitError.message || "Validation failed");
        setIsProcessing(false);
        return;
      }

      const result: PaymentResult = await confirmPayment({
        intentToken: "pi_xxx_intent_token_xxx",
        returnUrl: window.location.href,
      });

      if (result.status === "succeeded") {
        alert("Payment successful!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
      />
      <button type="submit" disabled={!isReady || isProcessing}>
        {isProcessing ? "Processing..." : "Pay now"}
      </button>
      {errorMessage && <div>{errorMessage}</div>}
      {error && <div>Error: {error}</div>}
    </form>
  );
}
```

### 2. Use in a Server Component page

```tsx
// app/checkout/page.tsx
import { PayConductor } from "@payconductor-sdk-web/library-rsc";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main>
      <h1>Checkout</h1>
      <PayConductor
        publicKey="pk_test_123"
        intentToken="pi_test_abc123"
        theme={{ primaryColor: "#0066ff" }}
        locale="en-US"
        height="500px"
        debug={true}
        onReady={() => console.log("Ready")}
        onError={(err) => console.error(err)}
        onPaymentComplete={(result) => console.log(result)}
      >
        <CheckoutForm />
      </PayConductor>
    </main>
  );
}
```

### 3. Passing server-side data

```tsx
// app/checkout/page.tsx
import { PayConductor } from "@payconductor-sdk-web/library-rsc";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getPaymentIntent } from "@/lib/payconductor";

export default async function CheckoutPage() {
  // Fetch payment intent from your backend
  const { intentToken, amount, currency } = await getPaymentIntent();

  return (
    <main>
      <h1>Checkout - {amount} {currency}</h1>
      <PayConductor
        publicKey={process.env.NEXT_PUBLIC_PAYCONDUCTOR_PUBLIC_KEY!}
        intentToken={intentToken}
        theme={{ primaryColor: "#0066ff" }}
        locale="en-US"
      >
        <CheckoutForm />
      </PayConductor>
    </main>
  );
}
```

## API Reference

### `<PayConductor />`

Client-side component that initializes the payment iframe. Marked with `"use client"` for RSC compatibility.

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Your PayConductor public key |
| `intentToken` | `string` | Payment intent token |
| `theme` | `PayConductorTheme` | Theme configuration |
| `locale` | `string` | Locale (e.g., 'en-US', 'pt-BR') |
| `height` | `string` | Iframe height (default: '500px') |
| `debug` | `boolean` | Enable debug mode with prefixed console.log for key events |
| `onReady` | `() => void` | Callback when iframe is ready |
| `onError` | `(error: Error) => void` | Error callback |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Payment complete callback |

### `usePayConductor()`

Hook that returns frame state and configuration. Use only in Client Components.

```tsx
"use client";

const { isReady, error, publicKey, intentToken, theme, locale } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Whether iframe is ready |
| `error` | `string \| null` | Error message if any |
| `publicKey` | `string` | Public key from config |
| `intentToken` | `string` | Intent token from config |
| `theme` | `PayConductorTheme` | Theme from config |
| `locale` | `string` | Locale from config |

### `useElement()`

Hook that provides payment methods. Use only in Client Components.

```tsx
"use client";

const {
  submit,
  confirmPayment,
  update,
  validate,
  reset,
  updateConfig,
  updateIntentToken
} = useElement();
```

| Method | Description |
|--------|-------------|
| `submit()` | Submits the form, returns `{ error?, paymentMethod? }` |
| `confirmPayment(options)` | Confirms payment with `{ intentToken, returnUrl? }` |
| `update(options)` | Updates billing details `{ billingDetails?: { name, email, phone, address } }` |
| `validate(data)` | Validates payment data |
| `reset()` | Resets the payment form |
| `updateConfig(config)` | Updates theme, locale, or paymentMethods config |
| `updateIntentToken(token)` | Updates the intent token |

## Theming

```tsx
const theme: PayConductorTheme = {
  primaryColor: "#0066ff",
  secondaryColor: "#5a6b7c",
  backgroundColor: "transparent",
  surfaceColor: "#f8fafc",
  textColor: "#0f172a",
  textSecondaryColor: "#64748b",
  errorColor: "#ef4444",
  successColor: "#22c55e",
  warningColor: "#f59e0b",
  borderColor: "#e2e8f0",
  disabledColor: "#cbd5e1",
  fontFamily: '"Poppins", sans-serif',
  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.125rem", xl: "1.25rem" },
  fontWeight: { normal: 400, medium: 500, bold: 600 },
  lineHeight: "1.5",
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  borderRadius: "8px",
  borderWidth: "1px",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  inputBackground: "#ffffff",
  inputBorderColor: "#cbd5e1",
  inputBorderRadius: "8px",
  inputHeight: "44px",
  inputPadding: "12px 16px",
  buttonHeight: "48px",
  buttonPadding: "16px 24px",
  buttonBorderRadius: "8px",
  transitionDuration: "0.2s",
};
```

## Types

```tsx
type PaymentResult = {
  paymentIntentId: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
  currency: string;
};

type BillingDetails = {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};
```

## Differences from @payconductor-sdk-web/library-react

- Optimized for Server Components and Next.js App Router
- `PayConductor` component marked with `"use client"`
- Hooks must only be used in Client Components
- Allows passing server-side data (intentToken, config) directly to the component

## License

MIT
