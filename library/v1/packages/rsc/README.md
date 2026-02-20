# @payconductor-sdk-web/library-rsc

React Server Components SDK para integração com o PayConductor. Otimizado para o Next.js App Router.

## Instalação

```bash
npm install @payconductor-sdk-web/library-rsc
# or
yarn add @payconductor-sdk-web/library-rsc
# or
pnpm add @payconductor-sdk-web/library-rsc
# or
bun add @payconductor-sdk-web/library-rsc
```

## Uso com Next.js App Router

### 1. Crie um Client Component para o checkout

```tsx
// components/CheckoutForm.tsx
"use client";

import {
  PayConductorCheckoutElement,
  usePayConductor,
  usePayconductorElement,
  type PaymentMethod,
  type PaymentResult,
} from "@payconductor-sdk-web/library-rsc";
import { useState } from "react";

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
      // 1. Crie o pedido Draft no seu backend para obter o orderId
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment: {
            paymentMethod: "Draft",
            availablePaymentMethods: ["CreditCard", "Pix", "BankSlip"],
          },
        }),
      });
      const { id: orderId } = await response.json();

      // 2. Confirme o pagamento com o orderId obtido
      const result: PaymentResult = await confirmPayment({ orderId });

      if (result.status === "succeeded") {
        alert("Pagamento realizado com sucesso!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Falha no pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethod = getSelectedPaymentMethod();

  return (
    <div>
      {/* O iframe é renderizado aqui */}
      <PayConductorCheckoutElement height="500px" />

      {selectedMethod && (
        <p>Método selecionado: <strong>{selectedMethod}</strong></p>
      )}

      <button
        type="button"
        onClick={handleFinalize}
        disabled={!isReady || isProcessing}
      >
        {isProcessing ? "Processando..." : "Finalizar compra"}
      </button>

      {errorMessage && <div>{errorMessage}</div>}
      {error && <div>Erro: {error}</div>}
    </div>
  );
}
```

### 2. Use em um Server Component

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
        locale="pt-BR"
        theme={{ primaryColor: "#0066ff" }}
        debug={true}
        onReady={() => console.log("Ready")}
        onError={(err) => console.error(err)}
        onPaymentComplete={(result) => console.log(result)}
        onPaymentMethodSelected={(method) => console.log("Método:", method)}
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

export default async function CheckoutPage() {
  // Configurações podem vir do servidor — publicKey, theme, locale, etc.
  // O orderId NÃO é passado aqui; ele é obtido no clique de confirmar.
  return (
    <main>
      <h1>Checkout</h1>
      <PayConductor
        publicKey={process.env.NEXT_PUBLIC_PAYCONDUCTOR_PUBLIC_KEY!}
        locale="pt-BR"
        theme={{ primaryColor: "#0066ff" }}
        paymentMethods={["CreditCard", "Pix", "BankSlip"]}
      >
        <CheckoutForm />
      </PayConductor>
    </main>
  );
}
```

## API Reference

### `<PayConductor />`

Componente provider que inicializa a sessão de pagamento. Marcado com `"use client"` para compatibilidade com RSC. **Não renderiza o iframe diretamente** — use `<PayConductorCheckoutElement>` dentro do seu Client Component.

| Prop | Type | Description |
|------|------|-------------|
| `publicKey` | `string` | Sua chave pública do PayConductor |
| `theme` | `PayConductorTheme` | Opções de tema |
| `locale` | `string` | Localização (ex: `'pt-BR'`, `'en-US'`) |
| `paymentMethods` | `PaymentMethod[] \| "all"` | Métodos de pagamento disponíveis |
| `defaultPaymentMethod` | `PaymentMethod` | Método pré-selecionado |
| `paymentMethodsConfig` | `PaymentMethodConfig[]` | Config por método (parcelas, descontos) |
| `methodsDirection` | `"vertical" \| "horizontal"` | Direção do layout dos métodos |
| `showPaymentButtons` | `boolean` | Exibe botões de ação dentro do iframe |
| `nuPayConfig` | `NuPayData` | Obrigatório quando NuPay estiver disponível |
| `debug` | `boolean` | Habilita logs detalhados no console |
| `onReady` | `() => void` | Chamado quando o iframe está pronto |
| `onError` | `(error: Error) => void` | Chamado em caso de erro |
| `onPaymentComplete` | `(result: PaymentResult) => void` | Chamado quando o pagamento é concluído |
| `onPaymentFailed` | `(result: PaymentResult) => void` | Chamado quando o pagamento falha |
| `onPaymentPending` | `(result: PaymentResult) => void` | Chamado quando o pagamento fica pendente |
| `onPaymentMethodSelected` | `(method: PaymentMethod) => void` | Chamado quando o usuário seleciona um método |

### `<PayConductorCheckoutElement />`

Componente que renderiza o iframe de pagamento. Use somente em Client Components (`"use client"`).

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Altura do iframe (padrão: `'600px'`) |

### `usePayConductor()`

Hook que retorna o estado do frame. Use somente em Client Components.

```tsx
"use client";
const { isReady, error } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Se o iframe está pronto |
| `error` | `string \| null` | Mensagem de erro, se houver |

### `usePayconductorElement()`

Hook que fornece métodos de ação de pagamento. Use somente em Client Components.

```tsx
"use client";
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
| `init` | `(config: PayConductorConfig) => Promise<void>` | Envia configuração completa ao iframe |
| `confirmPayment` | `({ orderId: string }) => Promise<PaymentResult>` | Confirma o pagamento no iframe |
| `validate` | `(data: unknown) => Promise<boolean>` | Valida os dados do formulário |
| `reset` | `() => Promise<void>` | Reseta o formulário de pagamento |
| `getSelectedPaymentMethod` | `() => PaymentMethod \| null` | Retorna o método selecionado pelo usuário |
| `updateConfig` | `(config: Partial<PayConductorConfig>) => void` | Atualiza tema, locale ou métodos |
| `updateorderId` | `(orderId: string) => void` | Atualiza o orderId no iframe |
| `update` | `(options: UpdateOptions) => void` | Atualiza dados de cobrança |
| `submit` | `() => Promise<SubmitResult>` | Envia o formulário (valida + formata) |

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
} from "@payconductor-sdk-web/library-rsc";
```

```tsx
type PaymentResult = {
  orderId: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
  currency: string;
  message?: string;
};

type PaymentConfirmData =
  | PixPaymentData         // { paymentMethod: 'Pix', expirationInSeconds? }
  | CreditCardPaymentData  // { paymentMethod: 'CreditCard', card, installments, softDescriptor? }
  | BankSlipPaymentData    // { paymentMethod: 'BankSlip', expirationInDays? }
  | NuPayPaymentData       // { paymentMethod: 'NuPay', nuPay: NuPayData }
  | PicPayPaymentData;     // { paymentMethod: 'PicPay' }
```

## Diferenças do `@payconductor-sdk-web/library-react`

- Otimizado para Server Components e Next.js App Router
- `PayConductor` é marcado com `"use client"` internamente
- Hooks e `PayConductorCheckoutElement` devem ser usados somente em Client Components
- Configurações (publicKey, theme, locale, paymentMethods) podem ser passadas a partir de dados do servidor
- O `orderId` **não** é uma prop do `<PayConductor>` — ele é obtido via chamada ao backend no momento do clique de confirmar

## Fluxo Completo

```
1. Server Component renderiza <PayConductor publicKey="pk_xxx" ...>
   └─ Registra window.PayConductor, guarda iframeUrl

2. Client Component renderiza <PayConductorCheckoutElement />
   └─ Lê iframeUrl, registra o iframe em window.PayConductor.frame.iframe
   └─ Renderiza o iframe

3. iframe carrega → busca métodos de pagamento → envia Ready
   SDK recebe Ready → envia config (theme, locale, paymentMethods)

4. Usuário seleciona método de pagamento
   └─ onPaymentMethodSelected é chamado
   └─ getSelectedPaymentMethod() retorna o método

5. Usuário clica em "Finalizar" (botão do merchant, fora do iframe)
   └─ Backend cria pedido Draft → retorna { id: "ord_xxx" }
   └─ confirmPayment({ orderId: "ord_xxx" })
   └─ iframe coleta dados → POST /orders/:id/confirm

6. SDK recebe PaymentComplete/Failed/Pending → callbacks disparam
```

## License

MIT
