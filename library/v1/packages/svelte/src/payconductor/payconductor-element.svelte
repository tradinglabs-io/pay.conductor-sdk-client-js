<script context="module" lang="ts">
  export interface PayConductorCheckoutElementProps {
    height?: string;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

  export let height: PayConductorCheckoutElementProps["height"] = undefined;
  function stringifyStyles(stylesObj) {
    let styles = "";
    for (let key in stylesObj) {
      const dashedKey = key.replace(/[A-Z]/g, function (match) {
        return "-" + match.toLowerCase();
      });
      styles += dashedKey + ":" + stylesObj[key] + ";";
    }
    return styles;
  }

  let iframeRef;

  let iframeUrl = "";
  let isLoaded = false;

  onMount(() => {
    const init = (ctx: typeof window.PayConductor) => {
      if (!ctx?.frame) return;
      iframeUrl = ctx.frame.iframeUrl || "";
      ctx.frame.iframe = iframeRef;
      isLoaded = true;
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
</script>

<div
  style={stringifyStyles({
    width: "100%",
  })}
  class="payconductor-element"
>
  {#if isLoaded && iframeUrl}
    <iframe
      style={stringifyStyles({
        width: "100%",
        height: height || IFRAME_DEFAULT_HEIGHT_VALUE,
        border: "none",
      })}
      allow="payment"
      title="PayConductor"
      bind:this={iframeRef}
      src={iframeUrl}
    />
  {/if}
</div>