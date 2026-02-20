<script context="module" lang="ts">
  export interface PayConductorEmbedProps
    extends Omit<PayConductorConfig, "intentToken"> {
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
  let pendingMap = null;
  let selectedPaymentMethod = null;
  let configSent = false;

  onMount(() => {
    const log = (...args: any[]) => {
      if (debug) {
        console.log("[PayConductor]", ...args);
      }
    };
    log("SDK initializing", {
      publicKey: publicKey,
    });
    const iframeUrl = buildIframeUrl({
      publicKey: publicKey,
    });
    iframeUrl = iframeUrl;
    isLoaded = true;
    pendingMap = createPendingRequestsMap();
    log("iframeUrl built:", iframeUrl);
    log("pendingMap created");
    const getIframe = (): HTMLIFrameElement | undefined => {
      const ref = window.PayConductor?.frame?.iframe;
      if (!ref) return undefined;
      if (ref instanceof HTMLIFrameElement) return ref;
      if (typeof ref === "object" && ref !== null) {
        if ("current" in ref) return (ref as any).current ?? undefined;
        if ("value" in ref) return (ref as any).value ?? undefined;
      }
      return ref as HTMLIFrameElement;
    };
    const frame: PayConductorFrame = {
      iframe: null,
      iframeUrl,
      get isReady() {
        return isReady;
      },
      get error() {
        return error;
      },
    };
    const config: PayConductorConfig = {
      publicKey: publicKey,
      theme: theme,
      locale: locale,
      paymentMethods: paymentMethods,
      defaultPaymentMethod: defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) => {
        log("confirmPayment called", {
          intentToken: options.intentToken,
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
      getSelectedPaymentMethod: () => selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod,
    };
    log("window.PayConductor registered");
    const sendConfigToIframe = async () => {
      if (!configSent) {
        const iframe = getIframe();
        if (!iframe) {
          log("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        configSent = true;
        log("sendConfig →", {
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
      handleMessageEvent(
        event,
        pendingMap,
        (val) => {
          isReady = val;
          if (val) {
            log("iframe Ready — sending config");
            sendConfigToIframe();
          }
        },
        (val) => {
          error = val;
          log("iframe Error:", val);
        },
        () => {
          log("onReady fired");
          onReady?.();
        },
        (err) => {
          log("onError fired:", err);
          onError?.(err);
        },
        (data) => {
          log("PaymentComplete:", data);
          onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentFailed:", data);
          onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentPending:", data);
          onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          log("PaymentMethodSelected:", method);
          selectedPaymentMethod = method;
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
    log("SDK initialized — waiting for PayConductorCheckoutElement");
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