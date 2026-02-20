/** @jsx h */
import { h, Fragment } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

function PayConductorCheckoutElement(props: PayConductorCheckoutElementProps) {
  const iframeRef = useRef<any>(null);
  const [iframeUrl, setIframeUrl] = useState(() => "");

  const [isLoaded, setIsLoaded] = useState(() => false);

  useEffect(() => {
    const ctx = typeof window !== "undefined" ? window.PayConductor : null;
    if (!ctx) {
      console.warn(
        "[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>"
      );
    }
    if (ctx?.frame) {
      setIframeUrl(ctx.frame.iframeUrl || "");
      ctx.frame.iframe = iframeRef.current;
      console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        iframeUrl
      );
    }
    setIsLoaded(true);
  }, []);

  return (
    <div
      className="payconductor-element"
      style={{
        width: "100%",
      }}
    >
      {isLoaded &&
      iframeUrl &&
      iframeRef.current &&
      "contentWindow" in iframeRef.current ? (
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
