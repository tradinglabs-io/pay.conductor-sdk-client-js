<template>
  <div
    id="payconductor"
    class="payconductor"
    :style="{
      width: '100%',
      position: 'relative',
    }"
  >
    <slot />
    <template v-if="isLoaded">
      <iframe
        title="PayConductor"
        allow="payment"
        ref="iframeRef"
        :src="iframeUrl"
        :style="{
          width: '100%',
          height: height || IFRAME_DEFAULT_HEIGHT,
          border: 'none',
        }"
      ></iframe>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

export default defineComponent({
  name: "pay-conductor",

  props: [
    "clientId",
    "token",
    "theme",
    "locale",
    "onReady",
    "onError",
    "onPaymentComplete",
    "height",
  ],

  data() {
    return {
      isLoaded: false,
      isReady: false,
      error: null,
      iframeUrl: "",
      pendingMap: null,
      IFRAME_DEFAULT_HEIGHT,
    };
  },

  mounted() {
    this.iframeUrl = buildIframeUrl({
      clientId: this.clientId,
      token: this.token,
      theme: this.theme,
      locale: this.locale,
    });
    this.isLoaded = true;
    this.pendingMap = createPendingRequestsMap();
    const frame: PayConductorFrame = {
      iframe: this.$refs.iframeRef,
      get isReady() {
        return this.isReady;
      },
      get error() {
        return this.error;
      },
    };
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(this.$refs.iframeRef, this.pendingMap, options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(this.$refs.iframeRef, this.pendingMap, paymentMethodId),
      validate: (data: any) =>
        validatePayment(this.$refs.iframeRef, this.pendingMap, data),
      reset: () => resetPayment(this.$refs.iframeRef, this.pendingMap),
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: this.clientId,
        token: this.token,
        theme: this.theme,
        locale: this.locale,
      },
      api,
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        this.pendingMap,
        (val) => (this.isReady = val),
        (val) => (this.error = val),
        this.onReady,
        this.onError,
        this.onPaymentComplete
      );
    };
    window.addEventListener("message", eventHandler);
  },
});
</script>