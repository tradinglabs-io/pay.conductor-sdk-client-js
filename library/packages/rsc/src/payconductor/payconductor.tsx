"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";

export interface PayConductorEmbedProps extends PayConductorConfig {
  height?: string;
  children?: any;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: (result: PaymentResult) => void;
}

import { IFRAME_DEFAULT_HEIGHT } from "./constants";
import { buildIframeUrl } from "./utils";
import {
  PayConductorConfig,
  PaymentResult,
  CreatePaymentMethodOptions,
  PayConductorState,
  PayConductorFrame,
} from "./types";
import {
  createPendingRequestsMap,
  createPaymentMethod,
  confirmPayment,
  validatePayment,
  resetPayment,
  handleMessageEvent,
  PendingRequest,
} from "./internal";

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

  useEffect(() => {
    setIframeUrl(
      buildIframeUrl({
        clientId: props.clientId,
        token: props.token,
        theme: props.theme,
        locale: props.locale,
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
    const api = {
      createPaymentMethod: (options: CreatePaymentMethodOptions) =>
        createPaymentMethod(iframeRef.current, pendingMap, options),
      confirmPayment: (paymentMethodId: string) =>
        confirmPayment(iframeRef.current, pendingMap, paymentMethodId),
      validate: (data: any) =>
        validatePayment(iframeRef.current, pendingMap, data),
      reset: () => resetPayment(iframeRef.current, pendingMap),
    };
    window.__payConductor = {
      frame,
      config: {
        clientId: props.clientId,
        token: props.token,
        theme: props.theme,
        locale: props.locale,
      },
      api,
    };
    const eventHandler = (event: MessageEvent) => {
      handleMessageEvent(
        event,
        pendingMap,
        (val) => setIsReady(val),
        (val) => setError(val),
        props.onReady,
        props.onError,
        props.onPaymentComplete
      );
    };
    window.addEventListener("message", eventHandler);
  }, []);

  return (
    <div
      id="payconductor"
      className="payconductor"
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      {props.children}
      {isLoaded ? (
        <iframe
          title="PayConductor"
          allow="payment"
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
