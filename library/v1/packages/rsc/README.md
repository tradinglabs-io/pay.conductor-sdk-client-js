# @payconductor-sdk-web/library-rsc

React Server Components SDK para integração com o PayConductor Payment Gateway. Otimizado para Next.js App Router.

## Instalação

```bash
npm install @payconductor-sdk-web/library-rsc
# or
yarn add @payconductor-sdk-web/library-rsc
# or
pnpm add @payconductor-sdk-web/library-rsc
```

## Uso Básico com Next.js App Router

### 1. Crie um componente cliente para o checkout

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
        placeholder="Nome completo"
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
        {isProcessing ? "Processando..." : "Pagar agora"}
      </button>
      {errorMessage && <div>{errorMessage}</div>}
      {error && <div>Erro: {error}</div>}
    </form>
  );
}
```

### 2. Use em uma página Server Component

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
        locale="pt-BR"
        height="500px"
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

### 3. Passando dados do servidor

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
        locale="pt-BR"
      >
        <CheckoutForm />
      </PayConductor>
    </main>
  );
}
```

## API Reference

### `<PayConductor />`

Componente client-side que inicializa o iframe de pagamento. Marcado com `"use client"` para compatibilidade com RSC.

| Prop | Tipo | Descrição |
|------|------|-----------|
| `publicKey` | `string` | Chave pública do PayConductor |
| `intentToken` | `string` | Token do payment intent |
| `theme` | `PayConductorTheme` | Configuração de tema |
| `locale` | `string` | Idioma (ex: 'pt-BR', 'en-US') |
| `height` | `string` | Altura do iframe (default: '500px') |
| `onReady` | `() => void` | Callback quando iframe está pronto |
| `onError` | `(error: Error) => void` | Callback de erro |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Callback de pagamento completo |

### `usePayConductor()`

Hook que retorna o estado do frame e configuração. Use apenas em Client Components.

```tsx
"use client";

const { isReady, error, publicKey, intentToken, theme, locale } = usePayConductor();
```

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `isReady` | `boolean` | Se o iframe está pronto |
| `error` | `string \| null` | Mensagem de erro, se houver |
| `publicKey` | `string` | Chave pública da configuração |
| `intentToken` | `string` | Token do intent da configuração |
| `theme` | `PayConductorTheme` | Tema da configuração |
| `locale` | `string` | Locale da configuração |

### `useElement()`

Hook que fornece os métodos de pagamento. Use apenas em Client Components.

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

| Método | Descrição |
|--------|-----------|
| `submit()` | Submete o formulário, retorna `{ error?, paymentMethod? }` |
| `confirmPayment(options)` | Confirma o pagamento com `{ intentToken, returnUrl? }` |
| `update(options)` | Atualiza billing details `{ billingDetails?: { name, email, phone, address } }` |
| `validate(data)` | Valida dados do pagamento |
| `reset()` | Reseta o formulário de pagamento |
| `updateConfig(config)` | Atualiza config de theme, locale ou paymentMethods |
| `updateIntentToken(token)` | Atualiza o intent token |

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

## Tipos

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

## Diferenças do @payconductor-sdk-web/library-react

- Otimizado para Server Components e Next.js App Router
- Componente `PayConductor` marcado com `"use client"`
- Hooks devem ser usados apenas em Client Components
- Permite passar dados do servidor (intentToken, config) diretamente para o componente

## License

MIT
