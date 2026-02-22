import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

import {
  Fragment,
  component$,
  h,
  useSignal,
  useStore,
  useTask$,
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
    useTask$(({ track }) => {
      track(() => state.isLoaded);
      track(() => state.iframeUrl);
      if (state.isLoaded && state.iframeUrl && window.PayConductor?.frame) {
        const el =
          iframeRef.value ||
          document.querySelector(".payconductor-element iframe");
        if (el) window.PayConductor.frame.iframe = el;
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
