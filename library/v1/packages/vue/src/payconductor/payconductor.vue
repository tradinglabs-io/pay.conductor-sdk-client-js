<template>
  <div
    class="payconductor"
    id="payconductor"
    :style="{
      display: 'contents',
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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

export default defineComponent({
  name: "pay-conductor",

  props: [
    "debug",
    "publicKey",
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
    };
  },

  mounted() {
    const log = (...args: any[]) => {
      if (this.debug) {
        console.log("[PayConductor]", ...args);
      }
    };
    log("SDK initializing", {
      publicKey: this.publicKey,
    });
    const iframeUrl = buildIframeUrl({
      publicKey: this.publicKey,
    });
    this.iframeUrl = iframeUrl;
    this.isLoaded = true;
    this.pendingMap = createPendingRequestsMap();
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
        return this.isReady;
      },
      get error() {
        return this.error;
      },
    };
    const config: PayConductorConfig = {
      publicKey: this.publicKey,
      theme: this.theme,
      locale: this.locale,
      paymentMethods: this.paymentMethods,
      defaultPaymentMethod: this.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { orderId: string }) => {
        log("confirmPayment called", {
          orderId: options.orderId,
        });
        return confirmPayment(getIframe(), this.pendingMap, options);
      },
      validate: (data: unknown) => {
        log("validate called", data);
        return validatePayment(getIframe(), this.pendingMap, data);
      },
      reset: () => {
        log("reset called");
        return resetPayment(getIframe(), this.pendingMap);
      },
      getSelectedPaymentMethod: () => this.selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: this.selectedPaymentMethod,
    };
    log("window.PayConductor registered");
    window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor,
      })
    );
    const sendConfigToIframe = async () => {
      if (!this.configSent) {
        const iframe = getIframe();
        if (!iframe) {
          log("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        this.configSent = true;
        log("sendConfig →", {
          theme: this.theme,
          locale: this.locale,
          paymentMethods: this.paymentMethods,
          defaultPaymentMethod: this.defaultPaymentMethod,
          showPaymentButtons: this.showPaymentButtons,
        });
        sendConfig(iframe, this.pendingMap, {
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
            log("iframe Ready — sending config");
            sendConfigToIframe();
          }
        },
        (val) => {
          this.error = val;
          log("iframe Error:", val);
        },
        () => {
          log("onReady fired");
          this.onReady?.();
        },
        (err) => {
          log("onError fired:", err);
          this.onError?.(err);
        },
        (data) => {
          log("PaymentComplete:", data);
          this.onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentFailed:", data);
          this.onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          log("PaymentPending:", data);
          this.onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          log("PaymentMethodSelected:", method);
          this.selectedPaymentMethod = method;
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          this.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
    log("SDK initialized — waiting for PayConductorCheckoutElement");
  },
});
</script>