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

      const { data: orderData } = await orderApi.orderCreate(orderRequest);

      // 2. Confirm payment with the obtained orderId
      const result: PaymentResult = await confirmPayment({ orderId: orderData.id });
      console.log('Payment result:', result);

      if (result.status === 'succeeded') {
        alert('Payment successful!');
      }
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : 'Payment failed';
    } finally {
      isProcessing = false;
    }
  }

  function handlePaymentMethodSelected(method: PaymentMethod) {
    console.log('Payment method selected:', method);
  }

  function handlePaymentComplete(result: PaymentResult) {
    console.log('Payment complete:', result);
  }
</script>

<div style="max-width: 560px; margin: 0 auto; padding: 24px">
  <h1>PayConductor Checkout</h1>

  <PayConductor
    publicKey="pk_test_123"
    locale="pt-BR"
    debug={true}
    theme={{
      primaryColor: '#0066ff',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
    }}
    onReady={() => console.log('PayConductor ready')}
    onError={(err) => console.error('Error:', err)}
    onPaymentComplete={handlePaymentComplete}
    onPaymentMethodSelected={handlePaymentMethodSelected}
  >
    <PayConductorCheckoutElement height="500px" />

    {#if selectedMethod}
      <p style="margin: 12px 0; color: #64748b">
        Selected method: <strong>{selectedMethod}</strong>
      </p>
    {/if}

    <button
      type="button"
      disabled={!$isReady || isProcessing}
      on:click={handleFinalize}
      style="width: 100%; padding: 16px; background-color: {$isReady ? '#0066ff' : '#cfd7df'}; color: #ffffff; border: none; border-radius: 8px; cursor: {$isReady ? 'pointer' : 'not-allowed'}; font-size: 16px; font-weight: 600; margin-top: 16px"
    >
      {isProcessing ? 'Processing...' : 'Checkout'}
    </button>

    {#if errorMessage}
      <div style="color: #fa755a; margin-top: 16px">
        {errorMessage}
      </div>
    {/if}

    {#if $error}
      <div style="color: #fa755a; margin-top: 16px">
        Error: {$error}
      </div>
    {/if}
  </PayConductor>
</div>
