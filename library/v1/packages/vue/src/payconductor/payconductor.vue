<template>
  <div
    class="payconductor"
    id="payconductor"
    :style="{
      width: '100%',
      position: 'relative',
    }"
  >
    <slot />
    <template v-if="isLoaded">
      <iframe
        allow="payment"
        title="PayConductor"
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
    "publicKey",
    "intentToken",
    "theme",
    "locale",
    "paymentMethods",
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
      configSent: false,
      IFRAME_DEFAULT_HEIGHT,
    };
  },

  mounted() {
    this.iframeUrl = buildIframeUrl({
      publicKey: this.publicKey,
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
    const config: PayConductorConfig = {
      publicKey: this.publicKey,
      intentToken: this.intentToken,
      theme: this.theme,
      locale: this.locale,
      paymentMethods: this.paymentMethods,
    };
    const api: PayConductorApi = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(this.$refs.iframeRef, this.pendingMap, options),
      confirmPayment: (options: ConfirmPaymentOptions) =>
        confirmPayment(this.$refs.iframeRef, this.pendingMap, options),
      validate: (data: any) =>
        validatePayment(this.$refs.iframeRef, this.pendingMap, data),
      reset: () => resetPayment(this.$refs.iframeRef, this.pendingMap),
    };
    window.__PAY_CONDUCTOR__ = {
      frame,
      config,
      api,
    };
    const sendConfigToIframe = async () => {
      if (!this.configSent && this.$refs.iframeRef) {
        this.configSent = true;
        sendConfig(this.$refs.iframeRef, this.pendingMap, {
          intentToken: this.intentToken,
          theme: this.theme,
          locale: this.locale,
          paymentMethods: this.paymentMethods,
        });
      }
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        this.pendingMap,
        (val) => {
          this.isReady = val;
          if (val) {
            sendConfigToIframe();
          }
        },
        (val) => {
          this.error = val;
        },
        this.onReady,
        this.onError,
        this.onPaymentComplete
      );
    };
    window.addEventListener("message", eventHandler);
  },
});
</script>