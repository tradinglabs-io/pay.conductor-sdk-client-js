import { useStore, onMount, useRef } from '@builder.io/mitosis';
import { IFRAME_DEFAULT_HEIGHT } from './constants';
import { buildIframeUrl } from './utils';
import {
  PayConductorConfig,
  PaymentResult,
  CreatePaymentMethodOptions,
  PayConductorState,
  PayConductorFrame
} from './types';
import {
  createPendingRequestsMap,
  createPaymentMethod,
  confirmPayment,
  validatePayment,
  resetPayment,
  handleMessageEvent, PendingRequest
} from './internal';

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

export default function PayConductor(props: PayConductorEmbedProps) {
  const state = useStore<PayConductorState>({
    isLoaded: false,
    isReady: false,
    error: null as string | null,
    iframeUrl: '',
    pendingMap: null as Map<string, PendingRequest> | null
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  onMount(() => {
    state.iframeUrl = buildIframeUrl({
      clientId: props.clientId,
      token: props.token,
      theme: props.theme,
      locale: props.locale
    });
    state.isLoaded = true;
    state.pendingMap = createPendingRequestsMap();

    const frame: PayConductorFrame = {
      iframe: iframeRef,
      get isReady() { return state.isReady; },
      get error() { return state.error; }
    };

    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) => 
        createPaymentMethod(iframeRef, state.pendingMap, options),
      confirmPayment: (paymentMethodId: string) => 
        confirmPayment(iframeRef, state.pendingMap, paymentMethodId),
      validate: (data: any) => 
        validatePayment(iframeRef, state.pendingMap, data),
      reset: () => 
        resetPayment(iframeRef, state.pendingMap)
    };

    window.__payConductor = {
      frame,
      config: {
        clientId: props.clientId,
        token: props.token,
        theme: props.theme,
        locale: props.locale
      },
      api
    };

    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        state.pendingMap,
        (val) => (state.isReady = val),
        (val) => (state.error = val),
        props.onReady,
        props.onError,
        props.onPaymentComplete
      );
    };

    window.addEventListener('message', eventHandler);
  });

  return (
    <div 
      id="payconductor"
      class="payconductor"
      style={{
        width: '100%',
        position: 'relative'
      }}
    >
      {props.children}
      {state.isLoaded && (<iframe
          ref={iframeRef}
          src={state.iframeUrl}
          style={{
            width: '100%',
            height: props.height || IFRAME_DEFAULT_HEIGHT,
            border: 'none'
          }}
          title="PayConductor"
          allow="payment"
      />)}
    </div>
  );
}
