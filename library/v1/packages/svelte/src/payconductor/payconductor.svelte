<script context="module" lang="ts">
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
</script>

<script lang="ts">
  import { onMount } from "svelte";

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

  export let debug: PayConductorEmbedProps["debug"] = undefined;
  export let publicKey: PayConductorEmbedProps["publicKey"];
  export let theme: PayConductorEmbedProps["theme"] = undefined;
  export let locale: PayConductorEmbedProps["locale"] = undefined;
  export let paymentMethods: PayConductorEmbedProps["paymentMethods"] =
    undefined;
  export let defaultPaymentMethod: PayConductorEmbedProps["defaultPaymentMethod"] =
    undefined;
  export let showPaymentButtons: PayConductorEmbedProps["showPaymentButtons"] =
    undefined;
  export let nuPayConfig: PayConductorEmbedProps["nuPayConfig"] = undefined;
  export let onReady: PayConductorEmbedProps["onReady"] = undefined;
  export let onError: PayConductorEmbedProps["onError"] = undefined;
  export let onPaymentComplete: PayConductorEmbedProps["onPaymentComplete"] =
    undefined;
  export let onPaymentFailed: PayConductorEmbedProps["onPaymentFailed"] =
    undefined;
  export let onPaymentPending: PayConductorEmbedProps["onPaymentPending"] =
    undefined;
  export let onPaymentMethodSelected: PayConductorEmbedProps["onPaymentMethodSelected"] =
    undefined;

  function stringifyStyles(stylesObj) {
    let styles = "";
    for (let key in stylesObj) {
      const dashedKey = key.replace(/[A-Z]/g, function (match) {
        return "-" + match.toLowerCase();
      });
      styles += dashedKey + ":" + stylesObj[key] + ";";
    }
    return styles;
  }

  let isLoaded = false;
  let isReady = false;
  let error = null;
  let iframeUrl = "";
  let selectedPaymentMethod = null;

  onMount(() => {
    const log = (...args: any[]) => {
      if (debug) console.log("[PayConductor]", ...args);
    };
    const iframeUrl = buildIframeUrl({
      publicKey: publicKey,
    });
    iframeUrl = iframeUrl;
    isLoaded = true;
    const pendingMap: Map<string, PendingRequest> = createPendingRequestsMap();
    let configSent = false;
    log("init", publicKey);
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
      iframe: null,
      iframeUrl,
      isReady: false,
      error: null,
    };
    const config: PayConductorConfig = {
      publicKey: publicKey,
      theme: theme,
      locale: locale,
      paymentMethods: paymentMethods,
      defaultPaymentMethod: defaultPaymentMethod,
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
    const existingIframe = document.querySelector(
      ".payconductor-element iframe"
    ) as HTMLIFrameElement;
    if (existingIframe) frame.iframe = existingIframe;
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
          theme: theme,
          locale: locale,
          paymentMethods: paymentMethods,
          defaultPaymentMethod: defaultPaymentMethod,
          showPaymentButtons: showPaymentButtons,
        });
        sendConfig(iframe, pendingMap, {
          theme: theme,
          locale: locale,
          paymentMethods: paymentMethods,
          defaultPaymentMethod: defaultPaymentMethod,
          showPaymentButtons: showPaymentButtons,
          nuPayConfig: nuPayConfig,
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
          isReady = val;
          frame.isReady = val;
          if (window.PayConductor?.frame)
            window.PayConductor.frame.isReady = val;
          if (val) sendConfigToIframe();
        },
        (val) => {
          error = val;
          frame.error = val;
          if (window.PayConductor?.frame) window.PayConductor.frame.error = val;
        },
        () => {
          onReady?.();
        },
        (err) => {
          onError?.(err);
        },
        (data) => {
          onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          selectedPaymentMethod = method;
          if (window.PayConductor)
            window.PayConductor.selectedPaymentMethod = method;
          onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
  });
</script>

<div
  style={stringifyStyles({
    display: "contents",
  })}
  class="payconductor"
  id="payconductor"
>
  <slot />
</div>