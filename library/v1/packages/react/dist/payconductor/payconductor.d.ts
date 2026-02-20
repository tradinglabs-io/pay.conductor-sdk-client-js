import { PayConductorConfig, PaymentMethod, PaymentResult } from './iframe/types';
export interface PayConductorEmbedProps extends Omit<PayConductorConfig, "intentToken"> {
    children?: any;
    showActionButtons?: boolean;
    debug?: boolean;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onPaymentComplete?: (result: PaymentResult) => void;
    onPaymentFailed?: (result: PaymentResult) => void;
    onPaymentPending?: (result: PaymentResult) => void;
    onPaymentMethodSelected?: (method: PaymentMethod) => void;
}
declare function PayConductor(props: PayConductorEmbedProps): import("react/jsx-runtime").JSX.Element;
export default PayConductor;
