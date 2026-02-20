import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { Component, ViewChild, ElementRef, Input } from "@angular/core";

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

@Component({
  selector: "pay-conductor",
  template: `
    <div
      class="payconductor"
      id="payconductor"
      [ngStyle]='{
          width: "100%",
          position: "relative"
        }'
    >
      <ng-content></ng-content>
      <ng-container *ngIf="isLoaded"
        ><iframe
          allow="payment"
          title="PayConductor"
          #iframeRef
          [attr.src]="iframeUrl"
          [ngStyle]='{
          width: "100%",
          height: height || IFRAME_DEFAULT_HEIGHT,
          border: "none"
        }'
        ></iframe
      ></ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export default class PayConductor {
  IFRAME_DEFAULT_HEIGHT = IFRAME_DEFAULT_HEIGHT;

  @Input() publicKey!: PayConductorEmbedProps["publicKey"];
  @Input() intentToken!: PayConductorEmbedProps["intentToken"];
  @Input() theme!: PayConductorEmbedProps["theme"];
  @Input() locale!: PayConductorEmbedProps["locale"];
  @Input() paymentMethods!: PayConductorEmbedProps["paymentMethods"];
  @Input() onReady!: PayConductorEmbedProps["onReady"];
  @Input() onError!: PayConductorEmbedProps["onError"];
  @Input() onPaymentComplete!: PayConductorEmbedProps["onPaymentComplete"];
  @Input() height!: PayConductorEmbedProps["height"];

  @ViewChild("iframeRef") iframeRef!: ElementRef;

  isLoaded: PayConductorState["isLoaded"] = false;
  isReady: PayConductorState["isReady"] = false;
  error: PayConductorState["error"] = null;
  iframeUrl: PayConductorState["iframeUrl"] = "";
  pendingMap: PayConductorState["pendingMap"] = null;
  configSent = false;

  ngOnInit() {
    if (typeof window !== "undefined") {
      this.iframeUrl = buildIframeUrl({
        publicKey: this.publicKey,
      });
      this.isLoaded = true;
      this.pendingMap = createPendingRequestsMap();
      const frame: PayConductorFrame = {
        iframe: this.iframeRef?.nativeElement,
        get isReady() {
          return this.isReady;
        },
        get error() {
          return this.error;
        },
      };
      const config: PayConductorConfig = {
        publicKey: this.publicKey,
        intentToken: this.intentToken,
        theme: this.theme,
        locale: this.locale,
        paymentMethods: this.paymentMethods,
      };
      const api: PayConductorApi = {
        createPaymentMethod: (options: CreatePaymentMethodOptions) =>
          createPaymentMethod(
            this.iframeRef?.nativeElement,
            this.pendingMap,
            options
          ),
        confirmPayment: (options: ConfirmPaymentOptions) =>
          confirmPayment(
            this.iframeRef?.nativeElement,
            this.pendingMap,
            options
          ),
        validate: (data: any) =>
          validatePayment(this.iframeRef?.nativeElement, this.pendingMap, data),
        reset: () =>
          resetPayment(this.iframeRef?.nativeElement, this.pendingMap),
      };
      window.PayConductor = {
        frame,
        config,
        api,
      };
      const sendConfigToIframe = async () => {
        if (!this.configSent && this.iframeRef?.nativeElement) {
          this.configSent = true;
          sendConfig(this.iframeRef?.nativeElement, this.pendingMap, {
            intentToken: this.intentToken,
            theme: this.theme,
            locale: this.locale,
            paymentMethods: this.paymentMethods,
          });
        }
      };
      const eventHandler = (event: MessageEvent) => {
        handleMessageEvent(
          event,
          this.pendingMap,
          (val) => {
            this.isReady = val;
            if (val) {
              sendConfigToIframe();
            }
          },
          (val) => {
            this.error = val;
          },
          this.onReady,
          this.onError,
          this.onPaymentComplete
        );
      };
      window.addEventListener("message", eventHandler);
    }
  }
}

@NgModule({
  declarations: [PayConductor],
  imports: [CommonModule],
  exports: [PayConductor],
})
export class PayConductorModule {}
