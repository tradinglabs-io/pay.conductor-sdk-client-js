# @payconductor-sdk-web/library-react

React SDK para integração com o PayConductor Payment Gateway.

## Instalação

```bash
npm install @payconductor-sdk-web/library-react
# or
yarn add @payconductor-sdk-web/library-react
# or
pnpm add @payconductor-sdk-web/library-react
```

## Uso Básico

```tsx
"use client";

import {
  PayConductor,
  useElement,
  usePayConductor,
  type PaymentResult,
} from "@payconductor-sdk-web/library-react";
import { useState, useEffect } from "react";

function CheckoutForm() {
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

export default function App() {
  return (
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
  );
}
```

## API Reference

### `<PayConductor />`

Componente principal que inicializa o iframe de pagamento.

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

Hook que retorna o estado do frame e configuração.

```tsx
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

Hook que fornece os métodos de pagamento.

```tsx
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

## License

MIT
