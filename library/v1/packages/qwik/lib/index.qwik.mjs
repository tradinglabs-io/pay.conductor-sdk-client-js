import { componentQrl, inlinedQrl, useStore, useVisibleTaskQrl, useLexicalScope, _jsxQ, _jsxC, Slot, useSignal, _fnSignal } from "@builder.io/qwik";
const IFRAME_BASE_URL_PROD = "https://iframe.payconductor.ai/v1";
const IFRAME_BASE_URL_DEV = "http://localhost:5175";
const REQUEST_TIMEOUT_MS = 3e4;
const IFRAME_DEFAULT_HEIGHT = "600px";
let PaymentMethod;
(function(PaymentMethod2) {
  PaymentMethod2["Pix"] = "Pix";
  PaymentMethod2["CreditCard"] = "CreditCard";
  PaymentMethod2["DebitCard"] = "DebitCard";
  PaymentMethod2["BankSlip"] = "BankSlip";
  PaymentMethod2["Crypto"] = "Crypto";
  PaymentMethod2["ApplePay"] = "ApplePay";
  PaymentMethod2["NuPay"] = "NuPay";
  PaymentMethod2["PicPay"] = "PicPay";
  PaymentMethod2["AmazonPay"] = "AmazonPay";
  PaymentMethod2["SepaDebit"] = "SepaDebit";
  PaymentMethod2["GooglePay"] = "GooglePay";
})(PaymentMethod || (PaymentMethod = {}));
let PaymentMethodLayout;
(function(PaymentMethodLayout2) {
  PaymentMethodLayout2["Grid"] = "grid";
  PaymentMethodLayout2["Vertical"] = "vertical";
  PaymentMethodLayout2["Horizontal"] = "horizontal";
})(PaymentMethodLayout || (PaymentMethodLayout = {}));
let PaymentStatus;
(function(PaymentStatus2) {
  PaymentStatus2["Succeeded"] = "succeeded";
  PaymentStatus2["Pending"] = "pending";
  PaymentStatus2["Failed"] = "failed";
})(PaymentStatus || (PaymentStatus = {}));
let DeviceType;
(function(DeviceType2) {
  DeviceType2["Android"] = "android";
  DeviceType2["IOS"] = "ios";
  DeviceType2["Web"] = "web";
})(DeviceType || (DeviceType = {}));
let InputStyleKey;
(function(InputStyleKey2) {
  InputStyleKey2["Padding"] = "padding";
  InputStyleKey2["Radius"] = "radius";
  InputStyleKey2["Color"] = "color";
  InputStyleKey2["Background"] = "background";
  InputStyleKey2["Shadow"] = "shadow";
})(InputStyleKey || (InputStyleKey = {}));
let OutgoingMessage;
(function(OutgoingMessage2) {
  OutgoingMessage2["Init"] = "Init";
  OutgoingMessage2["Config"] = "Config";
  OutgoingMessage2["Update"] = "Update";
  OutgoingMessage2["ConfirmPayment"] = "ConfirmPayment";
  OutgoingMessage2["Validate"] = "Validate";
  OutgoingMessage2["Reset"] = "Reset";
})(OutgoingMessage || (OutgoingMessage = {}));
let IncomingMessage;
(function(IncomingMessage2) {
  IncomingMessage2["Ready"] = "Ready";
  IncomingMessage2["Error"] = "Error";
  IncomingMessage2["PaymentComplete"] = "PaymentComplete";
  IncomingMessage2["PaymentFailed"] = "PaymentFailed";
  IncomingMessage2["PaymentPending"] = "PaymentPending";
  IncomingMessage2["ValidationError"] = "ValidationError";
  IncomingMessage2["PaymentMethodSelected"] = "PaymentMethodSelected";
})(IncomingMessage || (IncomingMessage = {}));
let ErrorCode;
(function(ErrorCode2) {
  ErrorCode2["InvalidClient"] = "InvalidClient";
  ErrorCode2["InvalidToken"] = "InvalidToken";
  ErrorCode2["NetworkError"] = "NetworkError";
  ErrorCode2["IframeNotReady"] = "IframeNotReady";
  ErrorCode2["PaymentDeclined"] = "PaymentDeclined";
  ErrorCode2["ValidationError"] = "ValidationError";
  ErrorCode2["Timeout"] = "Timeout";
})(ErrorCode || (ErrorCode = {}));
const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const IFRAME_BASE_URL = isDev ? IFRAME_BASE_URL_DEV : IFRAME_BASE_URL_PROD;
const ALLOWED_ORIGINS = [
  IFRAME_BASE_URL_DEV,
  IFRAME_BASE_URL_PROD
];
const IFRAME_DEFAULT_HEIGHT_VALUE = IFRAME_DEFAULT_HEIGHT;
const REQUEST_TIMEOUT = REQUEST_TIMEOUT_MS;
const POST_MESSAGES = {
  INIT: OutgoingMessage.Init,
  CONFIG: OutgoingMessage.Config,
  UPDATE: OutgoingMessage.Update,
  CONFIRM_PAYMENT: OutgoingMessage.ConfirmPayment,
  VALIDATE: OutgoingMessage.Validate,
  RESET: OutgoingMessage.Reset,
  READY: IncomingMessage.Ready,
  ERROR: IncomingMessage.Error,
  PAYMENT_COMPLETE: IncomingMessage.PaymentComplete,
  PAYMENT_FAILED: IncomingMessage.PaymentFailed,
  PAYMENT_PENDING: IncomingMessage.PaymentPending,
  VALIDATION_ERROR: IncomingMessage.ValidationError,
  PAYMENT_METHOD_SELECTED: IncomingMessage.PaymentMethodSelected
};
const ERROR_CODES = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function buildIframeUrl(config) {
  const params = new URLSearchParams({
    publicKey: config.publicKey
  });
  return `${IFRAME_BASE_URL}?${params.toString()}`;
}
function generateRequestId() {
  return crypto.randomUUID();
}
function isValidOrigin(origin, allowedOrigins) {
  return allowedOrigins.includes(origin);
}
function createPendingRequestsMap() {
  return /* @__PURE__ */ new Map();
}
function sendMessageToIframe(iframe, pendingMap, type, data) {
  return new Promise((resolve, reject) => {
    if (!iframe || !("contentWindow" in iframe)) {
      reject(new Error("Iframe not defined"));
      return;
    }
    if (!iframe?.contentWindow) {
      reject(new Error("Iframe not ready"));
      return;
    }
    if (!pendingMap) {
      reject(new Error("Pending requests not initialized"));
      return;
    }
    const requestId = generateRequestId();
    pendingMap.set(requestId, {
      resolve,
      reject
    });
    iframe.contentWindow.postMessage({
      type,
      data,
      requestId
    }, "*");
    setTimeout(() => {
      if (pendingMap?.has(requestId)) {
        pendingMap.delete(requestId);
        reject(new Error("Request timeout"));
      }
    }, REQUEST_TIMEOUT);
  });
}
function confirmPayment(iframe, pendingMap, options) {
  return sendMessageToIframe(iframe, pendingMap, POST_MESSAGES.CONFIRM_PAYMENT, {
    orderId: options.orderId
  });
}
function validatePayment(iframe, pendingMap, data) {
  return sendMessageToIframe(iframe, pendingMap, POST_MESSAGES.VALIDATE, data);
}
function resetPayment(iframe, pendingMap) {
  return sendMessageToIframe(iframe, pendingMap, POST_MESSAGES.RESET);
}
function sendConfig(iframe, pendingMap, config) {
  return sendMessageToIframe(iframe, pendingMap, POST_MESSAGES.CONFIG, config);
}
function sendInit(iframe, pendingMap, config) {
  return sendMessageToIframe(iframe, pendingMap, POST_MESSAGES.INIT, config);
}
function handleMessageEvent(event, pendingMap, setIsReady, setError, onReady, onError, onPaymentComplete, onPaymentFailed, onPaymentPending, onPaymentMethodSelected) {
  if (!isValidOrigin(event.origin, ALLOWED_ORIGINS))
    return;
  const payload = event.data;
  const { requestId, type, data, error } = payload;
  if (requestId && pendingMap?.has(requestId)) {
    const { resolve, reject } = pendingMap.get(requestId);
    pendingMap.delete(requestId);
    if (error)
      reject(new Error(String(error.message)));
    else
      resolve(data);
    return;
  }
  if (type === POST_MESSAGES.READY) {
    setIsReady(true);
    onReady?.();
    return;
  }
  if (type === POST_MESSAGES.ERROR) {
    setError(error?.message || "Unknown error");
    onError?.(new Error(String(error?.message)));
    return;
  }
  if (type === POST_MESSAGES.PAYMENT_COMPLETE) {
    if (data && typeof data === "object" && "status" in data)
      onPaymentComplete?.(data);
    return;
  }
  if (type === POST_MESSAGES.PAYMENT_FAILED) {
    if (data && typeof data === "object" && "status" in data)
      onPaymentFailed?.(data);
    return;
  }
  if (type === POST_MESSAGES.PAYMENT_PENDING) {
    if (data && typeof data === "object" && "status" in data)
      onPaymentPending?.(data);
    return;
  }
  if (type === POST_MESSAGES.PAYMENT_METHOD_SELECTED) {
    if (data && typeof data === "object" && "paymentMethod" in data)
      onPaymentMethodSelected?.(data.paymentMethod);
    return;
  }
}
const PayConductor = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl((props) => {
  const state = useStore({
    configSent: false,
    error: null,
    iframeUrl: "",
    isLoaded: false,
    isReady: false,
    pendingMap: null,
    selectedPaymentMethod: null
  });
  useVisibleTaskQrl(/* @__PURE__ */ inlinedQrl(() => {
    const [props2, state2] = useLexicalScope();
    const log = (...args) => {
      if (props2.debug)
        console.log("[PayConductor]", ...args);
    };
    log("SDK initializing", {
      publicKey: props2.publicKey
    });
    const iframeUrl = buildIframeUrl({
      publicKey: props2.publicKey
    });
    state2.iframeUrl = iframeUrl;
    state2.isLoaded = true;
    state2.pendingMap = createPendingRequestsMap();
    log("iframeUrl built:", iframeUrl);
    log("pendingMap created");
    const getIframe = () => {
      const ref = window.PayConductor?.frame?.iframe;
      if (!ref)
        return void 0;
      if (ref instanceof HTMLIFrameElement)
        return ref;
      if (typeof ref === "object" && ref !== null) {
        if ("current" in ref)
          return ref.current ?? void 0;
        if ("value" in ref)
          return ref.value ?? void 0;
      }
      return ref;
    };
    const frame = {
      iframe: null,
      iframeUrl,
      get isReady() {
        return state2.isReady;
      },
      get error() {
        return state2.error;
      }
    };
    const config = {
      publicKey: props2.publicKey,
      theme: props2.theme,
      locale: props2.locale,
      paymentMethods: props2.paymentMethods,
      defaultPaymentMethod: props2.defaultPaymentMethod
    };
    const api = {
      confirmPayment: (options) => {
        log("confirmPayment called", {
          orderId: options.orderId
        });
        return confirmPayment(getIframe(), state2.pendingMap, options);
      },
      validate: (data) => {
        log("validate called", data);
        return validatePayment(getIframe(), state2.pendingMap, data);
      },
      reset: () => {
        log("reset called");
        return resetPayment(getIframe(), state2.pendingMap);
      },
      getSelectedPaymentMethod: () => state2.selectedPaymentMethod
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: state2.selectedPaymentMethod
    };
    log("window.PayConductor registered");
    const sendConfigToIframe = async () => {
      if (!state2.configSent) {
        const iframe = getIframe();
        if (!iframe) {
          log("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        state2.configSent = true;
        log("sendConfig →", {
          theme: props2.theme,
          locale: props2.locale,
          paymentMethods: props2.paymentMethods,
          defaultPaymentMethod: props2.defaultPaymentMethod,
          showPaymentButtons: props2.showPaymentButtons
        });
        sendConfig(iframe, state2.pendingMap, {
          theme: props2.theme,
          locale: props2.locale,
          paymentMethods: props2.paymentMethods,
          defaultPaymentMethod: props2.defaultPaymentMethod,
          showPaymentButtons: props2.showPaymentButtons,
          nuPayConfig: props2.nuPayConfig
        });
      }
    };
    const eventHandler = (event) => {
      handleMessageEvent(event, state2.pendingMap, (val) => {
        state2.isReady = val;
        if (val) {
          log("iframe Ready — sending config");
          sendConfigToIframe();
        }
      }, (val) => {
        state2.error = val;
        log("iframe Error:", val);
      }, () => {
        log("onReady fired");
        props2.onReady?.();
      }, (err) => {
        log("onError fired:", err);
        props2.onError?.(err);
      }, (data) => {
        log("PaymentComplete:", data);
        props2.onPaymentComplete?.(data);
      }, (data) => {
        log("PaymentFailed:", data);
        props2.onPaymentFailed?.(data);
      }, (data) => {
        log("PaymentPending:", data);
        props2.onPaymentPending?.(data);
      }, (method) => {
        log("PaymentMethodSelected:", method);
        state2.selectedPaymentMethod = method;
        if (window.PayConductor)
          window.PayConductor.selectedPaymentMethod = method;
        props2.onPaymentMethodSelected?.(method);
      });
    };
    window.addEventListener("message", eventHandler);
    log("SDK initialized — waiting for PayConductorCheckoutElement");
  }, "PayConductor_component_useVisibleTask_qyZq2iJOwH0", [
    props,
    state
  ]));
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "payconductor",
    id: "payconductor",
    style: {
      display: "contents"
    }
  }, /* @__PURE__ */ _jsxC(Slot, null, 3, "Qx_0"), 1, "Qx_1");
}, "PayConductor_component_3FCCzbyilZQ"));
const PayConductorCheckoutElement = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl((props) => {
  const iframeRef = useSignal();
  const state = useStore({
    iframeUrl: "",
    isLoaded: false
  });
  useVisibleTaskQrl(/* @__PURE__ */ inlinedQrl(() => {
    const [iframeRef2, state2] = useLexicalScope();
    const ctx = typeof window !== "undefined" ? window.PayConductor : null;
    if (!ctx)
      console.warn("[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>");
    if (ctx?.frame) {
      state2.iframeUrl = ctx.frame.iframeUrl || "";
      ctx.frame.iframe = iframeRef2.value;
      console.log("[PayConductorCheckoutElement] iframe registered, src:", state2.iframeUrl);
    }
    state2.isLoaded = true;
  }, "PayConductorCheckoutElement_component_useVisibleTask_oDLKK0NDziI", [
    iframeRef,
    state
  ]));
  return /* @__PURE__ */ _jsxQ("div", null, {
    class: "payconductor-element",
    style: {
      width: "100%"
    }
  }, state.isLoaded && state.iframeUrl ? /* @__PURE__ */ _jsxQ("iframe", {
    ref: iframeRef,
    style: {
      width: "100%",
      height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
      border: "none"
    }
  }, {
    allow: "payment",
    src: _fnSignal((p0) => p0.iframeUrl, [
      state
    ], "p0.iframeUrl"),
    title: "PayConductor"
  }, null, 3, "oe_0") : null, 1, "oe_1");
}, "PayConductorCheckoutElement_component_GfpFgBlahhU"));
function usePayConductor() {
  const ctx = typeof window !== "undefined" ? window.PayConductor : null;
  const config = ctx?.config ? {
    publicKey: ctx.config.publicKey,
    orderId: ctx.config.orderId,
    theme: ctx.config.theme,
    locale: ctx.config.locale
  } : {};
  const frame = ctx?.frame ? {
    iframe: ctx.frame.iframe,
    isReady: ctx.frame.isReady,
    error: ctx.frame.error
  } : {
    iframe: null,
    isReady: false,
    error: null
  };
  return {
    ...config,
    ...frame
  };
}
function getIframeFromContext(ctx) {
  if (!ctx?.frame?.iframe)
    return null;
  const iframeRef = ctx.frame.iframe;
  if (iframeRef instanceof HTMLIFrameElement)
    return iframeRef;
  if (iframeRef && typeof iframeRef === "object" && "value" in iframeRef) {
    const value = iframeRef.value;
    if (value instanceof HTMLIFrameElement)
      return value;
  }
  return null;
}
function usePayconductorElement() {
  const ctx = typeof window !== "undefined" ? window.PayConductor : null;
  const sendToIframe = (type, data) => {
    if (!ctx)
      return;
    const iframe = getIframeFromContext(ctx);
    if (iframe?.contentWindow)
      iframe.contentWindow.postMessage({
        type,
        data
      }, "*");
  };
  if (!ctx)
    return {
      init: async () => {
        throw new Error("PayConductor not initialized");
      },
      confirmPayment: async () => {
        throw new Error("PayConductor not initialized");
      },
      validate: async () => {
        throw new Error("PayConductor not initialized");
      },
      reset: async () => {
        throw new Error("PayConductor not initialized");
      },
      getSelectedPaymentMethod: () => null,
      updateConfig: () => {
        throw new Error("PayConductor not initialized");
      },
      updateorderId: () => {
        throw new Error("PayConductor not initialized");
      },
      update: () => {
        throw new Error("PayConductor not initialized");
      },
      submit: async () => {
        throw new Error("PayConductor not initialized");
      }
    };
  return {
    init: async (config) => {
      const iframe = getIframeFromContext(ctx);
      const pendingMap = createPendingRequestsMap();
      return sendInit(iframe || void 0, pendingMap, config);
    },
    confirmPayment: async (options) => {
      const iframe = getIframeFromContext(ctx);
      const pendingMap = createPendingRequestsMap();
      if (!options.orderId)
        throw new Error("Order ID is required");
      return confirmPayment(iframe || void 0, pendingMap, options);
    },
    validate: ctx.api.validate,
    reset: ctx.api.reset,
    getSelectedPaymentMethod: () => {
      return ctx?.selectedPaymentMethod ?? null;
    },
    updateConfig: (config) => {
      const currentConfig = ctx.config;
      sendToIframe(POST_MESSAGES.CONFIG, {
        publicKey: currentConfig?.publicKey,
        orderId: currentConfig?.orderId,
        theme: config.theme ?? currentConfig?.theme,
        locale: config.locale ?? currentConfig?.locale,
        paymentMethods: config.paymentMethods ?? currentConfig?.paymentMethods
      });
    },
    updateorderId: (orderId) => {
      const currentConfig = ctx.config;
      sendToIframe(POST_MESSAGES.CONFIG, {
        publicKey: currentConfig?.publicKey,
        orderId,
        theme: currentConfig?.theme,
        locale: currentConfig?.locale,
        paymentMethods: currentConfig?.paymentMethods
      });
    },
    update: (options) => {
      sendToIframe(POST_MESSAGES.UPDATE, options);
    },
    submit: async () => {
      const iframe = getIframeFromContext(ctx);
      const pendingMap = createPendingRequestsMap();
      try {
        await sendMessageToIframe(iframe || void 0, pendingMap, POST_MESSAGES.CONFIRM_PAYMENT, {});
        return {
          paymentMethod: void 0
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Payment failed";
        return {
          error: {
            message,
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
  };
}
export {
  ALLOWED_ORIGINS,
  ERROR_CODES,
  IFRAME_BASE_URL,
  IFRAME_DEFAULT_HEIGHT_VALUE,
  POST_MESSAGES,
  PayConductor,
  PayConductorCheckoutElement,
  REQUEST_TIMEOUT,
  buildIframeUrl,
  PayConductor as default,
  generateRequestId,
  isValidOrigin,
  usePayConductor,
  usePayconductorElement
};
