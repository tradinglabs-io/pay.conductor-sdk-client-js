<script context="module" lang="ts">
  export interface PayConductorEmbedProps extends PayConductorConfig {
    height?: string;
    children?: any;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onPaymentComplete?: (result: PaymentResult) => void;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

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

  export let publicKey: PayConductorEmbedProps["publicKey"];
  export let intentToken: PayConductorEmbedProps["intentToken"] = undefined;
  export let theme: PayConductorEmbedProps["theme"] = undefined;
  export let locale: PayConductorEmbedProps["locale"] = undefined;
  export let paymentMethods: PayConductorEmbedProps["paymentMethods"] =
    undefined;
  export let onReady: PayConductorEmbedProps["onReady"] = undefined;
  export let onError: PayConductorEmbedProps["onError"] = undefined;
  export let onPaymentComplete: PayConductorEmbedProps["onPaymentComplete"] =
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
    };
    const api: PayConductorApi = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef, pendingMap, options),
      confirmPayment: (options: ConfirmPaymentOptions) =>
        confirmPayment(iframeRef, pendingMap, options),
      validate: (data: any) => validatePayment(iframeRef, pendingMap, data),
      reset: () => resetPayment(iframeRef, pendingMap),
    };
    window.PayConductor = {
      frame,
      config,
      api,
    };
    const sendConfigToIframe = async () => {
      if (!configSent && iframeRef) {
        configSent = true;
        sendConfig(iframeRef, pendingMap, {
          intentToken: intentToken,
          theme: theme,
          locale: locale,
          paymentMethods: paymentMethods,
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
        onPaymentComplete
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
        height: height || IFRAME_DEFAULT_HEIGHT,
        border: "none",
      })}
      allow="payment"
      title="PayConductor"
      bind:this={iframeRef}
      src={iframeUrl}
    />
  {/if}
</div>