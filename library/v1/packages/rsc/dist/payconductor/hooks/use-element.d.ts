import { BillingDetails, PayConductorConfig, PaymentMethod, PaymentResult } from '../iframe/types';

export type SubmitResult = {
    error?: {
        message: string;
        code?: string;
        type?: "validation_error" | "payment_error";
    };
    paymentMethod?: PaymentMethod;
};
export type ConfirmPaymentOptions = {
    orderId: string;
    returnUrl?: string;
};
export type UpdateOptions = {
    billingDetails?: Partial<BillingDetails>;
    address?: Partial<BillingDetails["address"]>;
};
export interface UsePayconductorElementReturn {
    init: (config: PayConductorConfig) => Promise<void>;
    confirmPayment: (options: ConfirmPaymentOptions) => Promise<PaymentResult>;
    validate: (data: unknown) => Promise<boolean>;
    reset: () => Promise<void>;
    getSelectedPaymentMethod: () => PaymentMethod | null;
    updateConfig: (config: Partial<Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods">>) => void;
    updateorderId: (orderId: string) => void;
    update: (options: UpdateOptions) => void;
    submit: () => Promise<SubmitResult>;
}
export declare function usePayconductorElement(): UsePayconductorElementReturn;
