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
      const ctx = typeof window !== "undefined" ? window.PayConductor : null;
      if (!ctx) {
        console.warn(
          "[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>"
        );
      }
      if (ctx?.frame) {
        state.iframeUrl = ctx.frame.iframeUrl || "";
        ctx.frame.iframe = iframeRef.value;
        console.log(
          "[PayConductorCheckoutElement] iframe registered, src:",
          state.iframeUrl
        );
      }
      state.isLoaded = true;
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
        iframeRef.value &&
        "contentWindow" in iframeRef.value ? (
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
