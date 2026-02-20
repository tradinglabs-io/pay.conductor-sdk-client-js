import type { BillingDetails, PayConductorApi, PayConductorConfig, PaymentMethod, PaymentResult } from "../types";
export type SubmitResult = {
    error?: {
        message: string;
        code?: string;
        type?: "validation_error" | "payment_error";
    };
    paymentMethod?: PaymentMethod;
};
export type ConfirmPaymentOptions = {
    intentToken: string;
    returnUrl?: string;
};
export type UpdateOptions = {
    billingDetails?: Partial<BillingDetails>;
    address?: Partial<BillingDetails["address"]>;
};
export interface UseElementReturn extends PayConductorApi {
    updateConfig: (config: Partial<Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">>) => void;
    updateIntentToken: (intentToken: string) => void;
    update: (options: UpdateOptions) => void;
    submit: () => Promise<SubmitResult>;
    confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
}
export declare function useElement(): UseElementReturn;
