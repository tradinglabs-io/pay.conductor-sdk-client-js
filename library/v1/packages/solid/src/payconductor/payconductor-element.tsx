import { Show, onMount, createSignal, createMemo } from "solid-js";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

function PayConductorCheckoutElement(props: PayConductorCheckoutElementProps) {
  const [iframeUrl, setIframeUrl] = createSignal("");

  const [isLoaded, setIsLoaded] = createSignal(false);

  let iframeRef: HTMLIFrameElement | Element | unknown | null;

  onMount(() => {
    const ctx = typeof window !== "undefined" ? window.PayConductor : null;
    if (!ctx) {
      console.warn(
        "[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>"
      );
    }
    if (ctx?.frame) {
      setIframeUrl(ctx.frame.iframeUrl || "");
      ctx.frame.iframe = iframeRef;
      console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        iframeUrl()
      );
    }
    setIsLoaded(true);
  });

  return (
    <>
      <div
        class="payconductor-element"
        style={{
          width: "100%",
        }}
      >
        <Show
          when={
            isLoaded() &&
            iframeUrl() &&
            iframeRef &&
            "contentWindow" in iframeRef
          }
        >
          <iframe
            allow="payment"
            title="PayConductor"
            ref={iframeRef!}
            src={iframeUrl()}
            style={{
              width: "100%",
              height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
              border: "none",
            }}
          ></iframe>
        </Show>
      </div>
    </>
  );
}

export default PayConductorCheckoutElement;
