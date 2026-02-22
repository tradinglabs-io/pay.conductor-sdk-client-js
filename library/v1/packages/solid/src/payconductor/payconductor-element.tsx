import {
  Show,
  onMount,
  on,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";

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

  const onUpdateFn_0_isLoaded__ = createMemo(() => isLoaded());
  const onUpdateFn_0_iframeUrl__ = createMemo(() => iframeUrl());
  function onUpdateFn_0() {
    if (isLoaded() && iframeUrl() && window.PayConductor?.frame) {
      const el =
        iframeRef || document.querySelector(".payconductor-element iframe");
      if (el) window.PayConductor.frame.iframe = el;
    }
  }
  createEffect(
    on(
      () => [onUpdateFn_0_isLoaded__(), onUpdateFn_0_iframeUrl__()],
      onUpdateFn_0
    )
  );

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
