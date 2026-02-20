/** @jsx h */
import { h, Fragment } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

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

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";
import type {
  PayConductorConfig,
  PaymentMethod,
  PaymentResult,
} from "./iframe/types";
import {
  confirmPayment,
  createPendingRequestsMap,
  handleMessageEvent,
  resetPayment,
  sendConfig,
  validatePayment,
} from "./internal";
import type {
  PayConductorApi,
  PayConductorFrame,
  PayConductorState,
  PendingRequest,
} from "./types";
import { buildIframeUrl } from "./utils";

function PayConductor(props: PayConductorEmbedProps) {
  const iframeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState<PayConductorState["isLoaded"]>(
    () => false
  );

  const [isReady, setIsReady] = useState<PayConductorState["isReady"]>(
    () => false
  );

  const [error, setError] = useState<PayConductorState["error"]>(() => null);

  const [iframeUrl, setIframeUrl] = useState<PayConductorState["iframeUrl"]>(
    () => ""
  );

  const [pendingMap, setPendingMap] = useState<PayConductorState["pendingMap"]>(
    () => null
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PayConductorState["selectedPaymentMethod"]
  >(() => null);

  const [configSent, setConfigSent] = useState(() => false);

  useEffect(() => {
    setIframeUrl(
      buildIframeUrl({
        publicKey: props.publicKey,
      })
    );
    setIsLoaded(true);
    setPendingMap(createPendingRequestsMap());
    const frame: PayConductorFrame = {
      iframe: iframeRef.current,
      get isReady() {
        return isReady;
      },
      get error() {
        return error;
      },
    };
    const config: PayConductorConfig = {
      publicKey: props.publicKey,
      intentToken: props.intentToken,
      theme: props.theme,
      locale: props.locale,
      paymentMethods: props.paymentMethods,
      defaultPaymentMethod: props.defaultPaymentMethod,
    };
    const api: PayConductorApi = {
      confirmPayment: (options: { intentToken: string }) =>
        confirmPayment(iframeRef.current, pendingMap, options),
      validate: (data: unknown) =>
        validatePayment(iframeRef.current, pendingMap, data),
      reset: () => resetPayment(iframeRef.current, pendingMap),
      getSelectedPaymentMethod: () => selectedPaymentMethod,
    };
    window.PayConductor = {
      frame,
      config,
      api,
      selectedPaymentMethod: selectedPaymentMethod,
    };
    const sendConfigToIframe = async () => {
      if (!configSent && iframeRef.current) {
        setConfigSent(true);
        sendConfig(iframeRef.current, pendingMap, {
          intentToken: props.intentToken,
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
          defaultPaymentMethod: props.defaultPaymentMethod,
          showPaymentButtons: props.showPaymentButtons,
        });
      }
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        pendingMap,
        (val) => {
          setIsReady(val);
          if (val) {
            sendConfigToIframe();
          }
        },
        (val) => {
          setError(val);
        },
        props.onReady,
        props.onError,
        (data) => props.onPaymentComplete?.(data as PaymentResult),
        (data) => props.onPaymentFailed?.(data as PaymentResult),
        (data) => props.onPaymentPending?.(data as PaymentResult),
        (method) => {
          setSelectedPaymentMethod(method);
          if (window.PayConductor) {
            window.PayConductor.selectedPaymentMethod = method;
          }
          props.onPaymentMethodSelected?.(method);
        }
      );
    };
    window.addEventListener("message", eventHandler);
  }, []);

  return (
    <div
      className="payconductor"
      id="payconductor"
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      {props.children}
      {isLoaded ? (
        <iframe
          allow="payment"
          title="PayConductor"
          ref={iframeRef}
          src={iframeUrl}
          style={{
            width: "100%",
            height: props.height || IFRAME_DEFAULT_HEIGHT_VALUE,
            border: "none",
          }}
        />
      ) : null}
    </div>
  );
}

export default PayConductor;
