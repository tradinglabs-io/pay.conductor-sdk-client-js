import { jsx as D } from "react/jsx-runtime";
import { useState as T, useEffect as U, useRef as G } from "react";
const S = "https://iframe.payconductor.ai/v1", b = "http://localhost:5175/v1", H = 3e4, q = "600px";
var R = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(R || {}), w = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(w || {});
const B = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && !window.location.search.includes("production"), W = (B ? b : S) + "?" + window.location.search, k = [b, S], j = q, Q = H, l = {
  INIT: R.Init,
  CONFIG: R.Config,
  UPDATE: R.Update,
  CONFIRM_PAYMENT: R.ConfirmPayment,
  VALIDATE: R.Validate,
  RESET: R.Reset,
  READY: w.Ready,
  ERROR: w.Error,
  PAYMENT_COMPLETE: w.PaymentComplete,
  PAYMENT_FAILED: w.PaymentFailed,
  PAYMENT_PENDING: w.PaymentPending,
  VALIDATION_ERROR: w.ValidationError,
  PAYMENT_METHOD_SELECTED: w.PaymentMethodSelected
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
    const f = z();
    r.set(f, {
      resolve: i,
      reject: u
    }), e.contentWindow.postMessage({
      type: t,
      data: n,
      requestId: f
    }, "*"), setTimeout(() => {
      r != null && r.has(f) && (r.delete(f), u(new Error("Request timeout")));
    }, Q);
  });
}
function F(e, r, t) {
  return M(e, r, l.CONFIRM_PAYMENT, {
    orderId: t.orderId
  });
}
function X(e, r, t) {
  return M(e, r, l.VALIDATE, t);
}
function Z(e, r) {
  return M(e, r, l.RESET);
}
function g(e, r, t) {
  return M(e, r, l.CONFIG, t);
}
function x(e, r, t) {
  return M(e, r, l.INIT, t);
}
function p(e, r, t, n, i, u, f, P, m, I) {
  if (!J(e.origin, k))
    return;
  const C = e.data, {
    requestId: s,
    type: E,
    data: d,
    error: y
  } = C;
  if (s && (r != null && r.has(s))) {
    const {
      resolve: h,
      reject: A
    } = r.get(s);
    r.delete(s), y ? A(new Error(String(y.message))) : h(d);
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
    d && typeof d == "object" && "status" in d && (f == null || f(d));
    return;
  }
  if (E === l.PAYMENT_FAILED) {
    d && typeof d == "object" && "status" in d && (P == null || P(d));
    return;
  }
  if (E === l.PAYMENT_PENDING) {
    d && typeof d == "object" && "status" in d && (m == null || m(d));
    return;
  }
  if (E === l.PAYMENT_METHOD_SELECTED) {
    d && typeof d == "object" && "paymentMethod" in d && (I == null || I(d.paymentMethod));
    return;
  }
}
function re(e) {
  const [r, t] = T(
    () => !1
  ), [n, i] = T(
    () => !1
  ), [u, f] = T(() => null), [P, m] = T(
    () => ""
  ), [I, C] = T(() => null);
  return U(() => {
    const s = (...o) => {
      e.debug && console.log("[PayConductor]", ...o);
    }, E = $({
      publicKey: e.publicKey
    });
    m(E), t(!0);
    const d = L();
    let y = !1;
    s("init", e.publicKey), s("iframeUrl", E);
    const h = () => {
      var _, a;
      const o = (a = (_ = window.PayConductor) == null ? void 0 : _.frame) == null ? void 0 : a.iframe;
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
      get iframe() {
        return document.querySelector(
          ".payconductor-element iframe"
        ) ?? null;
      },
      set iframe(o) {
      },
      iframeUrl: E,
      isReady: !1,
      error: null
    }, V = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, Y = {
      confirmPayment: (o) => (s("→ CONFIRM_PAYMENT", {
        orderId: o.orderId
      }), F(h(), d, o)),
      validate: (o) => (s("→ VALIDATE", o), X(h(), d, o)),
      reset: () => (s("→ RESET"), Z(h(), d)),
      getSelectedPaymentMethod: () => I
    };
    window.PayConductor = {
      frame: A,
      config: V,
      api: Y,
      selectedPaymentMethod: I
    }, s("registered"), window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor
      })
    );
    const O = async () => {
      if (!y) {
        const o = h();
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
        }), g(o, d, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, K = (o) => {
      var _;
      (_ = o.data) != null && _.type && s("←", o.data.type, o.data.data ?? ""), p(
        o,
        d,
        (a) => {
          var c;
          i(a), A.isReady = a, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.isReady = a), a && O();
        },
        (a) => {
          var c;
          f(a), A.error = a, (c = window.PayConductor) != null && c.frame && (window.PayConductor.frame.error = a);
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
    window.addEventListener("message", K);
    const v = () => {
      const o = h();
      return o ? (o.addEventListener("load", () => O(), {
        once: !0
      }), !0) : !1;
    };
    if (!v()) {
      const o = new MutationObserver(() => {
        v() && o.disconnect();
      });
      o.observe(document.body, {
        childList: !0,
        subtree: !0
      });
    }
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
  const r = G(null), [t, n] = T(() => ""), [i, u] = T(() => !1);
  return U(() => {
    const f = (m) => {
      m != null && m.frame && (n(m.frame.iframeUrl || ""), u(!0));
    }, P = typeof window < "u" ? window.PayConductor : null;
    if (P)
      f(P);
    else {
      const m = (I) => {
        f(I.detail), window.removeEventListener("payconductor:registered", m);
      };
      window.addEventListener("payconductor:registered", m);
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
    const i = e();
    if (!i) return;
    const u = N(i);
    u != null && u.contentWindow && u.contentWindow.postMessage({
      type: t,
      data: n
    }, "*");
  };
  return {
    init: async (t) => {
      const n = N(e()), i = L();
      return x(n || void 0, i, t);
    },
    confirmPayment: async (t) => {
      const n = N(e()), i = L();
      if (!t.orderId)
        throw new Error("Order ID is required");
      return F(n || void 0, i, t);
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
      const t = N(e()), n = L();
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
  k as ALLOWED_ORIGINS,
  ne as ERROR_CODES,
  W as IFRAME_BASE_URL,
  j as IFRAME_DEFAULT_HEIGHT_VALUE,
  l as POST_MESSAGES,
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
