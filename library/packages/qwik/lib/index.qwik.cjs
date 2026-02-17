"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const qwik = require("@builder.io/qwik");
const IFRAME_BASE_URL = "https://iframe.payconductor.ai";
const ALLOWED_ORIGINS = [
  "https://iframe.payconductor.ai"
];
const DEFAULT_LOCALE = "pt-BR";
const IFRAME_DEFAULT_HEIGHT = "600px";
const REQUEST_TIMEOUT = 3e4;
const MESSAGE_TYPES = {
  INIT: "INIT",
  CREATE_PAYMENT_METHOD: "CREATE_PAYMENT_METHOD",
  CONFIRM_PAYMENT: "CONFIRM_PAYMENT",
  VALIDATE: "VALIDATE",
  RESET: "RESET",
  READY: "READY",
  ERROR: "ERROR",
  PAYMENT_METHOD_CREATED: "PAYMENT_METHOD_CREATED",
  PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
  VALIDATION_ERROR: "VALIDATION_ERROR"
};
const ERROR_CODES = {
  INVALID_CLIENT: "invalid_client",
  INVALID_TOKEN: "invalid_token",
  NETWORK_ERROR: "network_error",
  IFRAME_NOT_READY: "iframe_not_ready",
  PAYMENT_DECLINED: "payment_declined",
  VALIDATION_ERROR: "validation_error",
  TIMEOUT: "timeout"
};
function buildIframeUrl(config) {
  const params = new URLSearchParams({
    clientId: config.clientId,
    token: config.token,
    locale: config.locale || DEFAULT_LOCALE
  });
  if (config.theme)
    params.set("theme", JSON.stringify(config.theme));
  return `${IFRAME_BASE_URL}?${params.toString()}`;
}
function generateRequestId() {
  return crypto.randomUUID();
}
function isValidOrigin(origin, allowedOrigins) {
  return allowedOrigins.includes(origin);
}
function mergeTheme(userTheme, defaultTheme) {
  return {
    ...defaultTheme,
    ...userTheme,
    fontSize: {
      ...defaultTheme.fontSize,
      ...userTheme.fontSize
    },
    fontWeight: {
      ...defaultTheme.fontWeight,
      ...userTheme.fontWeight
    },
    spacing: {
      ...defaultTheme.spacing,
      ...userTheme.spacing
    }
  };
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
function createPaymentMethod(iframe, pendingMap, options) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CREATE_PAYMENT_METHOD, options);
}
function confirmPayment(iframe, pendingMap, paymentMethodId) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
    paymentMethodId
  });
}
function validatePayment(iframe, pendingMap, data) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.VALIDATE, data);
}
function resetPayment(iframe, pendingMap) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.RESET);
}
function handleMessageEvent(event, pendingMap, setIsReady, setError, onReady, onError, onPaymentComplete) {
  if (!isValidOrigin(event.origin, ALLOWED_ORIGINS))
    return;
  const payload = event.data;
  const { requestId, type, data, error } = payload;
  if (requestId && pendingMap?.has(requestId)) {
    const { resolve, reject } = pendingMap.get(requestId);
    pendingMap.delete(requestId);
    if (error)
      reject(new Error(error.message));
    else
      resolve(data);
    return;
  }
  switch (type) {
    case MESSAGE_TYPES.READY:
      setIsReady(true);
      onReady?.();
      break;
    case MESSAGE_TYPES.ERROR:
      setError(error?.message || "Unknown error");
      onError?.(new Error(error?.message));
      break;
    case MESSAGE_TYPES.PAYMENT_COMPLETE:
      onPaymentComplete?.(data);
      break;
  }
}
const PayConductor = /* @__PURE__ */ qwik.componentQrl(/* @__PURE__ */ qwik.inlinedQrl((props) => {
  const iframeRef = qwik.useSignal();
  const state = qwik.useStore({
    error: null,
    iframeUrl: "",
    isLoaded: false,
    isReady: false,
    pendingMap: null
  });
  qwik.useVisibleTaskQrl(/* @__PURE__ */ qwik.inlinedQrl(() => {
    const [iframeRef2, props2, state2] = qwik.useLexicalScope();
    state2.iframeUrl = buildIframeUrl({
      clientId: props2.clientId,
      token: props2.token,
      theme: props2.theme,
      locale: props2.locale
    });
    state2.isLoaded = true;
    state2.pendingMap = createPendingRequestsMap();
    const frame = {
      iframe: iframeRef2,
      get isReady() {
        return state2.isReady;
      },
      get error() {
        return state2.error;
      }
    };
    const api = {
      createPaymentMethod: (options) => createPaymentMethod(iframeRef2.value, state2.pendingMap, options),
      confirmPayment: (paymentMethodId) => confirmPayment(iframeRef2.value, state2.pendingMap, paymentMethodId),
      validate: (data) => validatePayment(iframeRef2.value, state2.pendingMap, data),
      reset: () => resetPayment(iframeRef2.value, state2.pendingMap)
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: props2.clientId,
        token: props2.token,
        theme: props2.theme,
        locale: props2.locale
      },
      api
    };
    const eventHandler = (event) => {
      handleMessageEvent(event, state2.pendingMap, (val) => state2.isReady = val, (val) => state2.error = val, props2.onReady, props2.onError, props2.onPaymentComplete);
    };
    window.addEventListener("message", eventHandler);
  }, "PayConductor_component_useVisibleTask_HdmlbVXcugE", [
    iframeRef,
    props,
    state
  ]));
  return /* @__PURE__ */ qwik._jsxQ("div", null, {
    class: "payconductor",
    id: "payconductor",
    style: {
      width: "100%",
      position: "relative"
    }
  }, [
    /* @__PURE__ */ qwik._jsxC(qwik.Slot, null, 3, "yV_0"),
    state.isLoaded ? /* @__PURE__ */ qwik._jsxQ("iframe", {
      ref: iframeRef,
      style: {
        width: "100%",
        height: props.height || IFRAME_DEFAULT_HEIGHT,
        border: "none"
      }
    }, {
      allow: "payment",
      src: qwik._fnSignal((p0) => p0.iframeUrl, [
        state
      ], "p0.iframeUrl"),
      title: "PayConductor"
    }, null, 3, "yV_1") : null
  ], 1, "yV_2");
}, "PayConductor_component_Z7pfAdPFFAM"));
function usePayconductor() {
  if (typeof window !== "undefined")
    return window.__payConductor || null;
  return null;
}
function useFrame() {
  const ctx = typeof window !== "undefined" ? window.__payConductor : null;
  return ctx?.frame || {
    iframe: null,
    isReady: false,
    error: null
  };
}
function usePayment() {
  const ctx = typeof window !== "undefined" ? window.__payConductor : null;
  if (!ctx)
    return {
      createPaymentMethod: async () => {
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
      }
    };
  return {
    createPaymentMethod: ctx.api.createPaymentMethod,
    confirmPayment: ctx.api.confirmPayment,
    validate: ctx.api.validate,
    reset: ctx.api.reset
  };
}
exports.ALLOWED_ORIGINS = ALLOWED_ORIGINS;
exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
exports.ERROR_CODES = ERROR_CODES;
exports.IFRAME_BASE_URL = IFRAME_BASE_URL;
exports.IFRAME_DEFAULT_HEIGHT = IFRAME_DEFAULT_HEIGHT;
exports.MESSAGE_TYPES = MESSAGE_TYPES;
exports.PayConductor = PayConductor;
exports.REQUEST_TIMEOUT = REQUEST_TIMEOUT;
exports.buildIframeUrl = buildIframeUrl;
exports.default = PayConductor;
exports.generateRequestId = generateRequestId;
exports.isValidOrigin = isValidOrigin;
exports.mergeTheme = mergeTheme;
exports.useFrame = useFrame;
exports.usePayconductor = usePayconductor;
exports.usePayment = usePayment;
