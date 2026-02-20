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
		const ctx = typeof window !== "undefined" ? window.PayConductor : null;

		if (!ctx) {
			console.warn("[PayConductorCheckoutElement] window.PayConductor not found — ensure <PayConductor> is mounted before <PayConductorCheckoutElement>");
		}

		if (ctx?.frame) {
			state.iframeUrl = ctx.frame.iframeUrl || "";
			ctx.frame.iframe = iframeRef;
			console.log("[PayConductorCheckoutElement] iframe registered, src:", state.iframeUrl);
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
			{state.isLoaded && state.iframeUrl && (
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
