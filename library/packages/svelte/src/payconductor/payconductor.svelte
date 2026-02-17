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

  export let clientId: PayConductorEmbedProps["clientId"];
  export let token: PayConductorEmbedProps["token"];
  export let theme: PayConductorEmbedProps["theme"] = undefined;
  export let locale: PayConductorEmbedProps["locale"] = undefined;
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

  onMount(() => {
    iframeUrl = buildIframeUrl({
      clientId: clientId,
      token: token,
      theme: theme,
      locale: locale,
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
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef, pendingMap, options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(iframeRef, pendingMap, paymentMethodId),
      validate: (data: any) => validatePayment(iframeRef, pendingMap, data),
      reset: () => resetPayment(iframeRef, pendingMap),
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: clientId,
        token: token,
        theme: theme,
        locale: locale,
      },
      api,
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        pendingMap,
        (val) => (isReady = val),
        (val) => (error = val),
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
  id="payconductor"
  class="payconductor"
>
  <slot />
  {#if isLoaded}
    <iframe
      style={stringifyStyles({
        width: "100%",
        height: height || IFRAME_DEFAULT_HEIGHT,
        border: "none",
      })}
      title="PayConductor"
      allow="payment"
      bind:this={iframeRef}
      src={iframeUrl}
    />
  {/if}
</div>