/** @jsx h */
import { h, Fragment } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

import { IFRAME_DEFAULT_HEIGHT, MESSAGE_TYPES } from "./constants";
import {
  confirmPayment,
  createPaymentMethod,
  createPendingRequestsMap,
  handleMessageEvent,
  PendingRequest,
  resetPayment,
  sendConfig,
  validatePayment,
} from "./internal";
import type {
  ConfirmPaymentOptions,
  CreatePaymentMethodOptions,
  PayConductorApi,
  PayConductorConfig,
  PayConductorFrame,
  PayConductorState,
  PaymentResult,
} from "./types";
import { buildIframeUrl } from "./utils";

function PayConductor(props: PayConductorEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
    };
    const api: PayConductorApi = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef.current, pendingMap, options),
      confirmPayment: (options: ConfirmPaymentOptions) =>
        confirmPayment(iframeRef.current, pendingMap, options),
      validate: (data: any) =>
        validatePayment(iframeRef.current, pendingMap, data),
      reset: () => resetPayment(iframeRef.current, pendingMap),
    };
    window.PayConductor = {
      frame,
      config,
      api,
    };
    const sendConfigToIframe = async () => {
      if (!configSent && iframeRef.current) {
        setConfigSent(true);
        sendConfig(iframeRef.current, pendingMap, {
          intentToken: props.intentToken,
          theme: props.theme,
          locale: props.locale,
          paymentMethods: props.paymentMethods,
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
        props.onPaymentComplete
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
            height: props.height || IFRAME_DEFAULT_HEIGHT,
            border: "none",
          }}
        />
      ) : null}
    </div>
  );
}

export default PayConductor;
