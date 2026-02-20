<script context="module" lang="ts">
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
</script>

<script lang="ts">
  import { onMount } from "svelte";

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

  export let publicKey: PayConductorEmbedProps["publicKey"];
  export let intentToken: PayConductorEmbedProps["intentToken"] = undefined;
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

  export let height: PayConductorEmbedProps["height"] = undefined;
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

  let iframeRef;

  let isLoaded = false;
  let isReady = false;
  let error = null;
  let iframeUrl = "";
  let pendingMap = null;
  let selectedPaymentMethod = null;
  let configSent = false;

  onMount(() => {
    iframeUrl = buildIframeUrl({
      publicKey: publicKey,
    });
    isLoaded = true;
    pendingMap = createPendingRequestsMap();
    const frame: PayConductorFrame = {
      iframe: iframeRef,
      get isReady() {
        return isReady;
      },
      get error() {
        return error;
      },
    };
    const config: PayConductorConfig = {
      publicKey: publicKey,
      intentToken: intentToken,
      theme: theme,
      locale: locale,
      paymentMethods: paymentMethods,
      defaultPaymentMethod: defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) =>
        confirmPayment(iframeRef, pendingMap, options),
      validate: (data: unknown) => validatePayment(iframeRef, pendingMap, data),
      reset: () => resetPayment(iframeRef, pendingMap),
      getSelectedPaymentMethod: () => selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod,
    };
    const sendConfigToIframe = async () => {
      if (!configSent && iframeRef) {
        configSent = true;
        sendConfig(iframeRef, pendingMap, {
          intentToken: intentToken,
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
            sendConfigToIframe();
          }
        },
        (val) => {
          error = val;
        },
        onReady,
        onError,
        (data) => onPaymentComplete?.(data as PaymentResult),
        (data) => onPaymentFailed?.(data as PaymentResult),
        (data) => onPaymentPending?.(data as PaymentResult),
        (method) => {
          selectedPaymentMethod = method;
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
  });
</script>

<div
  style={stringifyStyles({
    width: "100%",
    position: "relative",
  })}
  class="payconductor"
  id="payconductor"
>
  <slot />
  {#if isLoaded}
    <iframe
      style={stringifyStyles({
        width: "100%",
        height: height || IFRAME_DEFAULT_HEIGHT_VALUE,
        border: "none",
      })}
      allow="payment"
      title="PayConductor"
      bind:this={iframeRef}
      src={iframeUrl}
    />
  {/if}
</div>