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
          height: height || IFRAME_DEFAULT_HEIGHT_VALUE,
          border: 'none',
        }"
      ></iframe>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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

export default defineComponent({
  name: "pay-conductor",

  props: [
    "publicKey",
    "intentToken",
    "theme",
    "locale",
    "paymentMethods",
    "defaultPaymentMethod",
    "showPaymentButtons",
    "nuPayConfig",
    "onReady",
    "onError",
    "onPaymentComplete",
    "onPaymentFailed",
    "onPaymentPending",
    "onPaymentMethodSelected",
    "height",
  ],

  data() {
    return {
      isLoaded: false,
      isReady: false,
      error: null,
      iframeUrl: "",
      pendingMap: null,
      selectedPaymentMethod: null,
      configSent: false,
      IFRAME_DEFAULT_HEIGHT_VALUE,
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
      defaultPaymentMethod: this.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) =>
        confirmPayment(this.$refs.iframeRef, this.pendingMap, options),
      validate: (data: unknown) =>
        validatePayment(this.$refs.iframeRef, this.pendingMap, data),
      reset: () => resetPayment(this.$refs.iframeRef, this.pendingMap),
      getSelectedPaymentMethod: () => this.selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: this.selectedPaymentMethod,
    };
    const sendConfigToIframe = async () => {
      if (!this.configSent && this.$refs.iframeRef) {
        this.configSent = true;
        sendConfig(this.$refs.iframeRef, this.pendingMap, {
          intentToken: this.intentToken,
          theme: this.theme,
          locale: this.locale,
          paymentMethods: this.paymentMethods,
          defaultPaymentMethod: this.defaultPaymentMethod,
          showPaymentButtons: this.showPaymentButtons,
          nuPayConfig: this.nuPayConfig,
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
        (data) => this.onPaymentComplete?.(data as PaymentResult),
        (data) => this.onPaymentFailed?.(data as PaymentResult),
        (data) => this.onPaymentPending?.(data as PaymentResult),
        (method) => {
          this.selectedPaymentMethod = method;
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          this.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
  },
});
</script>