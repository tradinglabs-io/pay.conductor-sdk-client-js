import { onMount, createSignal, createMemo } from "solid-js";

export interface PayConductorEmbedProps
  extends Omit<PayConductorConfig, "orderId"> {
  children?: any;
  showActionButtons?: boolean;
  debug?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
  onPaymentFailed?: (result: PaymentResult) => void;
  onPaymentPending?: (result: PaymentResult) => void;
  onPaymentMethodSelected?: (method: PaymentMethod) => void;
}

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

  const [selectedPaymentMethod, setSelectedPaymentMethod] = createSignal(null);

  onMount(() => {
    const log = (...args: any[]) => {
      if (props.debug) {
        console.log("[PayConductor]", ...args);
      }
    };
    log("SDK initializing", {
      publicKey: props.publicKey,
    });
    const iframeUrl = buildIframeUrl({
      publicKey: props.publicKey,
    });
    setIframeUrl(iframeUrl);
    setIsLoaded(true);
    const pendingMap: Map<string, PendingRequest> = createPendingRequestsMap();
    let configSent = false;
    log("iframeUrl built:", iframeUrl);
    log("pendingMap created");
    const getIframe = (): HTMLIFrameElement | undefined => {
      const ref = window.PayConductor?.frame?.iframe;
      if (ref) {
        if (ref instanceof HTMLIFrameElement) return ref;
        if (typeof ref === "object" && ref !== null) {
          if ("current" in ref) return (ref as any).current ?? undefined;
          if ("value" in ref) return (ref as any).value ?? undefined;
        }
        return ref as HTMLIFrameElement;
      }
      return (
        (document.querySelector(
          ".payconductor-element iframe"
        ) as HTMLIFrameElement) ?? undefined
      );
    };
    const frame: PayConductorFrame = {
      iframe: null,
      iframeUrl,
      isReady: false,
      error: null,
    };
    const config: PayConductorConfig = {
      publicKey: props.publicKey,
      theme: props.theme,
      locale: props.locale,
      paymentMethods: props.paymentMethods,
      defaultPaymentMethod: props.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { orderId: string }) => {
        log("confirmPayment called", {
          orderId: options.orderId,
        });
        return confirmPayment(getIframe(), pendingMap, options);
      },
      validate: (data: unknown) => {
        log("validate called", data);
        return validatePayment(getIframe(), pendingMap, data);
      },
      reset: () => {
        log("reset called");
        return resetPayment(getIframe(), pendingMap);
      },
      getSelectedPaymentMethod: () => selectedPaymentMethod(),
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod(),
    };
    log("window.PayConductor registered");
    window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor,
      })
    );
    const sendConfigToIframe = async () => {
      if (!configSent) {
        const iframe = getIframe();
        if (!iframe) {
          log("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        configSent = true;
        log("sendConfig →", {
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
          defaultPaymentMethod: props.defaultPaymentMethod,
          showPaymentButtons: props.showPaymentButtons,
        });
        sendConfig(iframe, pendingMap, {
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
        pendingMap,
        (val) => {
          setIsReady(val);
          frame.isReady = val;
          if (window.PayConductor && window.PayConductor.frame)
            window.PayConductor.frame.isReady = val;
          if (val) {
            log("iframe Ready — sending config");
            sendConfigToIframe();
          }
        },
        (val) => {
          setError(val);
          frame.error = val;
          if (window.PayConductor && window.PayConductor.frame)
            window.PayConductor.frame.error = val;
          log("iframe Error:", val);
        },
        () => {
          log("onReady fired");
          props.onReady?.();
        },
        (err) => {
          log("onError fired:", err);
          props.onError?.(err);
        },
        (data) => {
          log("PaymentComplete:", data);
          props.onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentFailed:", data);
          props.onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentPending:", data);
          props.onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          log("PaymentMethodSelected:", method);
          setSelectedPaymentMethod(method);
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          props.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
    log("SDK initialized — waiting for PayConductorCheckoutElement");
  });

  return (
    <>
      <div
        class="payconductor"
        id="payconductor"
        style={{
          display: "contents",
        }}
      >
        {props.children}
      </div>
    </>
  );
}

export default PayConductor;
