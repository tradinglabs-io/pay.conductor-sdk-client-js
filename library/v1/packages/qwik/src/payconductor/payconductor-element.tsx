import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

import {
  Fragment,
  component$,
  h,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

export interface PayConductorCheckoutElementProps {
  height?: string;
}
export const PayConductorCheckoutElement = component$(
  (props: PayConductorCheckoutElementProps) => {
    const iframeRef = useSignal<Element>();
    const state = useStore<any>({ iframeUrl: "", isLoaded: false });
    useVisibleTask$(() => {
      const init = (ctx: typeof window.PayConductor) => {
        if (!ctx?.frame) return;
        state.iframeUrl = ctx.frame.iframeUrl || "";
        ctx.frame.iframe = iframeRef.value;
        console.log(
          "[PayConductorCheckoutElement] iframe registered, src:",
          state.iframeUrl
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
        {state.isLoaded && state.iframeUrl ? (
          <iframe
            allow="payment"
            title="PayConductor"
            ref={iframeRef}
            src={state.iframeUrl}
            style={{
              width: "100%",
              height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
              border: "none",
            }}
          ></iframe>
        ) : null}
      </div>
    );
  }
);

export default PayConductorCheckoutElement;
