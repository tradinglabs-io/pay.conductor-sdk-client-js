"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const qwik = require("@builder.io/qwik");
const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "5175");
const IFRAME_BASE_URL = isDev ? "http://localhost:5175" : "https://iframe.payconductor.ai";
const ALLOWED_ORIGINS = isDev ? [
  "http://localhost:5175"
] : [
  "https://iframe.payconductor.ai"
];
const DEFAULT_LOCALE = "pt-BR";
const IFRAME_DEFAULT_HEIGHT = "600px";
const REQUEST_TIMEOUT = 3e4;
const MESSAGE_TYPES = {
  INIT: "INIT",
  CONFIG: "CONFIG",
  UPDATE: "UPDATE",
  SUBMIT: "SUBMIT",
  CREATE_PAYMENT_METHOD: "CREATE_PAYMENT_METHOD",
  CREATE_PIX_PAYMENT: "CREATE_PIX_PAYMENT",
  CREATE_NUPAY_PAYMENT: "CREATE_NUPAY_PAYMENT",
  CREATE_GOOGLE_PAYMENT: "CREATE_GOOGLE_PAYMENT",
  CREATE_APPLE_PAYMENT: "CREATE_APPLE_PAYMENT",
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
function createPaymentMethod(iframe, pendingMap, options) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CREATE_PAYMENT_METHOD, options);
}
function confirmPayment(iframe, pendingMap, options) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
    intentToken: options.intentToken,
    returnUrl: options.returnUrl
  });
}
function validatePayment(iframe, pendingMap, data) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.VALIDATE, data);
}
function resetPayment(iframe, pendingMap) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.RESET);
}
function submitPayment(iframe, pendingMap) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.SUBMIT);
}
function sendConfig(iframe, pendingMap, config) {
  return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIG, config);
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
    configSent: false,
    error: null,
    iframeUrl: "",
    isLoaded: false,
    isReady: false,
    pendingMap: null
  });
  qwik.useVisibleTaskQrl(/* @__PURE__ */ qwik.inlinedQrl(() => {
    const [iframeRef2, props2, state2] = qwik.useLexicalScope();
    state2.iframeUrl = buildIframeUrl({
      publicKey: props2.publicKey
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
    const config = {
      publicKey: props2.publicKey,
      intentToken: props2.intentToken,
      theme: props2.theme,
      locale: props2.locale,
      paymentMethods: props2.paymentMethods
    };
    const api = {
      createPaymentMethod: (options) => createPaymentMethod(iframeRef2.value, state2.pendingMap, options),
      confirmPayment: (options) => confirmPayment(iframeRef2.value, state2.pendingMap, options),
      validate: (data) => validatePayment(iframeRef2.value, state2.pendingMap, data),
      reset: () => resetPayment(iframeRef2.value, state2.pendingMap)
    };
    window.__PAY_CONDUCTOR__ = {
      frame,
      config,
      api
    };
    const sendConfigToIframe = async () => {
      if (!state2.configSent && iframeRef2.value) {
        state2.configSent = true;
        sendConfig(iframeRef2.value, state2.pendingMap, {
          intentToken: props2.intentToken,
          theme: props2.theme,
          locale: props2.locale,
          paymentMethods: props2.paymentMethods
        });
      }
    };
    const eventHandler = (event) => {
      handleMessageEvent(event, state2.pendingMap, (val) => {
        state2.isReady = val;
        if (val)
          sendConfigToIframe();
      }, (val) => {
        state2.error = val;
      }, props2.onReady, props2.onError, props2.onPaymentComplete);
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
function usePayConductor() {
  const ctx = typeof window !== "undefined" ? window.__PAY_CONDUCTOR__ : null;
  const config = ctx?.config ? {
    publicKey: ctx.config.publicKey,
    intentToken: ctx.config.intentToken,
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
function useElement() {
  const ctx = typeof window !== "undefined" ? window.__PAY_CONDUCTOR__ : null;
  const getIframe = () => {
    if (!ctx?.frame?.iframe)
      return null;
    const iframeRef = ctx.frame.iframe;
    return iframeRef?.value || null;
  };
  const sendToIframe = (type, data) => {
    const iframe = getIframe();
    if (iframe?.contentWindow)
      iframe.contentWindow.postMessage({
        type,
        data
      }, "*");
  };
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
      },
      updateConfig: () => {
        throw new Error("PayConductor not initialized");
      },
      updateIntentToken: () => {
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
    createPaymentMethod: ctx.api.createPaymentMethod,
    confirmPayment: async (options) => {
      const iframe = getIframe();
      const pendingMap = createPendingRequestsMap();
      if (!options.intentToken)
        throw new Error("Intent token is required");
      return sendMessageToIframe(iframe || void 0, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
        intentToken: options.intentToken,
        returnUrl: options.returnUrl
      });
    },
    validate: ctx.api.validate,
    reset: ctx.api.reset,
    updateConfig: (config) => {
      const currentConfig = ctx.config;
      sendToIframe(MESSAGE_TYPES.CONFIG, {
        publicKey: currentConfig?.publicKey,
        intentToken: currentConfig?.intentToken,
        theme: config.theme ?? currentConfig?.theme,
        locale: config.locale ?? currentConfig?.locale,
        paymentMethods: config.paymentMethods ?? currentConfig?.paymentMethods
      });
    },
    updateIntentToken: (intentToken) => {
      const currentConfig = ctx.config;
      sendToIframe(MESSAGE_TYPES.CONFIG, {
        publicKey: currentConfig?.publicKey,
        intentToken,
        theme: currentConfig?.theme,
        locale: currentConfig?.locale,
        paymentMethods: currentConfig?.paymentMethods
      });
    },
    update: (options) => {
      sendToIframe(MESSAGE_TYPES.UPDATE, options);
    },
    submit: async () => {
      const iframe = getIframe();
      const pendingMap = createPendingRequestsMap();
      try {
        return await submitPayment(iframe || void 0, pendingMap);
      } catch (error) {
        return {
          error: {
            message: error.message || "Payment failed",
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
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
exports.useElement = useElement;
exports.usePayConductor = usePayConductor;
