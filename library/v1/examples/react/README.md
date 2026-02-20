# PayConductor SDK Web - Exemplo React

Exemplo de integração do [PayConductor](https://payconductor.ai) com React.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-react.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-react)

## Requisitos

Versão mínima do React: **v16.8**.

## Instalação

```sh
npm install @payconductor-sdk-web/library-react
# or
yarn add @payconductor-sdk-web/library-react
# or
pnpm add @payconductor-sdk-web/library-react
# or
bun add @payconductor-sdk-web/library-react
```

## Executar o exemplo

```sh
bun install
bun dev
```

## Quick Start

```tsx
import {
  PayConductor,
  PayConductorCheckoutElement,
  usePayConductor,
  usePayconductorElement,
  type PaymentMethod,
  type PaymentResult,
} from '@payconductor-sdk-web/library-react';

function CheckoutForm() {
  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  const handleFinalize = async () => {
    // 1. Crie o pedido Draft no seu backend para obter o orderId
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment: {
          paymentMethod: 'Draft',
          availablePaymentMethods: ['CreditCard', 'Pix', 'BankSlip'],
        },
      }),
    });
    const { id: orderId } = await response.json();

    // 2. Confirme o pagamento com o orderId obtido
    const result: PaymentResult = await confirmPayment({ orderId });
    console.log('Resultado:', result);
  };

  const selectedMethod = getSelectedPaymentMethod();

  return (
    <div>
      {/* O iframe é renderizado aqui */}
      <PayConductorCheckoutElement height="600px" />

      {selectedMethod && <p>Método: {selectedMethod}</p>}

      <button onClick={handleFinalize} disabled={!isReady}>
        Finalizar compra
      </button>

      {error && <div>Erro: {error}</div>}
    </div>
  );
}

export default function App() {
  return (
    <PayConductor
      publicKey="pk_test_123"
      locale="pt-BR"
      debug={true}
      theme={{ primaryColor: '#0066ff', borderRadius: '8px' }}
      onReady={() => console.log('Ready')}
      onPaymentComplete={(result) => console.log('Completo:', result)}
      onPaymentMethodSelected={(method: PaymentMethod) => console.log('Método:', method)}
    >
      <CheckoutForm />
    </PayConductor>
  );
}
```

## API Reference

### `<PayConductor />`

Componente provider que inicializa a sessão de pagamento. **Não renderiza o iframe diretamente** — use `<PayConductorCheckoutElement>` para isso.

#### Props

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

Componente que renderiza o iframe de pagamento. Posicione-o dentro de `<PayConductor>` onde quiser exibir o iframe.

| Prop | Type | Description |
|------|------|-------------|
| `height` | `string` | Altura do iframe (padrão: `'600px'`) |

### `usePayConductor()`

Hook que fornece o estado do frame.

```tsx
const { isReady, error } = usePayConductor();
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | Se o iframe está pronto |
| `error` | `string \| null` | Mensagem de erro, se houver |

### `usePayconductorElement()`

Hook que fornece os métodos de ação de pagamento.

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
} from '@payconductor-sdk-web/library-react';
```

## Fluxo Completo

```
1. <PayConductor publicKey="pk_xxx"> monta
   └─ Registra window.PayConductor, guarda iframeUrl

2. <PayConductorCheckoutElement /> monta
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
