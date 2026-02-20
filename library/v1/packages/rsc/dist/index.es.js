"use client";
import { jsx as L } from "react/jsx-runtime";
import { useState as E, useEffect as S, useRef as g } from "react";
const U = "https://iframe.payconductor.ai/v1", b = "http://localhost:5175", z = 3e4, G = "600px";
var I = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(I || {}), h = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(h || {});
const H = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"), k = H ? b : U, q = [b, U], B = G, W = z, f = {
  INIT: I.Init,
  CONFIG: I.Config,
  UPDATE: I.Update,
  CONFIRM_PAYMENT: I.ConfirmPayment,
  VALIDATE: I.Validate,
  RESET: I.Reset,
  READY: h.Ready,
  ERROR: h.Error,
  PAYMENT_COMPLETE: h.PaymentComplete,
  PAYMENT_FAILED: h.PaymentFailed,
  PAYMENT_PENDING: h.PaymentPending,
  VALIDATION_ERROR: h.ValidationError,
  PAYMENT_METHOD_SELECTED: h.PaymentMethodSelected
}, ne = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function j(e) {
  const n = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${k}?${n.toString()}`;
}
function Q() {
  return crypto.randomUUID();
}
function $(e, n) {
  return n.includes(e);
}
function N() {
  return /* @__PURE__ */ new Map();
}
function R(e, n, o, t) {
  return new Promise((i, m) => {
    if (!e || !("contentWindow" in e)) {
      m(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      m(new Error("Iframe not ready"));
      return;
    }
    if (!n) {
      m(new Error("Pending requests not initialized"));
      return;
    }
    const c = Q();
    n.set(c, {
      resolve: i,
      reject: m
    }), e.contentWindow.postMessage({
      type: o,
      data: t,
      requestId: c
    }, "*"), setTimeout(() => {
      n != null && n.has(c) && (n.delete(c), m(new Error("Request timeout")));
    }, W);
  });
}
function v(e, n, o) {
  return R(e, n, f.CONFIRM_PAYMENT, {
    orderId: o.orderId
  });
}
function J(e, n, o) {
  return R(e, n, f.VALIDATE, o);
}
function X(e, n) {
  return R(e, n, f.RESET);
}
function Z(e, n, o) {
  return R(e, n, f.CONFIG, o);
}
function x(e, n, o) {
  return R(e, n, f.INIT, o);
}
function p(e, n, o, t, i, m, c, C, T, y) {
  if (!$(e.origin, q))
    return;
  const D = e.data, {
    requestId: w,
    type: P,
    data: l,
    error: s
  } = D;
  if (w && (n != null && n.has(w))) {
    const {
      resolve: d,
      reject: M
    } = n.get(w);
    n.delete(w), s ? M(new Error(String(s.message))) : d(l);
    return;
  }
  if (P === f.READY) {
    o(!0), i == null || i();
    return;
  }
  if (P === f.ERROR) {
    t((s == null ? void 0 : s.message) || "Unknown error"), m == null || m(new Error(String(s == null ? void 0 : s.message)));
    return;
  }
  if (P === f.PAYMENT_COMPLETE) {
    l && typeof l == "object" && "status" in l && (c == null || c(l));
    return;
  }
  if (P === f.PAYMENT_FAILED) {
    l && typeof l == "object" && "status" in l && (C == null || C(l));
    return;
  }
  if (P === f.PAYMENT_PENDING) {
    l && typeof l == "object" && "status" in l && (T == null || T(l));
    return;
  }
  if (P === f.PAYMENT_METHOD_SELECTED) {
    l && typeof l == "object" && "paymentMethod" in l && (y == null || y(l.paymentMethod));
    return;
  }
}
function oe(e) {
  const [n, o] = E(
    () => !1
  ), [t, i] = E(
    () => !1
  ), [m, c] = E(() => null), [C, T] = E(
    () => ""
  ), [y, D] = E(
    () => null
  ), [w, P] = E(() => null), [l, s] = E(() => !1);
  return S(() => {
    const d = (...a) => {
      e.debug && console.log("[PayConductor]", ...a);
    };
    d("SDK initializing", {
      publicKey: e.publicKey
    });
    const M = j({
      publicKey: e.publicKey
    });
    T(M), o(!0), D(N()), d("iframeUrl built:", M), d("pendingMap created");
    const A = () => {
      var r, u;
      const a = (u = (r = window.PayConductor) == null ? void 0 : r.frame) == null ? void 0 : u.iframe;
      if (a) {
        if (a instanceof HTMLIFrameElement) return a;
        if (typeof a == "object" && a !== null) {
          if ("current" in a) return a.current ?? void 0;
          if ("value" in a) return a.value ?? void 0;
        }
        return a;
      }
    }, O = {
      iframe: null,
      iframeUrl: M,
      get isReady() {
        return t;
      },
      get error() {
        return m;
      }
    }, F = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, K = {
      confirmPayment: (a) => (d("confirmPayment called", {
        orderId: a.orderId
      }), v(A(), y, a)),
      validate: (a) => (d("validate called", a), J(A(), y, a)),
      reset: () => (d("reset called"), X(A(), y)),
      getSelectedPaymentMethod: () => w
    };
    window.PayConductor = {
      frame: O,
      config: F,
      api: K,
      selectedPaymentMethod: w
    }, d("window.PayConductor registered");
    const V = async () => {
      if (!l) {
        const a = A();
        if (!a) {
          d("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        s(!0), d("sendConfig →", {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons
        }), Z(a, y, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, Y = (a) => {
      p(
        a,
        y,
        (r) => {
          i(r), r && (d("iframe Ready — sending config"), V());
        },
        (r) => {
          c(r), d("iframe Error:", r);
        },
        () => {
          var r;
          d("onReady fired"), (r = e.onReady) == null || r.call(e);
        },
        (r) => {
          var u;
          d("onError fired:", r), (u = e.onError) == null || u.call(e, r);
        },
        (r) => {
          var u;
          d("PaymentComplete:", r), (u = e.onPaymentComplete) == null || u.call(e, r);
        },
        (r) => {
          var u;
          d("PaymentFailed:", r), (u = e.onPaymentFailed) == null || u.call(e, r);
        },
        (r) => {
          var u;
          d("PaymentPending:", r), (u = e.onPaymentPending) == null || u.call(e, r);
        },
        (r) => {
          var u;
          d("PaymentMethodSelected:", r), P(r), window.PayConductor && (window.PayConductor.selectedPaymentMethod = r), (u = e.onPaymentMethodSelected) == null || u.call(e, r);
        }
      );
    };
    window.addEventListener("message", Y), d("SDK initialized — waiting for PayConductorCheckoutElement");
  }, []), /* @__PURE__ */ L(
    "div",
    {
      className: "payconductor",
      id: "payconductor",
      style: {
        display: "contents"
      },
      children: e.children
    }
  );
}
function re(e) {
  const n = g(null), [o, t] = E(() => ""), [i, m] = E(() => !1);
  return S(() => {
    const c = typeof window < "u" ? window.PayConductor : null;
    c || console.warn(
      "[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>"
    ), c != null && c.frame && (t(c.frame.iframeUrl || ""), c.frame.iframe = n.current, console.log(
      "[PayConductorCheckoutElement] iframe registered, src:",
      o
    )), m(!0);
  }, []), /* @__PURE__ */ L(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: i && o ? /* @__PURE__ */ L(
        "iframe",
        {
          allow: "payment",
          title: "PayConductor",
          ref: n,
          src: o,
          style: {
            width: "100%",
            height: e.height || B,
            border: "none"
          }
        }
      ) : null
    }
  );
}
function ae() {
  const e = typeof window < "u" ? window.PayConductor : null, n = e != null && e.config ? {
    publicKey: e.config.publicKey,
    orderId: e.config.orderId,
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
    ...n,
    ...o
  };
}
function _(e) {
  var o;
  if (!((o = e == null ? void 0 : e.frame) != null && o.iframe)) return null;
  const n = e.frame.iframe;
  if (n instanceof HTMLIFrameElement)
    return n;
  if (n && typeof n == "object" && "value" in n) {
    const t = n.value;
    if (t instanceof HTMLIFrameElement)
      return t;
  }
  return null;
}
function ie() {
  const e = typeof window < "u" ? window.PayConductor : null, n = (o, t) => {
    if (!e) return;
    const i = _(e);
    i != null && i.contentWindow && i.contentWindow.postMessage({
      type: o,
      data: t
    }, "*");
  };
  return e ? {
    init: async (o) => {
      const t = _(e), i = N();
      return x(t || void 0, i, o);
    },
    confirmPayment: async (o) => {
      const t = _(e), i = N();
      if (!o.orderId)
        throw new Error("Order ID is required");
      return v(t || void 0, i, o);
    },
    validate: e.api.validate,
    reset: e.api.reset,
    getSelectedPaymentMethod: () => (e == null ? void 0 : e.selectedPaymentMethod) ?? null,
    updateConfig: (o) => {
      const t = e.config;
      n(f.CONFIG, {
        publicKey: t == null ? void 0 : t.publicKey,
        orderId: t == null ? void 0 : t.orderId,
        theme: o.theme ?? (t == null ? void 0 : t.theme),
        locale: o.locale ?? (t == null ? void 0 : t.locale),
        paymentMethods: o.paymentMethods ?? (t == null ? void 0 : t.paymentMethods)
      });
    },
    updateorderId: (o) => {
      const t = e.config;
      n(f.CONFIG, {
        publicKey: t == null ? void 0 : t.publicKey,
        orderId: o,
        theme: t == null ? void 0 : t.theme,
        locale: t == null ? void 0 : t.locale,
        paymentMethods: t == null ? void 0 : t.paymentMethods
      });
    },
    update: (o) => {
      n(f.UPDATE, o);
    },
    submit: async () => {
      const o = _(e), t = N();
      try {
        return await R(o || void 0, t, f.CONFIRM_PAYMENT, {}), {
          paymentMethod: void 0
        };
      } catch (i) {
        return {
          error: {
            message: i instanceof Error ? i.message : "Payment failed",
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
  } : {
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
}
export {
  q as ALLOWED_ORIGINS,
  ne as ERROR_CODES,
  k as IFRAME_BASE_URL,
  B as IFRAME_DEFAULT_HEIGHT_VALUE,
  f as POST_MESSAGES,
  oe as PayConductor,
  re as PayConductorCheckoutElement,
  W as REQUEST_TIMEOUT,
  j as buildIframeUrl,
  oe as default,
  Q as generateRequestId,
  $ as isValidOrigin,
  ae as usePayConductor,
  ie as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
