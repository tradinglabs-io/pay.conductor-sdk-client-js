export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

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
    };
    if (!this.props) {
      this.props = {};
    }

    this.componentProps = [
      "clientId",
      "token",
      "theme",
      "locale",
      "onReady",
      "onError",
      "onPaymentComplete",
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
      <div id="payconductor" class="payconductor" data-el="div-pay-conductor-1">
        <slot></slot>
        <template data-el="show-pay-conductor">
          <iframe
            title="PayConductor"
            allow="payment"
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
      clientId: this.props.clientId,
      token: this.props.token,
      theme: this.props.theme,
      locale: this.props.locale,
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
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(self._iframeRef, this.state.pendingMap, options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(self._iframeRef, this.state.pendingMap, paymentMethodId),
      validate: (data: any) =>
        validatePayment(self._iframeRef, this.state.pendingMap, data),
      reset: () => resetPayment(self._iframeRef, this.state.pendingMap),
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: this.props.clientId,
        token: this.props.token,
        theme: this.props.theme,
        locale: this.props.locale,
      },
      api,
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        this.state.pendingMap,
        (val) => {
          var _temp;
          return (_temp = this.state.isReady = val), this.update(), _temp;
        },
        (val) => {
          var _temp2;
          return (_temp2 = this.state.error = val), this.update(), _temp2;
        },
        this.props.onReady,
        this.props.onError,
        this.props.onPaymentComplete
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
          height: this.props.height || IFRAME_DEFAULT_HEIGHT,
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
