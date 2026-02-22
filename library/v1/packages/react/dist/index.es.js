import { jsx as D } from "react/jsx-runtime";
import { useState as R, useEffect as O, useRef as G } from "react";
const U = "https://iframe.payconductor.ai/v1", v = "http://localhost:5175/v1", q = 3e4, H = "600px";
var h = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(h || {}), P = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(P || {});
const B = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && !window.location.search.includes("production"), W = B ? v : U, k = [v, U], j = H, Q = q, f = {
  INIT: h.Init,
  CONFIG: h.Config,
  UPDATE: h.Update,
  CONFIRM_PAYMENT: h.ConfirmPayment,
  VALIDATE: h.Validate,
  RESET: h.Reset,
  READY: P.Ready,
  ERROR: P.Error,
  PAYMENT_COMPLETE: P.PaymentComplete,
  PAYMENT_FAILED: P.PaymentFailed,
  PAYMENT_PENDING: P.PaymentPending,
  VALIDATION_ERROR: P.ValidationError,
  PAYMENT_METHOD_SELECTED: P.PaymentMethodSelected
}, ne = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function $(e) {
  const r = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${W}?${r.toString()}`;
}
function z() {
  return crypto.randomUUID();
}
function J(e, r) {
  return r.some((t) => {
    try {
      return new URL(t).origin === e;
    } catch {
      return t === e;
    }
  });
}
function C() {
  return /* @__PURE__ */ new Map();
}
function A(e, r, t, n) {
  return new Promise((o, u) => {
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
    const l = z();
    r.set(l, {
      resolve: o,
      reject: u
    }), e.contentWindow.postMessage({
      type: t,
      data: n,
      requestId: l
    }, "*"), setTimeout(() => {
      r != null && r.has(l) && (r.delete(l), u(new Error("Request timeout")));
    }, Q);
  });
}
function F(e, r, t) {
  return A(e, r, f.CONFIRM_PAYMENT, {
    orderId: t.orderId
  });
}
function X(e, r, t) {
  return A(e, r, f.VALIDATE, t);
}
function Z(e, r) {
  return A(e, r, f.RESET);
}
function g(e, r, t) {
  return A(e, r, f.CONFIG, t);
}
function x(e, r, t) {
  return A(e, r, f.INIT, t);
}
function p(e, r, t, n, o, u, l, E, s, w) {
  if (!J(e.origin, k))
    return;
  const L = e.data, {
    requestId: m,
    type: I,
    data: d,
    error: y
  } = L;
  if (m && (r != null && r.has(m))) {
    const {
      resolve: T,
      reject: M
    } = r.get(m);
    r.delete(m), y ? M(new Error(String(y.message))) : T(d);
    return;
  }
  if (I === f.READY) {
    t(!0), o == null || o();
    return;
  }
  if (I === f.ERROR) {
    n((y == null ? void 0 : y.message) || "Unknown error"), u == null || u(new Error(String(y == null ? void 0 : y.message)));
    return;
  }
  if (I === f.PAYMENT_COMPLETE) {
    d && typeof d == "object" && "status" in d && (l == null || l(d));
    return;
  }
  if (I === f.PAYMENT_FAILED) {
    d && typeof d == "object" && "status" in d && (E == null || E(d));
    return;
  }
  if (I === f.PAYMENT_PENDING) {
    d && typeof d == "object" && "status" in d && (s == null || s(d));
    return;
  }
  if (I === f.PAYMENT_METHOD_SELECTED) {
    d && typeof d == "object" && "paymentMethod" in d && (w == null || w(d.paymentMethod));
    return;
  }
}
function re(e) {
  const [r, t] = R(
    () => !1
  ), [n, o] = R(
    () => !1
  ), [u, l] = R(() => null), [E, s] = R(
    () => ""
  ), [w, L] = R(() => null);
  return O(() => {
    const m = (...a) => {
      e.debug && console.log("[PayConductor]", ...a);
    }, I = $({
      publicKey: e.publicKey
    });
    s(I), t(!0);
    const d = C();
    let y = !1;
    m("init", e.publicKey), m("iframeUrl", I);
    const T = () => {
      var N, i;
      const a = (i = (N = window.PayConductor) == null ? void 0 : N.frame) == null ? void 0 : i.iframe;
      if (a) {
        if (a instanceof HTMLIFrameElement) return a;
        if (typeof a == "object" && a !== null) {
          if ("current" in a) return a.current ?? void 0;
          if ("value" in a) return a.value ?? void 0;
        }
        return a;
      }
      return document.querySelector(
        ".payconductor-element iframe"
      ) ?? void 0;
    }, M = {
      iframe: null,
      iframeUrl: I,
      isReady: !1,
      error: null
    }, b = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, V = {
      confirmPayment: (a) => (m("→ CONFIRM_PAYMENT", {
        orderId: a.orderId
      }), F(T(), d, a)),
      validate: (a) => (m("→ VALIDATE", a), X(T(), d, a)),
      reset: () => (m("→ RESET"), Z(T(), d)),
      getSelectedPaymentMethod: () => w
    };
    window.PayConductor = {
      frame: M,
      config: b,
      api: V,
      selectedPaymentMethod: w
    };
    const S = document.querySelector(
      ".payconductor-element iframe"
    );
    S && (M.iframe = S), m("registered"), window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor
      })
    );
    const Y = async () => {
      if (!y) {
        const a = T();
        if (!a) {
          m("→ CONFIG skipped: iframe not found");
          return;
        }
        y = !0, m("→ CONFIG", {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons
        }), g(a, d, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, K = (a) => {
      var N;
      (N = a.data) != null && N.type && m("←", a.data.type, a.data.data ?? ""), p(
        a,
        d,
        (i) => {
          var c;
          o(i), M.isReady = i, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.isReady = i), i && Y();
        },
        (i) => {
          var c;
          l(i), M.error = i, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.error = i);
        },
        () => {
          var i;
          (i = e.onReady) == null || i.call(e);
        },
        (i) => {
          var c;
          (c = e.onError) == null || c.call(e, i);
        },
        (i) => {
          var c;
          (c = e.onPaymentComplete) == null || c.call(e, i);
        },
        (i) => {
          var c;
          (c = e.onPaymentFailed) == null || c.call(e, i);
        },
        (i) => {
          var c;
          (c = e.onPaymentPending) == null || c.call(e, i);
        },
        (i) => {
          var c;
          L(i), window.PayConductor && (window.PayConductor.selectedPaymentMethod = i), (c = e.onPaymentMethodSelected) == null || c.call(e, i);
        }
      );
    };
    window.addEventListener("message", K);
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
  const r = G(null), [t, n] = R(() => ""), [o, u] = R(() => !1);
  return O(() => {
    const l = (s) => {
      s != null && s.frame && (n(s.frame.iframeUrl || ""), u(!0));
    }, E = typeof window < "u" ? window.PayConductor : null;
    if (E)
      l(E);
    else {
      const s = (w) => {
        l(w.detail), window.removeEventListener("payconductor:registered", s);
      };
      window.addEventListener("payconductor:registered", s);
    }
  }, []), O(() => {
    var l;
    if (o && t && ((l = window.PayConductor) != null && l.frame)) {
      const E = r.current || document.querySelector(".payconductor-element iframe");
      E && (window.PayConductor.frame.iframe = E);
    }
  }, [o, t]), /* @__PURE__ */ D(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: o && t ? /* @__PURE__ */ D(
        "iframe",
        {
          allow: "payment",
          title: "PayConductor",
          ref: r,
          src: t,
          style: {
            width: "100%",
            height: e.height || j,
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
function ie() {
  const e = () => typeof window < "u" ? window.PayConductor : null, r = (t, n) => {
    const o = e();
    if (!o) return;
    const u = _(o);
    u != null && u.contentWindow && u.contentWindow.postMessage({
      type: t,
      data: n
    }, "*");
  };
  return {
    init: async (t) => {
      const n = _(e()), o = C();
      return x(n || void 0, o, t);
    },
    confirmPayment: async (t) => {
      const n = _(e()), o = C();
      if (!t.orderId)
        throw new Error("Order ID is required");
      return F(n || void 0, o, t);
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
      var o;
      const n = (o = e()) == null ? void 0 : o.config;
      r(f.CONFIG, {
        publicKey: n == null ? void 0 : n.publicKey,
        orderId: n == null ? void 0 : n.orderId,
        theme: t.theme ?? (n == null ? void 0 : n.theme),
        locale: t.locale ?? (n == null ? void 0 : n.locale),
        paymentMethods: t.paymentMethods ?? (n == null ? void 0 : n.paymentMethods)
      });
    },
    updateorderId: (t) => {
      var o;
      const n = (o = e()) == null ? void 0 : o.config;
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
      const t = _(e()), n = C();
      try {
        return await A(t || void 0, n, f.CONFIRM_PAYMENT, {}), {
          paymentMethod: void 0
        };
      } catch (o) {
        return {
          error: {
            message: o instanceof Error ? o.message : "Payment failed",
            code: "payment_error",
            type: "payment_error"
          }
        };
      }
    }
  };
}
export {
  k as ALLOWED_ORIGINS,
  ne as ERROR_CODES,
  W as IFRAME_BASE_URL,
  j as IFRAME_DEFAULT_HEIGHT_VALUE,
  f as POST_MESSAGES,
  re as PayConductor,
  oe as PayConductorCheckoutElement,
  Q as REQUEST_TIMEOUT,
  $ as buildIframeUrl,
  re as default,
  z as generateRequestId,
  J as isValidOrigin,
  ae as usePayConductor,
  ie as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
