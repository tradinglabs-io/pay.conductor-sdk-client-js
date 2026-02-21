import { jsx as L } from "react/jsx-runtime";
import { useState as P, useEffect as v, useRef as g } from "react";
const S = "https://iframe.payconductor.ai/v1", U = "http://localhost:5175", z = 3e4, G = "600px";
var T = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(T || {}), h = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(h || {});
const H = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"), W = H ? U : S, k = [U, S], q = G, B = z, u = {
  INIT: T.Init,
  CONFIG: T.Config,
  UPDATE: T.Update,
  CONFIRM_PAYMENT: T.ConfirmPayment,
  VALIDATE: T.Validate,
  RESET: T.Reset,
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
  return `${W}?${n.toString()}`;
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
function M(e, n, r, t) {
  return new Promise((i, f) => {
    if (!e || !("contentWindow" in e)) {
      f(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      f(new Error("Iframe not ready"));
      return;
    }
    if (!n) {
      f(new Error("Pending requests not initialized"));
      return;
    }
    const m = Q();
    n.set(m, {
      resolve: i,
      reject: f
    }), e.contentWindow.postMessage({
      type: r,
      data: t,
      requestId: m
    }, "*"), setTimeout(() => {
      n != null && n.has(m) && (n.delete(m), f(new Error("Request timeout")));
    }, B);
  });
}
function O(e, n, r) {
  return M(e, n, u.CONFIRM_PAYMENT, {
    orderId: r.orderId
  });
}
function J(e, n, r) {
  return M(e, n, u.VALIDATE, r);
}
function X(e, n) {
  return M(e, n, u.RESET);
}
function Z(e, n, r) {
  return M(e, n, u.CONFIG, r);
}
function x(e, n, r) {
  return M(e, n, u.INIT, r);
}
function p(e, n, r, t, i, f, m, I, s, y) {
  if (!$(e.origin, k))
    return;
  const D = e.data, {
    requestId: R,
    type: w,
    data: l,
    error: E
  } = D;
  if (R && (n != null && n.has(R))) {
    const {
      resolve: d,
      reject: C
    } = n.get(R);
    n.delete(R), E ? C(new Error(String(E.message))) : d(l);
    return;
  }
  if (w === u.READY) {
    r(!0), i == null || i();
    return;
  }
  if (w === u.ERROR) {
    t((E == null ? void 0 : E.message) || "Unknown error"), f == null || f(new Error(String(E == null ? void 0 : E.message)));
    return;
  }
  if (w === u.PAYMENT_COMPLETE) {
    l && typeof l == "object" && "status" in l && (m == null || m(l));
    return;
  }
  if (w === u.PAYMENT_FAILED) {
    l && typeof l == "object" && "status" in l && (I == null || I(l));
    return;
  }
  if (w === u.PAYMENT_PENDING) {
    l && typeof l == "object" && "status" in l && (s == null || s(l));
    return;
  }
  if (w === u.PAYMENT_METHOD_SELECTED) {
    l && typeof l == "object" && "paymentMethod" in l && (y == null || y(l.paymentMethod));
    return;
  }
}
function re(e) {
  const [n, r] = P(
    () => !1
  ), [t, i] = P(
    () => !1
  ), [f, m] = P(() => null), [I, s] = P(
    () => ""
  ), [y, D] = P(
    () => null
  ), [R, w] = P(() => null), [l, E] = P(() => !1);
  return v(() => {
    const d = (...a) => {
      e.debug && console.log("[PayConductor]", ...a);
    };
    d("SDK initializing", {
      publicKey: e.publicKey
    });
    const C = j({
      publicKey: e.publicKey
    });
    s(C), r(!0), D(N()), d("iframeUrl built:", C), d("pendingMap created");
    const A = () => {
      var o, c;
      const a = (c = (o = window.PayConductor) == null ? void 0 : o.frame) == null ? void 0 : c.iframe;
      if (a) {
        if (a instanceof HTMLIFrameElement) return a;
        if (typeof a == "object" && a !== null) {
          if ("current" in a) return a.current ?? void 0;
          if ("value" in a) return a.value ?? void 0;
        }
        return a;
      }
    }, b = {
      iframe: null,
      iframeUrl: C,
      get isReady() {
        return t;
      },
      get error() {
        return f;
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
      }), O(A(), y, a)),
      validate: (a) => (d("validate called", a), J(A(), y, a)),
      reset: () => (d("reset called"), X(A(), y)),
      getSelectedPaymentMethod: () => R
    };
    window.PayConductor = {
      frame: b,
      config: F,
      api: K,
      selectedPaymentMethod: R
    }, d("window.PayConductor registered"), window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor
      })
    );
    const V = async () => {
      if (!l) {
        const a = A();
        if (!a) {
          d("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        E(!0), d("sendConfig →", {
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
        (o) => {
          i(o), o && (d("iframe Ready — sending config"), V());
        },
        (o) => {
          m(o), d("iframe Error:", o);
        },
        () => {
          var o;
          d("onReady fired"), (o = e.onReady) == null || o.call(e);
        },
        (o) => {
          var c;
          d("onError fired:", o), (c = e.onError) == null || c.call(e, o);
        },
        (o) => {
          var c;
          d("PaymentComplete:", o), (c = e.onPaymentComplete) == null || c.call(e, o);
        },
        (o) => {
          var c;
          d("PaymentFailed:", o), (c = e.onPaymentFailed) == null || c.call(e, o);
        },
        (o) => {
          var c;
          d("PaymentPending:", o), (c = e.onPaymentPending) == null || c.call(e, o);
        },
        (o) => {
          var c;
          d("PaymentMethodSelected:", o), w(o), window.PayConductor && (window.PayConductor.selectedPaymentMethod = o), (c = e.onPaymentMethodSelected) == null || c.call(e, o);
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
function oe(e) {
  const n = g(null), [r, t] = P(() => ""), [i, f] = P(() => !1);
  return v(() => {
    const m = (s) => {
      s != null && s.frame && (t(s.frame.iframeUrl || ""), s.frame.iframe = n.current, console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        r
      ), f(!0));
    }, I = typeof window < "u" ? window.PayConductor : null;
    if (I)
      m(I);
    else {
      const s = (y) => {
        m(y.detail), window.removeEventListener("payconductor:registered", s);
      };
      window.addEventListener("payconductor:registered", s);
    }
  }, []), /* @__PURE__ */ L(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: i && r && n.current && "contentWindow" in n.current ? /* @__PURE__ */ L(
        "iframe",
        {
          allow: "payment",
          title: "PayConductor",
          ref: n,
          src: r,
          style: {
            width: "100%",
            height: e.height || q,
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
  } : {}, r = e != null && e.frame ? {
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
    ...r
  };
}
function _(e) {
  var r;
  if (!((r = e == null ? void 0 : e.frame) != null && r.iframe)) return null;
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
  const e = typeof window < "u" ? window.PayConductor : null, n = (r, t) => {
    if (!e) return;
    const i = _(e);
    i != null && i.contentWindow && i.contentWindow.postMessage({
      type: r,
      data: t
    }, "*");
  };
  return e ? {
    init: async (r) => {
      const t = _(e), i = N();
      return x(t || void 0, i, r);
    },
    confirmPayment: async (r) => {
      const t = _(e), i = N();
      if (!r.orderId)
        throw new Error("Order ID is required");
      return O(t || void 0, i, r);
    },
    validate: e.api.validate,
    reset: e.api.reset,
    getSelectedPaymentMethod: () => (e == null ? void 0 : e.selectedPaymentMethod) ?? null,
    updateConfig: (r) => {
      const t = e.config;
      n(u.CONFIG, {
        publicKey: t == null ? void 0 : t.publicKey,
        orderId: t == null ? void 0 : t.orderId,
        theme: r.theme ?? (t == null ? void 0 : t.theme),
        locale: r.locale ?? (t == null ? void 0 : t.locale),
        paymentMethods: r.paymentMethods ?? (t == null ? void 0 : t.paymentMethods)
      });
    },
    updateorderId: (r) => {
      const t = e.config;
      n(u.CONFIG, {
        publicKey: t == null ? void 0 : t.publicKey,
        orderId: r,
        theme: t == null ? void 0 : t.theme,
        locale: t == null ? void 0 : t.locale,
        paymentMethods: t == null ? void 0 : t.paymentMethods
      });
    },
    update: (r) => {
      n(u.UPDATE, r);
    },
    submit: async () => {
      const r = _(e), t = N();
      try {
        return await M(r || void 0, t, u.CONFIRM_PAYMENT, {}), {
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
  k as ALLOWED_ORIGINS,
  ne as ERROR_CODES,
  W as IFRAME_BASE_URL,
  q as IFRAME_DEFAULT_HEIGHT_VALUE,
  u as POST_MESSAGES,
  re as PayConductor,
  oe as PayConductorCheckoutElement,
  B as REQUEST_TIMEOUT,
  j as buildIframeUrl,
  re as default,
  Q as generateRequestId,
  $ as isValidOrigin,
  ae as usePayConductor,
  ie as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
