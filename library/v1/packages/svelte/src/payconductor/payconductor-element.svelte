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
    const ctx = typeof window !== "undefined" ? window.PayConductor : null;
    if (!ctx) {
      console.warn(
        "[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>"
      );
    }
    if (ctx?.frame) {
      iframeUrl = ctx.frame.iframeUrl || "";
      ctx.frame.iframe = iframeRef;
      console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        iframeUrl
      );
    }
    isLoaded = true;
  });
</script>

<div
  style={stringifyStyles({
    width: "100%",
  })}
  class="payconductor-element"
>
  {#if isLoaded && iframeUrl && iframeRef && "contentWindow" in iframeRef}
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