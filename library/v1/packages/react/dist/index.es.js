import { jsx as D } from "react/jsx-runtime";
import { useState as R, useEffect as O, useRef as K } from "react";
const U = "https://iframe.payconductor.ai/v1", S = "http://localhost:5175/v1", G = 3e4, H = "600px";
var h = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(h || {}), w = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(w || {});
const q = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && !window.location.search.includes("production"), B = q ? S : U, W = [S, U], k = H, j = G, l = {
  INIT: h.Init,
  CONFIG: h.Config,
  UPDATE: h.Update,
  CONFIRM_PAYMENT: h.ConfirmPayment,
  VALIDATE: h.Validate,
  RESET: h.Reset,
  READY: w.Ready,
  ERROR: w.Error,
  PAYMENT_COMPLETE: w.PaymentComplete,
  PAYMENT_FAILED: w.PaymentFailed,
  PAYMENT_PENDING: w.PaymentPending,
  VALIDATION_ERROR: w.ValidationError,
  PAYMENT_METHOD_SELECTED: w.PaymentMethodSelected
}, te = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function Q(e) {
  const r = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${B}?${r.toString()}`;
}
function $() {
  return crypto.randomUUID();
}
function z(e, r) {
  return r.some((t) => {
    try {
      return new URL(t).origin === e;
    } catch {
      return t === e;
    }
  });
}
function L() {
  return /* @__PURE__ */ new Map();
}
function M(e, r, t, n) {
  return new Promise((i, u) => {
    if (!e || !("contentWindow" in e)) {
      u(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      u(new Error("Iframe not ready"));
      return;
    }
    if (!r) {
      u(new Error("Pending requests not initialized"));
      return;
    }
    const m = $();
    r.set(m, {
      resolve: i,
      reject: u
    }), e.contentWindow.postMessage({
      type: t,
      data: n,
      requestId: m
    }, "*"), setTimeout(() => {
      r != null && r.has(m) && (r.delete(m), u(new Error("Request timeout")));
    }, j);
  });
}
function v(e, r, t) {
  return M(e, r, l.CONFIRM_PAYMENT, {
    orderId: t.orderId
  });
}
function J(e, r, t) {
  return M(e, r, l.VALIDATE, t);
}
function X(e, r) {
  return M(e, r, l.RESET);
}
function Z(e, r, t) {
  return M(e, r, l.CONFIG, t);
}
function g(e, r, t) {
  return M(e, r, l.INIT, t);
}
function x(e, r, t, n, i, u, m, P, f, I) {
  if (!z(e.origin, W))
    return;
  const C = e.data, {
    requestId: s,
    type: E,
    data: d,
    error: y
  } = C;
  if (s && (r != null && r.has(s))) {
    const {
      resolve: T,
      reject: A
    } = r.get(s);
    r.delete(s), y ? A(new Error(String(y.message))) : T(d);
    return;
  }
  if (E === l.READY) {
    t(!0), i == null || i();
    return;
  }
  if (E === l.ERROR) {
    n((y == null ? void 0 : y.message) || "Unknown error"), u == null || u(new Error(String(y == null ? void 0 : y.message)));
    return;
  }
  if (E === l.PAYMENT_COMPLETE) {
    d && typeof d == "object" && "status" in d && (m == null || m(d));
    return;
  }
  if (E === l.PAYMENT_FAILED) {
    d && typeof d == "object" && "status" in d && (P == null || P(d));
    return;
  }
  if (E === l.PAYMENT_PENDING) {
    d && typeof d == "object" && "status" in d && (f == null || f(d));
    return;
  }
  if (E === l.PAYMENT_METHOD_SELECTED) {
    d && typeof d == "object" && "paymentMethod" in d && (I == null || I(d.paymentMethod));
    return;
  }
}
function ne(e) {
  const [r, t] = R(
    () => !1
  ), [n, i] = R(
    () => !1
  ), [u, m] = R(() => null), [P, f] = R(
    () => ""
  ), [I, C] = R(() => null);
  return O(() => {
    const s = (...o) => {
      e.debug && console.log("[PayConductor]", ...o);
    }, E = Q({
      publicKey: e.publicKey
    });
    f(E), t(!0);
    const d = L();
    let y = !1;
    s("init", e.publicKey), s("iframeUrl", E);
    const T = () => {
      var N, a;
      const o = (a = (N = window.PayConductor) == null ? void 0 : N.frame) == null ? void 0 : a.iframe;
      if (o) {
        if (o instanceof HTMLIFrameElement) return o;
        if (typeof o == "object" && o !== null) {
          if ("current" in o) return o.current ?? void 0;
          if ("value" in o) return o.value ?? void 0;
        }
        return o;
      }
      return document.querySelector(
        ".payconductor-element iframe"
      ) ?? void 0;
    }, A = {
      iframe: null,
      iframeUrl: E,
      isReady: !1,
      error: null
    }, F = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, b = {
      confirmPayment: (o) => (s("→ CONFIRM_PAYMENT", {
        orderId: o.orderId
      }), v(T(), d, o)),
      validate: (o) => (s("→ VALIDATE", o), J(T(), d, o)),
      reset: () => (s("→ RESET"), X(T(), d)),
      getSelectedPaymentMethod: () => I
    };
    window.PayConductor = {
      frame: A,
      config: F,
      api: b,
      selectedPaymentMethod: I
    }, s("registered"), window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor
      })
    );
    const V = async () => {
      if (!y) {
        const o = T();
        if (!o) {
          s("→ CONFIG skipped: iframe not found");
          return;
        }
        y = !0, s("→ CONFIG", {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons
        }), Z(o, d, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, Y = (o) => {
      var N;
      (N = o.data) != null && N.type && s("←", o.data.type, o.data.data ?? ""), x(
        o,
        d,
        (a) => {
          var c;
          i(a), A.isReady = a, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.isReady = a), a && V();
        },
        (a) => {
          var c;
          m(a), A.error = a, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.error = a);
        },
        () => {
          var a;
          (a = e.onReady) == null || a.call(e);
        },
        (a) => {
          var c;
          (c = e.onError) == null || c.call(e, a);
        },
        (a) => {
          var c;
          (c = e.onPaymentComplete) == null || c.call(e, a);
        },
        (a) => {
          var c;
          (c = e.onPaymentFailed) == null || c.call(e, a);
        },
        (a) => {
          var c;
          (c = e.onPaymentPending) == null || c.call(e, a);
        },
        (a) => {
          var c;
          C(a), window.PayConductor && (window.PayConductor.selectedPaymentMethod = a), (c = e.onPaymentMethodSelected) == null || c.call(e, a);
        }
      );
    };
    window.addEventListener("message", Y);
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
function re(e) {
  const r = K(null), [t, n] = R(() => ""), [i, u] = R(() => !1);
  return O(() => {
    const m = (f) => {
      f != null && f.frame && (n(f.frame.iframeUrl || ""), f.frame.iframe = r.current, u(!0));
    }, P = typeof window < "u" ? window.PayConductor : null;
    if (P)
      m(P);
    else {
      const f = (I) => {
        m(I.detail), window.removeEventListener("payconductor:registered", f);
      };
      window.addEventListener("payconductor:registered", f);
    }
  }, []), /* @__PURE__ */ D(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: i && t ? /* @__PURE__ */ D(
        "iframe",
        {
          allow: "payment",
          title: "PayConductor",
          ref: r,
          src: t,
          style: {
            width: "100%",
            height: e.height || k,
            border: "none"
          }
        }
      ) : null
    }
  );
}
function oe() {
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
function _(e) {
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
function ae() {
  const e = () => typeof window < "u" ? window.PayConductor : null, r = (t, n) => {
    const i = e();
    if (!i) return;
    const u = _(i);
    u != null && u.contentWindow && u.contentWindow.postMessage({
      type: t,
      data: n
    }, "*");
  };
  return {
    init: async (t) => {
      const n = _(e()), i = L();
      return g(n || void 0, i, t);
    },
    confirmPayment: async (t) => {
      const n = _(e()), i = L();
      if (!t.orderId)
        throw new Error("Order ID is required");
      return v(n || void 0, i, t);
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
      var i;
      const n = (i = e()) == null ? void 0 : i.config;
      r(l.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        orderId: n == null ? void 0 : n.orderId,
        theme: t.theme ?? (n == null ? void 0 : n.theme),
        locale: t.locale ?? (n == null ? void 0 : n.locale),
        paymentMethods: t.paymentMethods ?? (n == null ? void 0 : n.paymentMethods)
      });
    },
    updateorderId: (t) => {
      var i;
      const n = (i = e()) == null ? void 0 : i.config;
      r(l.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        orderId: t,
        theme: n == null ? void 0 : n.theme,
        locale: n == null ? void 0 : n.locale,
        paymentMethods: n == null ? void 0 : n.paymentMethods
      });
    },
    update: (t) => {
      r(l.UPDATE, t);
    },
    submit: async () => {
      const t = _(e()), n = L();
      try {
        return await M(t || void 0, n, l.CONFIRM_PAYMENT, {}), {
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
  };
}
export {
  W as ALLOWED_ORIGINS,
  te as ERROR_CODES,
  B as IFRAME_BASE_URL,
  k as IFRAME_DEFAULT_HEIGHT_VALUE,
  l as POST_MESSAGES,
  ne as PayConductor,
  re as PayConductorCheckoutElement,
  j as REQUEST_TIMEOUT,
  Q as buildIframeUrl,
  ne as default,
  $ as generateRequestId,
  z as isValidOrigin,
  oe as usePayConductor,
  ae as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
