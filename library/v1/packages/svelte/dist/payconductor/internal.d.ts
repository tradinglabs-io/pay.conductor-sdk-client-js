import { MESSAGE_TYPES } from './constants';
import type { PaymentResult, PaymentMethod, CreatePaymentMethodOptions } from './types';
export type PendingRequest = {
    resolve: (value: any) => void;
    reject: (error: any) => void;
};
export declare function createPendingRequestsMap(): Map<string, PendingRequest>;
export declare function sendMessageToIframe(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, type: keyof typeof MESSAGE_TYPES, data?: any): Promise<any>;
export declare function createPaymentMethod(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: CreatePaymentMethodOptions): Promise<PaymentMethod>;
export declare function confirmPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, paymentMethodId: string): Promise<PaymentResult>;
export declare function validatePayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, data: any): Promise<boolean>;
export declare function resetPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<void>;
export declare function handleMessageEvent(event: MessageEvent, pendingMap: Map<string, PendingRequest> | null, setIsReady: (value: boolean) => void, setError: (value: string | null) => void, onReady?: () => void, onError?: (error: Error) => void, onPaymentComplete?: (data: any) => void): void;
