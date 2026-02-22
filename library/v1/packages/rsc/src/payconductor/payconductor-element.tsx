"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

function PayConductorCheckoutElement(props: PayConductorCheckoutElementProps) {
  const iframeRef = useRef<any>(null);
  const [iframeUrl, setIframeUrl] = useState(() => "");

  const [isLoaded, setIsLoaded] = useState(() => false);

  useEffect(() => {
    const init = (ctx: typeof window.PayConductor) => {
      if (!ctx?.frame) return;
      setIframeUrl(ctx.frame.iframeUrl || "");
      setIsLoaded(true);
    };
    const ctx = typeof window !== "undefined" ? window.PayConductor : null;
    if (ctx) {
      init(ctx);
    } else {
      const handler = (e: Event) => {
        init((e as CustomEvent).detail);
        window.removeEventListener("payconductor:registered", handler);
      };
      window.addEventListener("payconductor:registered", handler);
    }
  }, []);

  return (
    <div
      className="payconductor-element"
      style={{
        width: "100%",
      }}
    >
      {isLoaded && iframeUrl ? (
        <iframe
          allow="payment"
          title="PayConductor"
          ref={iframeRef}
          src={iframeUrl}
          style={{
            width: "100%",
            height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
            border: "none",
          }}
        />
      ) : null}
    </div>
  );
}

export default PayConductorCheckoutElement;
