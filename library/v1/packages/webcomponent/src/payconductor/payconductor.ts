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

/**
 * Usage:
 *
 *  <pay-conductor></pay-conductor>
 *
 */
class PayConductor extends HTMLElement {
  get _root() {
    return this.shadowRoot || this;
  }

  constructor() {
    super();
    const self = this;

    this.state = {
      isLoaded: false,
      isReady: false,
      error: null,
      iframeUrl: "",
      selectedPaymentMethod: null,
    };
    if (!this.props) {
      this.props = {};
    }

    this.componentProps = [
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
      "children",
    ];

    // used to keep track of all nodes created by show/for
    this.nodesToDestroy = [];
    // batch updates
    this.pendingUpdate = false;

    if (undefined) {
      this.attachShadow({ mode: "open" });
    }
  }

  destroyAnyNodes() {
    // destroy current view template refs before rendering again
    this.nodesToDestroy.forEach((el) => el.remove());
    this.nodesToDestroy = [];
  }

  connectedCallback() {
    this.getAttributeNames().forEach((attr) => {
      const jsVar = attr.replace(/-/g, "");
      const regexp = new RegExp(jsVar, "i");
      this.componentProps.forEach((prop) => {
        if (regexp.test(prop)) {
          const attrValue = this.getAttribute(attr);
          if (this.props[prop] !== attrValue) {
            this.props[prop] = attrValue;
          }
        }
      });
    });

    this._root.innerHTML = `
      <div class="payconductor" id="payconductor" data-el="div-pay-conductor-1">
        <slot></slot>
      </div>`;
    this.pendingUpdate = true;

    this.render();
    this.onMount();
    this.pendingUpdate = false;
    this.update();
  }

  onMount() {
    // onMount
    const log = (...args: any[]) => {
      if (this.props.debug) console.log("[PayConductor]", ...args);
    };
    const iframeUrl = buildIframeUrl({
      publicKey: this.props.publicKey,
    });
    this.state.iframeUrl = iframeUrl;
    this.update();
    this.state.isLoaded = true;
    this.update();
    const pendingMap: Map<string, PendingRequest> = createPendingRequestsMap();
    let configSent = false;
    log("init", this.props.publicKey);
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
      get iframe(): HTMLIFrameElement | null {
        return (
          (document.querySelector(
            ".payconductor-element iframe"
          ) as HTMLIFrameElement) ?? null
        );
      },
      set iframe(_: HTMLIFrameElement | Element | unknown | null) {},
      iframeUrl,
      isReady: false,
      error: null,
    };
    const config: PayConductorConfig = {
      publicKey: this.props.publicKey,
      theme: this.props.theme,
      locale: this.props.locale,
      paymentMethods: this.props.paymentMethods,
      defaultPaymentMethod: this.props.defaultPaymentMethod,
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
      getSelectedPaymentMethod: () => this.state.selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: this.state.selectedPaymentMethod,
    };
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
          theme: this.props.theme,
          locale: this.props.locale,
          paymentMethods: this.props.paymentMethods,
          defaultPaymentMethod: this.props.defaultPaymentMethod,
          showPaymentButtons: this.props.showPaymentButtons,
        });
        sendConfig(iframe, pendingMap, {
          theme: this.props.theme,
          locale: this.props.locale,
          paymentMethods: this.props.paymentMethods,
          defaultPaymentMethod: this.props.defaultPaymentMethod,
          showPaymentButtons: this.props.showPaymentButtons,
          nuPayConfig: this.props.nuPayConfig,
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
          this.state.isReady = val;
          this.update();
          frame.isReady = val;
          if (window.PayConductor?.frame)
            window.PayConductor.frame.isReady = val;
          if (val) sendConfigToIframe();
        },
        (val) => {
          this.state.error = val;
          this.update();
          frame.error = val;
          if (window.PayConductor?.frame) window.PayConductor.frame.error = val;
        },
        () => {
          this.props.onReady?.();
        },
        (err) => {
          this.props.onError?.(err);
        },
        (data) => {
          this.props.onPaymentComplete?.(data as PaymentResult);
        },
        (data) => {
          this.props.onPaymentFailed?.(data as PaymentResult);
        },
        (data) => {
          this.props.onPaymentPending?.(data as PaymentResult);
        },
        (method) => {
          this.state.selectedPaymentMethod = method;
          this.update();
          if (window.PayConductor)
            window.PayConductor.selectedPaymentMethod = method;
          this.props.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
  }

  onUpdate() {}

  update() {
    if (this.pendingUpdate === true) {
      return;
    }
    this.pendingUpdate = true;
    this.render();
    this.onUpdate();
    this.pendingUpdate = false;
  }

  render() {
    // re-rendering needs to ensure that all nodes generated by for/show are refreshed
    this.destroyAnyNodes();
    this.updateBindings();
  }

  updateBindings() {
    this._root
      .querySelectorAll("[data-el='div-pay-conductor-1']")
      .forEach((el) => {
        Object.assign(el.style, {
          display: "contents",
        });
      });
  }

  // Helper to render content
  renderTextNode(el, text) {
    const textNode = document.createTextNode(text);
    if (el?.scope) {
      textNode.scope = el.scope;
    }
    if (el?.context) {
      textNode.context = el.context;
    }
    el.after(textNode);
    this.nodesToDestroy.push(el.nextSibling);
  }
}

customElements.define("pay-conductor", PayConductor);
