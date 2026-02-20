import { ALLOWED_ORIGINS, MESSAGE_TYPES, REQUEST_TIMEOUT } from './constants';
import { generateRequestId, isValidOrigin } from './utils';
export function createPendingRequestsMap() {
    return new Map();
}
export function sendMessageToIframe(iframe, pendingMap, type, data) {
    return new Promise((resolve, reject) => {
        if (!iframe || !("contentWindow" in iframe)) {
            reject(new Error('Iframe not defined'));
            return;
        }
        if (!iframe?.contentWindow) {
            reject(new Error('Iframe not ready'));
            return;
        }
        if (!pendingMap) {
            reject(new Error('Pending requests not initialized'));
            return;
        }
        const requestId = generateRequestId();
        pendingMap.set(requestId, {
            resolve,
            reject
        });
        iframe.contentWindow.postMessage({
            type,
            data,
            requestId
        }, '*');
        setTimeout(() => {
            if (pendingMap?.has(requestId)) {
                pendingMap.delete(requestId);
                reject(new Error('Request timeout'));
            }
        }, REQUEST_TIMEOUT);
    });
}
export function createPaymentMethod(iframe, pendingMap, options) {
    return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CREATE_PAYMENT_METHOD, options);
}
export function confirmPayment(iframe, pendingMap, paymentMethodId) {
    return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.CONFIRM_PAYMENT, {
        paymentMethodId
    });
}
export function validatePayment(iframe, pendingMap, data) {
    return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.VALIDATE, data);
}
export function resetPayment(iframe, pendingMap) {
    return sendMessageToIframe(iframe, pendingMap, MESSAGE_TYPES.RESET);
}
export function handleMessageEvent(event, pendingMap, setIsReady, setError, onReady, onError, onPaymentComplete) {
    if (!isValidOrigin(event.origin, ALLOWED_ORIGINS)) {
        return;
    }
    const payload = event.data;
    const { requestId, type, data, error } = payload;
    if (requestId && pendingMap?.has(requestId)) {
        const { resolve, reject } = pendingMap.get(requestId);
        pendingMap.delete(requestId);
        if (error) {
            reject(new Error(error.message));
        }
        else {
            resolve(data);
        }
        return;
    }
    switch (type) {
        case MESSAGE_TYPES.READY:
            setIsReady(true);
            onReady?.();
            break;
        case MESSAGE_TYPES.ERROR:
            setError(error?.message || 'Unknown error');
            onError?.(new Error(error?.message));
            break;
        case MESSAGE_TYPES.PAYMENT_COMPLETE:
            onPaymentComplete?.(data);
            break;
    }
}
