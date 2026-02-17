import { IFRAME_DEFAULT_HEIGHT } from "./constants";

import {
  PendingRequest,
  confirmPayment,
  createPaymentMethod,
  createPendingRequestsMap,
  handleMessageEvent,
  resetPayment,
  validatePayment,
} from "./internal";

import {
  CreatePaymentMethodOptions,
  PayConductorConfig,
  PayConductorFrame,
  PayConductorState,
  PaymentResult,
} from "./types";

import { buildIframeUrl } from "./utils";

import {
  Fragment,
  Slot,
  component$,
  h,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}
export const PayConductor = component$((props: PayConductorEmbedProps) => {
  const iframeRef = useSignal<Element>();
  const state = useStore<any>({
    error: null,
    iframeUrl: "",
    isLoaded: false,
    isReady: false,
    pendingMap: null,
  });
  useVisibleTask$(() => {
    state.iframeUrl = buildIframeUrl({
      clientId: props.clientId,
      token: props.token,
      theme: props.theme,
      locale: props.locale,
    });
    state.isLoaded = true;
    state.pendingMap = createPendingRequestsMap();
    const frame: PayConductorFrame = {
      iframe: iframeRef,
      get isReady() {
        return state.isReady;
      },
      get error() {
        return state.error;
      },
    };
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef.value, state.pendingMap, options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(iframeRef.value, state.pendingMap, paymentMethodId),
      validate: (data: any) =>
        validatePayment(iframeRef.value, state.pendingMap, data),
      reset: () => resetPayment(iframeRef.value, state.pendingMap),
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: props.clientId,
        token: props.token,
        theme: props.theme,
        locale: props.locale,
      },
      api,
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
    window.addEventListener("message", eventHandler);
  });

  return (
    <div
      id="payconductor"
      class="payconductor"
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <Slot></Slot>
      {state.isLoaded ? (
        <iframe
          title="PayConductor"
          allow="payment"
          ref={iframeRef}
          src={state.iframeUrl}
          style={{
            width: "100%",
            height: props.height || IFRAME_DEFAULT_HEIGHT,
            border: "none",
          }}
        ></iframe>
      ) : null}
    </div>
  );
});

export default PayConductor;
