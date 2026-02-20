import { PayConductorConfig, PaymentMethod, PaymentResult } from './iframe/types';

export type { CardTokenData, CardFullData, CardPaymentData, PixPaymentData, CreditCardPaymentData, BankSlipPaymentData, NuPayData, NuPayPaymentData, PicPayPaymentData, PaymentConfirmData } from './iframe/types';
export type ConfirmPaymentOptions = {
    orderId: string;
    returnUrl?: string;
};
export type SubmitResult = {
    error?: {
        message: string;
        code?: string;
        type?: "validation_error" | "payment_error";
    };
    paymentMethod?: PaymentMethod;
};
export type PayConductorApi = {
    confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
    validate: (data: unknown) => Promise<boolean>;
    reset: () => Promise<void>;
    getSelectedPaymentMethod: () => PaymentMethod | null;
};
export type PayConductorFrame = {
    iframe: HTMLIFrameElement | Element | unknown | null;
    iframeUrl?: string;
    isReady: boolean;
    error: string | null;
};
export type PayConductorContextValue = {
    frame: PayConductorFrame | null;
    config: PayConductorConfig | null;
    api: PayConductorApi;
    selectedPaymentMethod?: PaymentMethod | null;
};
export type PayConductorState = {
    isLoaded: boolean;
    isReady: boolean;
    error: string | null;
    iframeUrl: string;
    pendingMap: Map<string, PendingRequest> | null;
    selectedPaymentMethod: PaymentMethod | null;
};
export type PendingRequest = {
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
};
