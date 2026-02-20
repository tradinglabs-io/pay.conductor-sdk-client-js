import { PayConductorConfig, PaymentResult } from "./types";
export interface PayConductorEmbedProps extends PayConductorConfig {
    height?: string;
    children?: any;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onPaymentComplete?: (result: PaymentResult) => void;
}
export declare const PayConductor: import("@builder.io/qwik").Component<PayConductorEmbedProps>;
export default PayConductor;
