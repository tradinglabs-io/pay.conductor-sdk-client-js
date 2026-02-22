"use client";
import * as React from "react";
import { useState, useEffect } from "react";

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
  const [isLoaded, setIsLoaded] = useState<PayConductorState["isLoaded"]>(
    () => false
  );

  const [isReady, setIsReady] = useState<PayConductorState["isReady"]>(
    () => false
  );

  const [error, setError] = useState<PayConductorState["error"]>(() => null);

  const [iframeUrl, setIframeUrl] = useState<PayConductorState["iframeUrl"]>(
    () => ""
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PayConductorState["selectedPaymentMethod"]
  >(() => null);

  useEffect(() => {
    const log = (...args: any[]) => {
      if (props.debug) console.log("[PayConductor]", ...args);
    };
    const iframeUrl = buildIframeUrl({
      publicKey: props.publicKey,
    });
    setIframeUrl(iframeUrl);
    setIsLoaded(true);
    const pendingMap: Map<string, PendingRequest> = createPendingRequestsMap();
    let configSent = false;
    log("init", props.publicKey);
    log("iframeUrl", iframeUrl);
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
      get iframe(): HTMLIFrameElement | null {
        return (
          (document.querySelector(
            ".payconductor-element iframe"
          ) as HTMLIFrameElement) ?? null
        );
      },
      set iframe(_: HTMLIFrameElement | Element | unknown | null) {},
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
        log("→ CONFIRM_PAYMENT", {
          orderId: options.orderId,
        });
        return confirmPayment(getIframe(), pendingMap, options);
      },
      validate: (data: unknown) => {
        log("→ VALIDATE", data);
        return validatePayment(getIframe(), pendingMap, data);
      },
      reset: () => {
        log("→ RESET");
        return resetPayment(getIframe(), pendingMap);
      },
      getSelectedPaymentMethod: () => selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod,
    };
    log("registered");
    window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor,
      })
    );
    const sendConfigToIframe = async () => {
      if (!configSent) {
        const iframe = getIframe();
        if (!iframe) {
          log("→ CONFIG skipped: iframe not found");
          return;
        }
        configSent = true;
        log("→ CONFIG", {
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
      if (event.data?.type) {
        log("←", event.data.type, event.data.data ?? "");
      }
      handleMessageEvent(
        event,
        pendingMap,
        (val) => {
          setIsReady(val);
          frame.isReady = val;
          if (window.PayConductor?.frame)
            window.PayConductor.frame.isReady = val;
          if (val) sendConfigToIframe();
        },
        (val) => {
          setError(val);
          frame.error = val;
          if (window.PayConductor?.frame) window.PayConductor.frame.error = val;
        },
        () => {
          props.onReady?.();
        },
        (err) => {
          props.onError?.(err);
        },
        (data) => {
          props.onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          props.onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          props.onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          setSelectedPaymentMethod(method);
          if (window.PayConductor)
            window.PayConductor.selectedPaymentMethod = method;
          props.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
    const setupIframeLoadListener = () => {
      const el = getIframe();
      if (!el) return false;
      el.addEventListener("load", () => sendConfigToIframe(), {
        once: true,
      });
      return true;
    };
    if (!setupIframeLoadListener()) {
      const iframeObserver = new MutationObserver(() => {
        if (setupIframeLoadListener()) iframeObserver.disconnect();
      });
      iframeObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }, []);

  return (
    <div
      className="payconductor"
      id="payconductor"
      style={{
        display: "contents",
      }}
    >
      {props.children}
    </div>
  );
}

export default PayConductor;
