import { MESSAGE_TYPES } from "./constants";
import type { CreatePaymentMethodOptions, PaymentMethod, PaymentResult, PayConductorConfig } from "./types";
export type PendingRequest = {
    resolve: (value: any) => void;
    reject: (error: any) => void;
};
export declare function createPendingRequestsMap(): Map<string, PendingRequest>;
export declare function sendMessageToIframe(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, type: keyof typeof MESSAGE_TYPES, data?: any): Promise<any>;
export declare function createPaymentMethod(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: CreatePaymentMethodOptions): Promise<PaymentMethod>;
import type { ConfirmPaymentOptions } from "./types";
import { SubmitResult } from "./hooks/use-element";
export declare function confirmPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: ConfirmPaymentOptions): Promise<PaymentResult>;
export declare function validatePayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, data: any): Promise<boolean>;
export declare function resetPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<void>;
export declare function submitPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<SubmitResult>;
export declare function sendConfig(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, config: Pick<PayConductorConfig, "intentToken" | "theme" | "locale" | "paymentMethods">): Promise<void>;
export declare function handleMessageEvent(event: MessageEvent, pendingMap: Map<string, PendingRequest> | null, setIsReady: (value: boolean) => void, setError: (value: string | null) => void, onReady?: () => void, onError?: (error: Error) => void, onPaymentComplete?: (data: any) => void): void;
