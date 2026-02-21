import { onMount, useRef, useStore } from "@builder.io/mitosis";
import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

export default function PayConductorCheckoutElement(
  props: PayConductorCheckoutElementProps,
) {
  const iframeRef = useRef<any>(null);

  const state = useStore({
    iframeUrl: "",
    isLoaded: false,
  });

  onMount(() => {
    const init = (ctx: typeof window.PayConductor) => {
      if (!ctx?.frame) return;
      state.iframeUrl = ctx.frame.iframeUrl || "";
      ctx.frame.iframe = iframeRef;
      console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        state.iframeUrl,
      );
      state.isLoaded = true;
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
    <div
      class="payconductor-element"
      style={{
        width: "100%",
      }}
    >
      {state.isLoaded &&
        state.iframeUrl &&
        iframeRef &&
        "contentWindow" in iframeRef && (
          <iframe
            allow="payment"
            ref={iframeRef}
            src={state.iframeUrl}
            style={{
              width: "100%",
              height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
              border: "none",
            }}
            title="PayConductor"
          />
        )}
    </div>
  );
}
