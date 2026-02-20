import { Show, onMount, createSignal, createMemo } from "solid-js";

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

import { IFRAME_DEFAULT_HEIGHT, MESSAGE_TYPES } from "./constants";
import {
  confirmPayment,
  createPaymentMethod,
  createPendingRequestsMap,
  handleMessageEvent,
  PendingRequest,
  resetPayment,
  sendConfig,
  validatePayment,
} from "./internal";
import type {
  ConfirmPaymentOptions,
  CreatePaymentMethodOptions,
  PayConductorApi,
  PayConductorConfig,
  PayConductorFrame,
  PayConductorState,
  PaymentResult,
} from "./types";
import { buildIframeUrl } from "./utils";

function PayConductor(props: PayConductorEmbedProps) {
  const [isLoaded, setIsLoaded] = createSignal(false);

  const [isReady, setIsReady] = createSignal(false);

  const [error, setError] = createSignal(null);

  const [iframeUrl, setIframeUrl] = createSignal("");

  const [pendingMap, setPendingMap] = createSignal(null);

  const [configSent, setConfigSent] = createSignal(false);

  let iframeRef: HTMLIFrameElement;

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
    };
    const api: PayConductorApi = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef, pendingMap(), options),
      confirmPayment: (options: ConfirmPaymentOptions) =>
        confirmPayment(iframeRef, pendingMap(), options),
      validate: (data: any) => validatePayment(iframeRef, pendingMap(), data),
      reset: () => resetPayment(iframeRef, pendingMap()),
    };
    window.PayConductor = {
      frame,
      config,
      api,
    };
    const sendConfigToIframe = async () => {
      if (!configSent() && iframeRef) {
        setConfigSent(true);
        sendConfig(iframeRef, pendingMap(), {
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
        props.onPaymentComplete
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
              height: props.height || IFRAME_DEFAULT_HEIGHT,
              border: "none",
            }}
          ></iframe>
        </Show>
      </div>
    </>
  );
}

export default PayConductor;
