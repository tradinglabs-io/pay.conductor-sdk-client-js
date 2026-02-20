import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

import {
  PayConductorConfig,
  PaymentMethod,
  PaymentResult,
} from "./iframe/types";

import {
  confirmPayment,
  createPendingRequestsMap,
  handleMessageEvent,
  resetPayment,
  sendConfig,
  validatePayment,
} from "./internal";

import {
  PayConductorApi,
  PayConductorFrame,
  PayConductorState,
  PendingRequest,
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
  showActionButtons?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
  onPaymentFailed?: (result: PaymentResult) => void;
  onPaymentPending?: (result: PaymentResult) => void;
  onPaymentMethodSelected?: (method: PaymentMethod) => void;
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
    selectedPaymentMethod: null,
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
      defaultPaymentMethod: props.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) =>
        confirmPayment(iframeRef.value, state.pendingMap, options),
      validate: (data: unknown) =>
        validatePayment(iframeRef.value, state.pendingMap, data),
      reset: () => resetPayment(iframeRef.value, state.pendingMap),
      getSelectedPaymentMethod: () => state.selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: state.selectedPaymentMethod,
    };
    const sendConfigToIframe = async () => {
      if (!state.configSent && iframeRef.value) {
        state.configSent = true;
        sendConfig(iframeRef.value, state.pendingMap, {
          intentToken: props.intentToken,
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
          defaultPaymentMethod: props.defaultPaymentMethod,
          showPaymentButtons: props.showPaymentButtons,
          nuPayConfig: props.nuPayConfig,
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
        (data) => props.onPaymentComplete?.(data as PaymentResult),
        (data) => props.onPaymentFailed?.(data as PaymentResult),
        (data) => props.onPaymentPending?.(data as PaymentResult),
        (method) => {
          state.selectedPaymentMethod = method;
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          props.onPaymentMethodSelected?.(method);
        }
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
            height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
            border: "none",
          }}
        ></iframe>
      ) : null}
    </div>
  );
});

export default PayConductor;
