import { Show, onMount, createSignal, createMemo } from "solid-js";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

function PayConductorCheckoutElement(props: PayConductorCheckoutElementProps) {
  const [iframeUrl, setIframeUrl] = createSignal("");

  const [isLoaded, setIsLoaded] = createSignal(false);

  let iframeRef: any;

  onMount(() => {
    const init = (ctx: typeof window.PayConductor) => {
      if (!ctx?.frame) return;
      setIframeUrl(ctx.frame.iframeUrl || "");
      ctx.frame.iframe = iframeRef;
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
  });

  return (
    <>
      <div
        class="payconductor-element"
        style={{
          width: "100%",
        }}
      >
        <Show when={isLoaded() && iframeUrl()}>
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
