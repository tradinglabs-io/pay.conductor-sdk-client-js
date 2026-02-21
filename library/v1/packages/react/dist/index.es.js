import { jsx as L } from "react/jsx-runtime";
import { useState as R, useEffect as D, useRef as V } from "react";
const S = "https://iframe.payconductor.ai/v1", U = "http://localhost:5175", Y = 3e4, H = "600px";
var h = /* @__PURE__ */ ((e) => (e.Init = "Init", e.Config = "Config", e.Update = "Update", e.ConfirmPayment = "ConfirmPayment", e.Validate = "Validate", e.Reset = "Reset", e))(h || {}), w = /* @__PURE__ */ ((e) => (e.Ready = "Ready", e.Error = "Error", e.PaymentComplete = "PaymentComplete", e.PaymentFailed = "PaymentFailed", e.PaymentPending = "PaymentPending", e.ValidationError = "ValidationError", e.PaymentMethodSelected = "PaymentMethodSelected", e))(w || {});
const G = typeof window < "u" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"), g = G ? U : S, q = [U, S], k = H, B = Y, f = {
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
}, ee = {
  INVALID_CLIENT: "InvalidClient",
  INVALID_TOKEN: "InvalidToken",
  NETWORK_ERROR: "NetworkError",
  IFRAME_NOT_READY: "IframeNotReady",
  PAYMENT_DECLINED: "PaymentDeclined",
  VALIDATION_ERROR: "ValidationError",
  TIMEOUT: "Timeout"
};
function W(e) {
  const r = new URLSearchParams({
    publicKey: e.publicKey
  });
  return `${g}?${r.toString()}`;
}
function j() {
  return crypto.randomUUID();
}
function z(e, r) {
  return r.includes(e);
}
function C() {
  return /* @__PURE__ */ new Map();
}
function M(e, r, t, n) {
  return new Promise((a, l) => {
    if (!e || !("contentWindow" in e)) {
      l(new Error("Iframe not defined"));
      return;
    }
    if (!(e != null && e.contentWindow)) {
      l(new Error("Iframe not ready"));
      return;
    }
    if (!r) {
      l(new Error("Pending requests not initialized"));
      return;
    }
    const s = j();
    r.set(s, {
      resolve: a,
      reject: l
    }), e.contentWindow.postMessage({
      type: t,
      data: n,
      requestId: s
    }, "*"), setTimeout(() => {
      r != null && r.has(s) && (r.delete(s), l(new Error("Request timeout")));
    }, B);
  });
}
function v(e, r, t) {
  return M(e, r, f.CONFIRM_PAYMENT, {
    orderId: t.orderId
  });
}
function Q(e, r, t) {
  return M(e, r, f.VALIDATE, t);
}
function $(e, r) {
  return M(e, r, f.RESET);
}
function J(e, r, t) {
  return M(e, r, f.CONFIG, t);
}
function X(e, r, t) {
  return M(e, r, f.INIT, t);
}
function Z(e, r, t, n, a, l, s, I, m, P) {
  if (!z(e.origin, q))
    return;
  const N = e.data, {
    requestId: i,
    type: E,
    data: d,
    error: y
  } = N;
  if (i && (r != null && r.has(i))) {
    const {
      resolve: T,
      reject: A
    } = r.get(i);
    r.delete(i), y ? A(new Error(String(y.message))) : T(d);
    return;
  }
  if (E === f.READY) {
    t(!0), a == null || a();
    return;
  }
  if (E === f.ERROR) {
    n((y == null ? void 0 : y.message) || "Unknown error"), l == null || l(new Error(String(y == null ? void 0 : y.message)));
    return;
  }
  if (E === f.PAYMENT_COMPLETE) {
    d && typeof d == "object" && "status" in d && (s == null || s(d));
    return;
  }
  if (E === f.PAYMENT_FAILED) {
    d && typeof d == "object" && "status" in d && (I == null || I(d));
    return;
  }
  if (E === f.PAYMENT_PENDING) {
    d && typeof d == "object" && "status" in d && (m == null || m(d));
    return;
  }
  if (E === f.PAYMENT_METHOD_SELECTED) {
    d && typeof d == "object" && "paymentMethod" in d && (P == null || P(d.paymentMethod));
    return;
  }
}
function te(e) {
  const [r, t] = R(
    () => !1
  ), [n, a] = R(
    () => !1
  ), [l, s] = R(() => null), [I, m] = R(
    () => ""
  ), [P, N] = R(() => null);
  return D(() => {
    const i = (...c) => {
      e.debug && console.log("[PayConductor]", ...c);
    };
    i("SDK initializing", {
      publicKey: e.publicKey
    });
    const E = W({
      publicKey: e.publicKey
    });
    m(E), t(!0);
    const d = C();
    let y = !1;
    i("iframeUrl built:", E), i("pendingMap created");
    const T = () => {
      var o, u;
      const c = (u = (o = window.PayConductor) == null ? void 0 : o.frame) == null ? void 0 : u.iframe;
      if (c) {
        if (c instanceof HTMLIFrameElement) return c;
        if (typeof c == "object" && c !== null) {
          if ("current" in c) return c.current ?? void 0;
          if ("value" in c) return c.value ?? void 0;
        }
        return c;
      }
      return document.querySelector(
        ".payconductor-element iframe"
      ) ?? void 0;
    }, A = {
      iframe: null,
      iframeUrl: E,
      isReady: !1,
      error: null
    }, O = {
      publicKey: e.publicKey,
      theme: e.theme,
      locale: e.locale,
      paymentMethods: e.paymentMethods,
      defaultPaymentMethod: e.defaultPaymentMethod
    }, b = {
      confirmPayment: (c) => (i("confirmPayment called", {
        orderId: c.orderId
      }), v(T(), d, c)),
      validate: (c) => (i("validate called", c), Q(T(), d, c)),
      reset: () => (i("reset called"), $(T(), d)),
      getSelectedPaymentMethod: () => P
    };
    window.PayConductor = {
      frame: A,
      config: O,
      api: b,
      selectedPaymentMethod: P
    }, i("window.PayConductor registered"), window.dispatchEvent(
      new CustomEvent("payconductor:registered", {
        detail: window.PayConductor
      })
    );
    const F = async () => {
      if (!y) {
        const c = T();
        if (!c) {
          i("sendConfigToIframe: iframe not found, skipping");
          return;
        }
        y = !0, i("sendConfig →", {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons
        }), J(c, d, {
          theme: e.theme,
          locale: e.locale,
          paymentMethods: e.paymentMethods,
          defaultPaymentMethod: e.defaultPaymentMethod,
          showPaymentButtons: e.showPaymentButtons,
          nuPayConfig: e.nuPayConfig
        });
      }
    }, K = (c) => {
      Z(
        c,
        d,
        (o) => {
          a(o), A.isReady = o, window.PayConductor && window.PayConductor.frame && (window.PayConductor.frame.isReady = o), o && (i("iframe Ready — sending config"), F());
        },
        (o) => {
          s(o), A.error = o, window.PayConductor && window.PayConductor.frame && (window.PayConductor.frame.error = o), i("iframe Error:", o);
        },
        () => {
          var o;
          i("onReady fired"), (o = e.onReady) == null || o.call(e);
        },
        (o) => {
          var u;
          i("onError fired:", o), (u = e.onError) == null || u.call(e, o);
        },
        (o) => {
          var u;
          i("PaymentComplete:", o), (u = e.onPaymentComplete) == null || u.call(e, o);
        },
        (o) => {
          var u;
          i("PaymentFailed:", o), (u = e.onPaymentFailed) == null || u.call(e, o);
        },
        (o) => {
          var u;
          i("PaymentPending:", o), (u = e.onPaymentPending) == null || u.call(e, o);
        },
        (o) => {
          var u;
          i("PaymentMethodSelected:", o), N(o), window.PayConductor && (window.PayConductor.selectedPaymentMethod = o), (u = e.onPaymentMethodSelected) == null || u.call(e, o);
        }
      );
    };
    window.addEventListener("message", K), i("SDK initialized — waiting for PayConductorCheckoutElement");
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
function ne(e) {
  const r = V(null), [t, n] = R(() => ""), [a, l] = R(() => !1);
  return D(() => {
    const s = (m) => {
      m != null && m.frame && (n(m.frame.iframeUrl || ""), m.frame.iframe = r.current, console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        t
      ), l(!0));
    }, I = typeof window < "u" ? window.PayConductor : null;
    if (I)
      s(I);
    else {
      const m = (P) => {
        s(P.detail), window.removeEventListener("payconductor:registered", m);
      };
      window.addEventListener("payconductor:registered", m);
    }
  }, []), /* @__PURE__ */ L(
    "div",
    {
      className: "payconductor-element",
      style: {
        width: "100%"
      },
      children: a && t ? /* @__PURE__ */ L(
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
function re() {
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
function oe() {
  const e = () => typeof window < "u" ? window.PayConductor : null, r = (t, n) => {
    const a = e();
    if (!a) return;
    const l = _(a);
    l != null && l.contentWindow && l.contentWindow.postMessage({
      type: t,
      data: n
    }, "*");
  };
  return {
    init: async (t) => {
      const n = _(e()), a = C();
      return X(n || void 0, a, t);
    },
    confirmPayment: async (t) => {
      const n = _(e()), a = C();
      if (!t.orderId)
        throw new Error("Order ID is required");
      return v(n || void 0, a, t);
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
      const t = _(e()), n = C();
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
  q as ALLOWED_ORIGINS,
  ee as ERROR_CODES,
  g as IFRAME_BASE_URL,
  k as IFRAME_DEFAULT_HEIGHT_VALUE,
  f as POST_MESSAGES,
  te as PayConductor,
  ne as PayConductorCheckoutElement,
  B as REQUEST_TIMEOUT,
  W as buildIframeUrl,
  te as default,
  j as generateRequestId,
  z as isValidOrigin,
  re as usePayConductor,
  oe as usePayconductorElement
};
//# sourceMappingURL=index.es.js.map
