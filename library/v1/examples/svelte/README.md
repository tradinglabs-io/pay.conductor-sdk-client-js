# PayConductor SDK Web - Exemplo Svelte

Exemplo de integração do [PayConductor](https://payconductor.ai) com Svelte.

[![npm version](https://img.shields.io/npm/v/@payconductor-sdk-web/library-svelte.svg?style=flat-square)](https://www.npmjs.com/package/@payconductor-sdk-web/library-svelte)

## Requisitos

Versão mínima do Svelte: **v4**.

## Instalação

```sh
npm install @payconductor-sdk-web/library-svelte
# or
yarn add @payconductor-sdk-web/library-svelte
# or
pnpm add @payconductor-sdk-web/library-svelte
# or
bun add @payconductor-sdk-web/library-svelte
```

## Executar o exemplo

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

  const { isReady, error } = usePayConductor();
  const { confirmPayment, getSelectedPaymentMethod } = usePayconductorElement();

  let errorMessage: string | null = null;
  let isProcessing = false;

  $: selectedMethod = getSelectedPaymentMethod();

  async function handleFinalize() {
    if (!$isReady) return;

    isProcessing = true;
    errorMessage = null;

    try {
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

      if (result.status === 'succeeded') {
        alert('Pagamento realizado com sucesso!');
      }
    } catch (err: any) {
      errorMessage = err.message || 'Falha no pagamento';
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
  onPaymentComplete={(result) => console.log('Completo:', result)}
  onPaymentMethodSelected={(method) => console.log('Método:', method)}
>
  <!-- O iframe é renderizado aqui -->
  <PayConductorCheckoutElement height="600px" />

  {#if selectedMethod}
    <p>Método selecionado: <strong>{selectedMethod}</strong></p>
  {/if}

  <button
    type="button"
    disabled={!$isReady || isProcessing}
    on:click={handleFinalize}
  >
    {isProcessing ? 'Processando...' : 'Finalizar compra'}
  </button>

  {#if errorMessage}
    <div style="color: #fa755a">{errorMessage}</div>
  {/if}

  {#if $error}
    <div style="color: #fa755a">Erro: {$error}</div>
  {/if}
</PayConductor>
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

Store que fornece o estado do frame.

```svelte
<script>
  const { isReady, error } = usePayConductor();
  // $isReady, $error são Svelte stores
</script>
```

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `Readable<boolean>` | Se o iframe está pronto (Svelte store) |
| `error` | `Readable<string \| null>` | Mensagem de erro (Svelte store) |

### `usePayconductorElement()`

Fornece métodos de ação de pagamento.

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
} from '@payconductor-sdk-web/library-svelte';
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
