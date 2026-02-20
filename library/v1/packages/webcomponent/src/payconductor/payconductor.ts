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

/**
 * Usage:
 *
 *  <pay-conductor></pay-conductor>
 *
 */
class PayConductor extends HTMLElement {
  get _iframeRef() {
    return this._root.querySelector("[data-ref='PayConductor-iframeRef']");
  }

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
      pendingMap: null,
      selectedPaymentMethod: null,
      configSent: false,
    };
    if (!this.props) {
      this.props = {};
    }

    this.componentProps = [
      "publicKey",
      "intentToken",
      "theme",
      "locale",
      "paymentMethods",
      "defaultPaymentMethod",
      "showPaymentButtons",
      "onReady",
      "onError",
      "onPaymentComplete",
      "onPaymentFailed",
      "onPaymentPending",
      "onPaymentMethodSelected",
      "children",
      "height",
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
        <template data-el="show-pay-conductor">
          <iframe
            allow="payment"
            title="PayConductor"
            data-el="iframe-pay-conductor-1"
            data-ref="PayConductor-iframeRef"
          ></iframe>
        </template>
      </div>`;
    this.pendingUpdate = true;

    this.render();
    this.onMount();
    this.pendingUpdate = false;
    this.update();
  }

  showContent(el) {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement/content
    // grabs the content of a node that is between <template> tags
    // iterates through child nodes to register all content including text elements
    // attaches the content after the template

    const elementFragment = el.content.cloneNode(true);
    const children = Array.from(elementFragment.childNodes);
    children.forEach((child) => {
      if (el?.scope) {
        child.scope = el.scope;
      }
      if (el?.context) {
        child.context = el.context;
      }
      this.nodesToDestroy.push(child);
    });
    el.after(elementFragment);
  }

  onMount() {
    // onMount
    this.state.iframeUrl = buildIframeUrl({
      publicKey: this.props.publicKey,
    });
    this.update();
    this.state.isLoaded = true;
    this.update();
    this.state.pendingMap = createPendingRequestsMap();
    this.update();
    const frame: PayConductorFrame = {
      iframe: self._iframeRef,
      get isReady() {
        return this.state.isReady;
      },
      get error() {
        return this.state.error;
      },
    };
    const config: PayConductorConfig = {
      publicKey: this.props.publicKey,
      intentToken: this.props.intentToken,
      theme: this.props.theme,
      locale: this.props.locale,
      paymentMethods: this.props.paymentMethods,
      defaultPaymentMethod: this.props.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) =>
        confirmPayment(self._iframeRef, this.state.pendingMap, options),
      validate: (data: unknown) =>
        validatePayment(self._iframeRef, this.state.pendingMap, data),
      reset: () => resetPayment(self._iframeRef, this.state.pendingMap),
      getSelectedPaymentMethod: () => this.state.selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: this.state.selectedPaymentMethod,
    };
    const sendConfigToIframe = async () => {
      if (!this.state.configSent && self._iframeRef) {
        this.state.configSent = true;
        this.update();
        sendConfig(self._iframeRef, this.state.pendingMap, {
          intentToken: this.props.intentToken,
          theme: this.props.theme,
          locale: this.props.locale,
          paymentMethods: this.props.paymentMethods,
          defaultPaymentMethod: this.props.defaultPaymentMethod,
          showPaymentButtons: this.props.showPaymentButtons,
        });
      }
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        this.state.pendingMap,
        (val) => {
          this.state.isReady = val;
          this.update();
          if (val) {
            sendConfigToIframe();
          }
        },
        (val) => {
          this.state.error = val;
          this.update();
        },
        this.props.onReady,
        this.props.onError,
        (data) => this.props.onPaymentComplete?.(data as PaymentResult),
        (data) => this.props.onPaymentFailed?.(data as PaymentResult),
        (data) => this.props.onPaymentPending?.(data as PaymentResult),
        (method) => {
          this.state.selectedPaymentMethod = method;
          this.update();
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
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
          width: "100%",
          position: "relative",
        });
      });

    this._root
      .querySelectorAll("[data-el='show-pay-conductor']")
      .forEach((el) => {
        const whenCondition = this.state.isLoaded;
        if (whenCondition) {
          this.showContent(el);
        }
      });

    this._root
      .querySelectorAll("[data-el='iframe-pay-conductor-1']")
      .forEach((el) => {
        el.setAttribute("src", this.state.iframeUrl);
        Object.assign(el.style, {
          width: "100%",
          height: this.props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
          border: "none",
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
