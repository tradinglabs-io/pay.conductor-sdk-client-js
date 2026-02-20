import { PayConductorConfig, PaymentMethod, PaymentResult } from "./iframe/types";
export interface PayConductorEmbedProps extends PayConductorConfig {
    height?: string;
    children?: any;
    showActionButtons?: boolean;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onPaymentComplete?: (result: PaymentResult) => void;
    onPaymentFailed?: (result: PaymentResult) => void;
    onPaymentPending?: (result: PaymentResult) => void;
    onPaymentMethodSelected?: (method: PaymentMethod) => void;
}
export declare const PayConductor: import("@builder.io/qwik").Component<PayConductorEmbedProps>;
export default PayConductor;
