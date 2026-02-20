import { SvelteComponent } from "svelte";
export interface PayConductorEmbedProps extends PayConductorConfig {
    height?: string;
    children?: any;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onPaymentComplete?: (result: PaymentResult) => void;
}
import { PayConductorConfig, PaymentResult } from "./types";
declare const __propDef: {
    props: {
        clientId: PayConductorEmbedProps["clientId"];
        token: PayConductorEmbedProps["token"];
        theme?: PayConductorEmbedProps["theme"];
        locale?: PayConductorEmbedProps["locale"];
        onReady?: PayConductorEmbedProps["onReady"];
        onError?: PayConductorEmbedProps["onError"];
        onPaymentComplete?: PayConductorEmbedProps["onPaymentComplete"];
        height?: PayConductorEmbedProps["height"];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type PayconductorProps = typeof __propDef.props;
export type PayconductorEvents = typeof __propDef.events;
export type PayconductorSlots = typeof __propDef.slots;
export default class Payconductor extends SvelteComponent<PayconductorProps, PayconductorEvents, PayconductorSlots> {
}
export {};
