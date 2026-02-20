<script context="module"></script>

<script>import { onMount } from "svelte";
import { IFRAME_DEFAULT_HEIGHT } from "./constants";
import { buildIframeUrl } from "./utils";
import {
  PayConductorConfig,
  PaymentResult,
  CreatePaymentMethodOptions,
  PayConductorState,
  PayConductorFrame
} from "./types";
import {
  createPendingRequestsMap,
  createPaymentMethod,
  confirmPayment,
  validatePayment,
  resetPayment,
  handleMessageEvent,
  PendingRequest
} from "./internal";
export let clientId;
export let token;
export let theme = void 0;
export let locale = void 0;
export let onReady = void 0;
export let onError = void 0;
export let onPaymentComplete = void 0;
export let height = void 0;
function stringifyStyles(stylesObj) {
  let styles = "";
  for (let key in stylesObj) {
    const dashedKey = key.replace(/[A-Z]/g, function(match) {
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
    clientId,
    token,
    theme,
    locale
  });
  isLoaded = true;
  pendingMap = createPendingRequestsMap();
  const frame = {
    iframe: iframeRef,
    get isReady() {
      return isReady;
    },
    get error() {
      return error;
    }
  };
  const api = {
    createPaymentMethod: (options) => createPaymentMethod(iframeRef, pendingMap, options),
    confirmPayment: (paymentMethodId) => confirmPayment(iframeRef, pendingMap, paymentMethodId),
    validate: (data) => validatePayment(iframeRef, pendingMap, data),
    reset: () => resetPayment(iframeRef, pendingMap)
  };
  window.__payConductor = {
    frame,
    config: {
      clientId,
      token,
      theme,
      locale
    },
    api
  };
  const eventHandler = (event) => {
    handleMessageEvent(
      event,
      pendingMap,
      (val) => isReady = val,
      (val) => error = val,
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