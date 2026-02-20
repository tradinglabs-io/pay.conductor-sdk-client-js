import { IFRAME_DEFAULT_HEIGHT, MESSAGE_TYPES } from "./constants";

import {
  PendingRequest,
  confirmPayment,
  createPaymentMethod,
  createPendingRequestsMap,
  handleMessageEvent,
  resetPayment,
  sendConfig,
  validatePayment,
} from "./internal";

import {
  ConfirmPaymentOptions,
  CreatePaymentMethodOptions,
  PayConductorApi,
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
    configSent: false,
    error: null,
    iframeUrl: "",
    isLoaded: false,
    isReady: false,
    pendingMap: null,
  });
  useVisibleTask$(() => {
    state.iframeUrl = buildIframeUrl({
      publicKey: props.publicKey,
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
    const config: PayConductorConfig = {
      publicKey: props.publicKey,
      intentToken: props.intentToken,
      theme: props.theme,
      locale: props.locale,
      paymentMethods: props.paymentMethods,
    };
    const api: PayConductorApi = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef.value, state.pendingMap, options),
      confirmPayment: (options: ConfirmPaymentOptions) =>
        confirmPayment(iframeRef.value, state.pendingMap, options),
      validate: (data: any) =>
        validatePayment(iframeRef.value, state.pendingMap, data),
      reset: () => resetPayment(iframeRef.value, state.pendingMap),
    };
    window.__PAY_CONDUCTOR__ = {
      frame,
      config,
      api,
    };
    const sendConfigToIframe = async () => {
      if (!state.configSent && iframeRef.value) {
        state.configSent = true;
        sendConfig(iframeRef.value, state.pendingMap, {
          intentToken: props.intentToken,
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
        });
      }
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        state.pendingMap,
        (val) => {
          state.isReady = val;
          if (val) {
            sendConfigToIframe();
          }
        },
        (val) => {
          state.error = val;
        },
        props.onReady,
        props.onError,
        props.onPaymentComplete
      );
    };
    window.addEventListener("message", eventHandler);
  });

  return (
    <div
      class="payconductor"
      id="payconductor"
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <Slot></Slot>
      {state.isLoaded ? (
        <iframe
          allow="payment"
          title="PayConductor"
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
