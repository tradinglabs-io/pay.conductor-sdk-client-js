import { jsx as D } from "react/jsx-runtime";
import { useState as P, useEffect as v, useRef as g } from "react";
const S = "https://iframe.payconductor.ai/v1", U = "http://localhost:5175", H = 3e4, G = "600px";
var T = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(T || {}), h = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(h || {});
const q = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"), k = q ? U : S, B = [U, S], W = G, j = H, f = {
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
function z(e) {
  const r = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${k}?${r.toString()}`;
}
function Q() {
  return crypto.randomUUID();
}
function $(e, r) {
  return r.includes(e);
}
function C() {
  return /* @__PURE__ */ new Map();
}
function M(e, r, t, n) {
  return new Promise((a, c) => {
    if (!e || !("contentWindow" in e)) {
      c(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      c(new Error("Iframe not ready"));
      return;
    }
    if (!r) {
      c(new Error("Pending requests not initialized"));
      return;
    }
    const m = Q();
    r.set(m, {
      resolve: a,
      reject: c
    }), e.contentWindow.postMessage({
      type: t,
      data: n,
      requestId: m
    }, "*"), setTimeout(() => {
      r != null && r.has(m) && (r.delete(m), c(new Error("Request timeout")));
    }, j);
  });
}
function O(e, r, t) {
  return M(e, r, f.CONFIRM_PAYMENT, {
    orderId: t.orderId
  });
}
function J(e, r, t) {
  return M(e, r, f.VALIDATE, t);
}
function X(e, r) {
  return M(e, r, f.RESET);
}
function Z(e, r, t) {
  return M(e, r, f.CONFIG, t);
}
function x(e, r, t) {
  return M(e, r, f.INIT, t);
}
function p(e, r, t, n, a, c, m, w, s, y) {
  if (!$(e.origin, B))
    return;
  const L = e.data, {
    requestId: R,
    type: I,
    data: l,
    error: E
  } = L;
  if (R && (r != null && r.has(R))) {
    const {
      resolve: d,
      reject: A
    } = r.get(R);
    r.delete(R), E ? A(new Error(String(E.message))) : d(l);
    return;
  }
  if (I === f.READY) {
    t(!0), a == null || a();
    return;
  }
  if (I === f.ERROR) {
    n((E == null ? void 0 : E.message) || "Unknown error"), c == null || c(new Error(String(E == null ? void 0 : E.message)));
    return;
  }
  if (I === f.PAYMENT_COMPLETE) {
    l && typeof l == "object" && "status" in l && (m == null || m(l));
    return;
  }
  if (I === f.PAYMENT_FAILED) {
    l && typeof l == "object" && "status" in l && (w == null || w(l));
    return;
  }
  if (I === f.PAYMENT_PENDING) {
    l && typeof l == "object" && "status" in l && (s == null || s(l));
    return;
  }
  if (I === f.PAYMENT_METHOD_SELECTED) {
    l && typeof l == "object" && "paymentMethod" in l && (y == null || y(l.paymentMethod));
    return;
  }
}
function re(e) {
  const [r, t] = P(
    () => !1
  ), [n, a] = P(
    () => !1
  ), [c, m] = P(() => null), [w, s] = P(
    () => ""
  ), [y, L] = P(
    () => null
  ), [R, I] = P(() => null), [l, E] = P(() => !1);
  return v(() => {
    const d = (...i) => {
      e.debug && console.log("[PayConductor]", ...i);
    };
    d("SDK initializing", {
      publicKey: e.publicKey
    });
    const A = z({
      publicKey: e.publicKey
    });
    s(A), t(!0), L(C()), d("iframeUrl built:", A), d("pendingMap created");
    const _ = () => {
      var o, u;
      const i = (u = (o = window.PayConductor) == null ? void 0 : o.frame) == null ? void 0 : u.iframe;
      if (i) {
        if (i instanceof HTMLIFrameElement) return i;
        if (typeof i == "object" && i !== null) {
          if ("current" in i) return i.current ?? void 0;
          if ("value" in i) return i.value ?? void 0;
        }
        return i;
      }
      return document.querySelector(
        ".payconductor-element iframe"
      ) ?? void 0;
    }, b = {
      iframe: null,
      iframeUrl: A,
      get isReady() {
        return n;
      },
      get error() {
        return c;
      }
    }, F = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, K = {
      confirmPayment: (i) => (d("confirmPayment called", {
        orderId: i.orderId
      }), O(_(), y, i)),
      validate: (i) => (d("validate called", i), J(_(), y, i)),
      reset: () => (d("reset called"), X(_(), y)),
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
        const i = _();
        if (!i) {
          d("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        E(!0), d("sendConfig →", {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons
        }), Z(i, y, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, Y = (i) => {
      p(
        i,
        y,
        (o) => {
          a(o), o && (d("iframe Ready — sending config"), V());
        },
        (o) => {
          m(o), d("iframe Error:", o);
        },
        () => {
          var o;
          d("onReady fired"), (o = e.onReady) == null || o.call(e);
        },
        (o) => {
          var u;
          d("onError fired:", o), (u = e.onError) == null || u.call(e, o);
        },
        (o) => {
          var u;
          d("PaymentComplete:", o), (u = e.onPaymentComplete) == null || u.call(e, o);
        },
        (o) => {
          var u;
          d("PaymentFailed:", o), (u = e.onPaymentFailed) == null || u.call(e, o);
        },
        (o) => {
          var u;
          d("PaymentPending:", o), (u = e.onPaymentPending) == null || u.call(e, o);
        },
        (o) => {
          var u;
          d("PaymentMethodSelected:", o), I(o), window.PayConductor && (window.PayConductor.selectedPaymentMethod = o), (u = e.onPaymentMethodSelected) == null || u.call(e, o);
        }
      );
    };
    window.addEventListener("message", Y), d("SDK initialized — waiting for PayConductorCheckoutElement");
  }, []), /* @__PURE__ */ D(
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
  const r = g(null), [t, n] = P(() => ""), [a, c] = P(() => !1);
  return v(() => {
    const m = (s) => {
      s != null && s.frame && (n(s.frame.iframeUrl || ""), s.frame.iframe = r.current, console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        t
      ), c(!0));
    }, w = typeof window < "u" ? window.PayConductor : null;
    if (w)
      m(w);
    else {
      const s = (y) => {
        m(y.detail), window.removeEventListener("payconductor:registered", s);
      };
      window.addEventListener("payconductor:registered", s);
    }
  }, []), /* @__PURE__ */ D(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: a && t ? /* @__PURE__ */ D(
        "iframe",
        {
          allow: "payment",
          title: "PayConductor",
          ref: r,
          src: t,
          style: {
            width: "100%",
            height: e.height || W,
            border: "none"
          }
        }
      ) : null
    }
  );
}
function ae() {
  const e = typeof window < "u" ? window.PayConductor : null, r = e != null && e.config ? {
    publicKey: e.config.publicKey,
    orderId: e.config.orderId,
    theme: e.config.theme,
    locale: e.config.locale
  } : {}, t = e != null && e.frame ? {
    iframe: e.frame.iframe,
    isReady: e.frame.isReady,
    error: e.frame.error
  } : {
    iframe: null,
    isReady: !1,
    error: null
  };
  return {
    ...r,
    ...t
  };
}
function N(e) {
  var r;
  if ((r = e == null ? void 0 : e.frame) != null && r.iframe) {
    const t = e.frame.iframe;
    if (t instanceof HTMLIFrameElement) return t;
    if (t && typeof t == "object") {
      if ("current" in t) {
        const n = t.current;
        if (n instanceof HTMLIFrameElement) return n;
      }
      if ("value" in t) {
        const n = t.value;
        if (n instanceof HTMLIFrameElement) return n;
      }
    }
  }
  return document.querySelector(".payconductor-element iframe") ?? null;
}
function ie() {
  const e = () => typeof window < "u" ? window.PayConductor : null, r = (t, n) => {
    const a = e();
    if (!a) return;
    const c = N(a);
    c != null && c.contentWindow && c.contentWindow.postMessage({
      type: t,
      data: n
    }, "*");
  };
  return {
    init: async (t) => {
      const n = N(e()), a = C();
      return x(n || void 0, a, t);
    },
    confirmPayment: async (t) => {
      const n = N(e()), a = C();
      if (!t.orderId)
        throw new Error("Order ID is required");
      return O(n || void 0, a, t);
    },
    validate: (t) => {
      const n = e();
      return n ? n.api.validate(t) : Promise.resolve(!1);
    },
    reset: () => {
      const t = e();
      return t ? t.api.reset() : Promise.resolve();
    },
    getSelectedPaymentMethod: () => {
      var t;
      return ((t = e()) == null ? void 0 : t.selectedPaymentMethod) ?? null;
    },
    updateConfig: (t) => {
      var a;
      const n = (a = e()) == null ? void 0 : a.config;
      r(f.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        orderId: n == null ? void 0 : n.orderId,
        theme: t.theme ?? (n == null ? void 0 : n.theme),
        locale: t.locale ?? (n == null ? void 0 : n.locale),
        paymentMethods: t.paymentMethods ?? (n == null ? void 0 : n.paymentMethods)
      });
    },
    updateorderId: (t) => {
      var a;
      const n = (a = e()) == null ? void 0 : a.config;
      r(f.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        orderId: t,
        theme: n == null ? void 0 : n.theme,
        locale: n == null ? void 0 : n.locale,
        paymentMethods: n == null ? void 0 : n.paymentMethods
      });
    },
    update: (t) => {
      r(f.UPDATE, t);
    },
    submit: async () => {
      const t = N(e()), n = C();
      try {
        return await M(t || void 0, n, f.CONFIRM_PAYMENT, {}), {
          paymentMethod: void 0
        };
      } catch (a) {
        return {
          error: {
            message: a instanceof Error ? a.message : "Payment failed",
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
  };
}
export {
  B as ALLOWED_ORIGINS,
  ne as ERROR_CODES,
  k as IFRAME_BASE_URL,
  W as IFRAME_DEFAULT_HEIGHT_VALUE,
  f as POST_MESSAGES,
  re as PayConductor,
  oe as PayConductorCheckoutElement,
  j as REQUEST_TIMEOUT,
  z as buildIframeUrl,
  re as default,
  Q as generateRequestId,
  $ as isValidOrigin,
  ae as usePayConductor,
  ie as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
