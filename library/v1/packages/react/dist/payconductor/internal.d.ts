import { IncomingMessage, OutgoingMessage, PayConductorConfig, PaymentMethod, PaymentResult } from './iframe/types';
import { ConfirmPaymentOptions, PendingRequest } from './types';

export declare function createPendingRequestsMap(): Map<string, PendingRequest>;
export declare function sendMessageToIframe(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, type: OutgoingMessage | IncomingMessage, data?: unknown): Promise<unknown>;
export declare function confirmPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, options: ConfirmPaymentOptions): Promise<PaymentResult>;
export declare function validatePayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, data: unknown): Promise<boolean>;
export declare function resetPayment(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null): Promise<void>;
export declare function sendConfig(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, config: Pick<PayConductorConfig, "theme" | "locale" | "paymentMethods" | "defaultPaymentMethod" | "showPaymentButtons" | "nuPayConfig">): Promise<void>;
export declare function sendInit(iframe: HTMLIFrameElement | Element | undefined, pendingMap: Map<string, PendingRequest> | null, config: PayConductorConfig): Promise<void>;
export declare function handleMessageEvent(event: MessageEvent, pendingMap: Map<string, PendingRequest> | null, setIsReady: (value: boolean) => void, setError: (value: string | null) => void, onReady?: () => void, onError?: (error: Error) => void, onPaymentComplete?: (data: PaymentResult) => void, onPaymentFailed?: (data: PaymentResult) => void, onPaymentPending?: (data: PaymentResult) => void, onPaymentMethodSelected?: (method: PaymentMethod) => void): void;
