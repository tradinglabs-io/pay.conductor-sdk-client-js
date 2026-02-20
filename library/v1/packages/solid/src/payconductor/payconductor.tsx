import { Show, onMount, createSignal, createMemo } from "solid-js";

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

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";
import type {
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
import type {
  PayConductorApi,
  PayConductorFrame,
  PayConductorState,
  PendingRequest,
} from "./types";
import { buildIframeUrl } from "./utils";

function PayConductor(props: PayConductorEmbedProps) {
  const [isLoaded, setIsLoaded] = createSignal(false);

  const [isReady, setIsReady] = createSignal(false);

  const [error, setError] = createSignal(null);

  const [iframeUrl, setIframeUrl] = createSignal("");

  const [pendingMap, setPendingMap] = createSignal(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = createSignal(null);

  const [configSent, setConfigSent] = createSignal(false);

  let iframeRef: any;

  onMount(() => {
    setIframeUrl(
      buildIframeUrl({
        publicKey: props.publicKey,
      })
    );
    setIsLoaded(true);
    setPendingMap(createPendingRequestsMap());
    const frame: PayConductorFrame = {
      iframe: iframeRef,
      get isReady() {
        return isReady();
      },
      get error() {
        return error();
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
        confirmPayment(iframeRef, pendingMap(), options),
      validate: (data: unknown) =>
        validatePayment(iframeRef, pendingMap(), data),
      reset: () => resetPayment(iframeRef, pendingMap()),
      getSelectedPaymentMethod: () => selectedPaymentMethod(),
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod(),
    };
    const sendConfigToIframe = async () => {
      if (!configSent() && iframeRef) {
        setConfigSent(true);
        sendConfig(iframeRef, pendingMap(), {
          intentToken: props.intentToken,
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
          defaultPaymentMethod: props.defaultPaymentMethod,
          showPaymentButtons: props.showPaymentButtons,
        });
      }
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        pendingMap(),
        (val) => {
          setIsReady(val);
          if (val) {
            sendConfigToIframe();
          }
        },
        (val) => {
          setError(val);
        },
        props.onReady,
        props.onError,
        (data) => props.onPaymentComplete?.(data as PaymentResult),
        (data) => props.onPaymentFailed?.(data as PaymentResult),
        (data) => props.onPaymentPending?.(data as PaymentResult),
        (method) => {
          setSelectedPaymentMethod(method);
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
    <>
      <div
        class="payconductor"
        id="payconductor"
        style={{
          width: "100%",
          position: "relative",
        }}
      >
        {props.children}
        <Show when={isLoaded()}>
          <iframe
            allow="payment"
            title="PayConductor"
            ref={iframeRef!}
            src={iframeUrl()}
            style={{
              width: "100%",
              height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
              border: "none",
            }}
          ></iframe>
        </Show>
      </div>
    </>
  );
}

export default PayConductor;
