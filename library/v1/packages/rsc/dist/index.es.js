"use client";
import { jsxs as F, jsx as k } from "react/jsx-runtime";
import { useRef as V, useState as m, useEffect as Y } from "react";
const C = "https://iframe.payconductor.ai", L = "http://localhost:5175", K = 3e4, G = "600px";
var P = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(P || {}), E = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(E || {});
const H = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "5175"), z = H ? L : C, q = [L, C], W = G, B = K, d = {
  INIT: P.Init,
  CONFIG: P.Config,
  UPDATE: P.Update,
  CONFIRM_PAYMENT: P.ConfirmPayment,
  VALIDATE: P.Validate,
  RESET: P.Reset,
  READY: E.Ready,
  ERROR: E.Error,
  PAYMENT_COMPLETE: E.PaymentComplete,
  PAYMENT_FAILED: E.PaymentFailed,
  PAYMENT_PENDING: E.PaymentPending,
  VALIDATION_ERROR: E.ValidationError,
  PAYMENT_METHOD_SELECTED: E.PaymentMethodSelected
}, ee = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function j(e) {
  const t = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${z}?${t.toString()}`;
}
function Q() {
  return crypto.randomUUID();
}
function $(e, t) {
  return t.includes(e);
}
function D() {
  return /* @__PURE__ */ new Map();
}
function A(e, t, o, n) {
  return new Promise((r, l) => {
    if (!e || !("contentWindow" in e)) {
      l(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      l(new Error("Iframe not ready"));
      return;
    }
    if (!t) {
      l(new Error("Pending requests not initialized"));
      return;
    }
    const u = Q();
    t.set(u, {
      resolve: r,
      reject: l
    }), e.contentWindow.postMessage({
      type: o,
      data: n,
      requestId: u
    }, "*"), setTimeout(() => {
      t != null && t.has(u) && (t.delete(u), l(new Error("Request timeout")));
    }, B);
  });
}
function O(e, t, o) {
  return A(e, t, d.CONFIRM_PAYMENT, {
    intentToken: o.intentToken
  });
}
function J(e, t, o) {
  return A(e, t, d.VALIDATE, o);
}
function X(e, t) {
  return A(e, t, d.RESET);
}
function Z(e, t, o) {
  return A(e, t, d.CONFIG, o);
}
function x(e, t, o, n, r, l, u, w, h, I) {
  if (!$(e.origin, q))
    return;
  const y = e.data, {
    requestId: T,
    type: f,
    data: a,
    error: s
  } = y;
  if (T && (t != null && t.has(T))) {
    const {
      resolve: _,
      reject: M
    } = t.get(T);
    t.delete(T), s ? M(new Error(s.message)) : _(a);
    return;
  }
  if (f === d.READY) {
    o(!0), r == null || r();
    return;
  }
  if (f === d.ERROR) {
    n((s == null ? void 0 : s.message) || "Unknown error"), l == null || l(new Error(s == null ? void 0 : s.message));
    return;
  }
  if (f === d.PAYMENT_COMPLETE) {
    a && typeof a == "object" && "status" in a && (u == null || u(a));
    return;
  }
  if (f === d.PAYMENT_FAILED) {
    a && typeof a == "object" && "status" in a && (w == null || w(a));
    return;
  }
  if (f === d.PAYMENT_PENDING) {
    a && typeof a == "object" && "status" in a && (h == null || h(a));
    return;
  }
  if (f === d.PAYMENT_METHOD_SELECTED) {
    a && typeof a == "object" && "paymentMethod" in a && (I == null || I(a.paymentMethod));
    return;
  }
}
function te(e) {
  const t = V(null), [o, n] = m(
    () => !1
  ), [r, l] = m(
    () => !1
  ), [u, w] = m(() => null), [h, I] = m(
    () => ""
  ), [y, T] = m(
    () => null
  ), [f, a] = m(() => null), [s, _] = m(() => !1);
  return Y(() => {
    I(
      j({
        publicKey: e.publicKey
      })
    ), n(!0), T(D());
    const M = {
      iframe: t.current,
      get isReady() {
        return r;
      },
      get error() {
        return u;
      }
    }, S = {
      publicKey: e.publicKey,
      intentToken: e.intentToken,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, U = {
      confirmPayment: (R) => O(t.current, y, R),
      validate: (R) => J(t.current, y, R),
      reset: () => X(t.current, y),
      getSelectedPaymentMethod: () => f
    };
    window.PayConductor = {
      frame: M,
      config: S,
      api: U,
      selectedPaymentMethod: f
    };
    const b = async () => {
      !s && t.current && (_(!0), Z(t.current, y, {
        intentToken: e.intentToken,
        theme: e.theme,
        locale: e.locale,
        paymentMethods: e.paymentMethods,
        defaultPaymentMethod: e.defaultPaymentMethod,
        showPaymentButtons: e.showPaymentButtons,
        nuPayConfig: e.nuPayConfig
      }));
    }, v = (R) => {
      x(
        R,
        y,
        (i) => {
          l(i), i && b();
        },
        (i) => {
          w(i);
        },
        e.onReady,
        e.onError,
        (i) => {
          var c;
          return (c = e.onPaymentComplete) == null ? void 0 : c.call(e, i);
        },
        (i) => {
          var c;
          return (c = e.onPaymentFailed) == null ? void 0 : c.call(e, i);
        },
        (i) => {
          var c;
          return (c = e.onPaymentPending) == null ? void 0 : c.call(e, i);
        },
        (i) => {
          var c;
          a(i), window.PayConductor && (window.PayConductor.selectedPaymentMethod = i), (c = e.onPaymentMethodSelected) == null || c.call(e, i);
        }
      );
    };
    window.addEventListener("message", v);
  }, []), /* @__PURE__ */ F(
    "div",
    {
      className: "payconductor",
      id: "payconductor",
      style: {
        width: "100%",
        position: "relative"
      },
      children: [
        e.children,
        o ? /* @__PURE__ */ k(
          "iframe",
          {
            allow: "payment",
            title: "PayConductor",
            ref: t,
            src: h,
            style: {
              width: "100%",
              height: e.height || W,
              border: "none"
            }
          }
        ) : null
      ]
    }
  );
}
function ne() {
  const e = typeof window < "u" ? window.PayConductor : null, t = e != null && e.config ? {
    publicKey: e.config.publicKey,
    intentToken: e.config.intentToken,
    theme: e.config.theme,
    locale: e.config.locale
  } : {}, o = e != null && e.frame ? {
    iframe: e.frame.iframe,
    isReady: e.frame.isReady,
    error: e.frame.error
  } : {
    iframe: null,
    isReady: !1,
    error: null
  };
  return {
    ...t,
    ...o
  };
}
function N(e) {
  var o;
  if (!((o = e == null ? void 0 : e.frame) != null && o.iframe)) return null;
  const t = e.frame.iframe;
  if (t instanceof HTMLIFrameElement)
    return t;
  if (t && typeof t == "object" && "value" in t) {
    const n = t.value;
    if (n instanceof HTMLIFrameElement)
      return n;
  }
  return null;
}
function oe() {
  const e = typeof window < "u" ? window.PayConductor : null, t = (o, n) => {
    if (!e) return;
    const r = N(e);
    r != null && r.contentWindow && r.contentWindow.postMessage({
      type: o,
      data: n
    }, "*");
  };
  return e ? {
    confirmPayment: async (o) => {
      const n = N(e), r = D();
      if (!o.intentToken)
        throw new Error("Intent token is required");
      return O(n || void 0, r, o);
    },
    validate: e.api.validate,
    reset: e.api.reset,
    getSelectedPaymentMethod: () => (e == null ? void 0 : e.selectedPaymentMethod) ?? null,
    updateConfig: (o) => {
      const n = e.config;
      t(d.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        intentToken: n == null ? void 0 : n.intentToken,
        theme: o.theme ?? (n == null ? void 0 : n.theme),
        locale: o.locale ?? (n == null ? void 0 : n.locale),
        paymentMethods: o.paymentMethods ?? (n == null ? void 0 : n.paymentMethods)
      });
    },
    updateIntentToken: (o) => {
      const n = e.config;
      t(d.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        intentToken: o,
        theme: n == null ? void 0 : n.theme,
        locale: n == null ? void 0 : n.locale,
        paymentMethods: n == null ? void 0 : n.paymentMethods
      });
    },
    update: (o) => {
      t(d.UPDATE, o);
    },
    submit: async () => {
      const o = N(e), n = D();
      try {
        return await A(o || void 0, n, d.CONFIRM_PAYMENT, {}), {
          paymentMethod: void 0
        };
      } catch (r) {
        return {
          error: {
            message: r instanceof Error ? r.message : "Payment failed",
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
  } : {
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
}
export {
  q as ALLOWED_ORIGINS,
  ee as ERROR_CODES,
  z as IFRAME_BASE_URL,
  W as IFRAME_DEFAULT_HEIGHT_VALUE,
  d as POST_MESSAGES,
  te as PayConductor,
  B as REQUEST_TIMEOUT,
  j as buildIframeUrl,
  te as default,
  Q as generateRequestId,
  $ as isValidOrigin,
  oe as useElement,
  ne as usePayConductor
};
//# sourceMappingURL=index.es.js.map
