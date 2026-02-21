<template>
  <div
    class="payconductor-element"
    :style="{
      width: '100%',
    }"
  >
    <template
      v-if="
        isLoaded &&
        iframeUrl &&
        this.$refs.iframeRef &&
        'contentWindow' in this.$refs.iframeRef
      "
    >
      <iframe
        allow="payment"
        title="PayConductor"
        ref="iframeRef"
        :src="iframeUrl"
        :style="{
          width: '100%',
          height: height || IFRAME_DEFAULT_HEIGHT_VALUE,
          border: 'none',
        }"
      ></iframe>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

export default defineComponent({
  name: "pay-conductor-checkout-element",

  props: ["height"],

  data() {
    return { iframeUrl: "", isLoaded: false, IFRAME_DEFAULT_HEIGHT_VALUE };
  },

  mounted() {
    const init = (ctx: typeof window.PayConductor) => {
      if (!ctx?.frame) return;
      this.iframeUrl = ctx.frame.iframeUrl || "";
      ctx.frame.iframe = this.$refs.iframeRef;
      console.log(
        "[PayConductorCheckoutElement] iframe registered, src:",
        this.iframeUrl
      );
      this.isLoaded = true;
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
  },
});
</script>