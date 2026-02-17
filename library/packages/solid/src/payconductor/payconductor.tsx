import { Show, onMount, createSignal, createMemo } from "solid-js";

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

import { IFRAME_DEFAULT_HEIGHT } from "./constants";
import { buildIframeUrl } from "./utils";
import {
  PayConductorConfig,
  PaymentResult,
  CreatePaymentMethodOptions,
  PayConductorState,
  PayConductorFrame,
} from "./types";
import {
  createPendingRequestsMap,
  createPaymentMethod,
  confirmPayment,
  validatePayment,
  resetPayment,
  handleMessageEvent,
  PendingRequest,
} from "./internal";

function PayConductor(props: PayConductorEmbedProps) {
  const [isLoaded, setIsLoaded] = createSignal(false);

  const [isReady, setIsReady] = createSignal(false);

  const [error, setError] = createSignal(null);

  const [iframeUrl, setIframeUrl] = createSignal("");

  const [pendingMap, setPendingMap] = createSignal(null);

  let iframeRef: HTMLIFrameElement;

  onMount(() => {
    setIframeUrl(
      buildIframeUrl({
        clientId: props.clientId,
        token: props.token,
        theme: props.theme,
        locale: props.locale,
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
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef, pendingMap(), options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(iframeRef, pendingMap(), paymentMethodId),
      validate: (data: any) => validatePayment(iframeRef, pendingMap(), data),
      reset: () => resetPayment(iframeRef, pendingMap()),
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
        pendingMap(),
        (val) => setIsReady(val),
        (val) => setError(val),
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
            title="PayConductor"
            allow="payment"
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
