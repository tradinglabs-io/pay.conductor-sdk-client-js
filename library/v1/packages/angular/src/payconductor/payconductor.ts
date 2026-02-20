import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { Component, ViewChild, ElementRef, Input } from "@angular/core";

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
          height: height || IFRAME_DEFAULT_HEIGHT_VALUE,
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
  IFRAME_DEFAULT_HEIGHT_VALUE = IFRAME_DEFAULT_HEIGHT_VALUE;

  @Input() publicKey!: PayConductorEmbedProps["publicKey"];
  @Input() intentToken!: PayConductorEmbedProps["intentToken"];
  @Input() theme!: PayConductorEmbedProps["theme"];
  @Input() locale!: PayConductorEmbedProps["locale"];
  @Input() paymentMethods!: PayConductorEmbedProps["paymentMethods"];
  @Input()
  defaultPaymentMethod!: PayConductorEmbedProps["defaultPaymentMethod"];
  @Input() showPaymentButtons!: PayConductorEmbedProps["showPaymentButtons"];
  @Input() nuPayConfig!: PayConductorEmbedProps["nuPayConfig"];
  @Input() onReady!: PayConductorEmbedProps["onReady"];
  @Input() onError!: PayConductorEmbedProps["onError"];
  @Input() onPaymentComplete!: PayConductorEmbedProps["onPaymentComplete"];
  @Input() onPaymentFailed!: PayConductorEmbedProps["onPaymentFailed"];
  @Input() onPaymentPending!: PayConductorEmbedProps["onPaymentPending"];
  @Input()
  onPaymentMethodSelected!: PayConductorEmbedProps["onPaymentMethodSelected"];
  @Input() height!: PayConductorEmbedProps["height"];

  @ViewChild("iframeRef") iframeRef!: ElementRef;

  isLoaded: PayConductorState["isLoaded"] = false;
  isReady: PayConductorState["isReady"] = false;
  error: PayConductorState["error"] = null;
  iframeUrl: PayConductorState["iframeUrl"] = "";
  pendingMap: PayConductorState["pendingMap"] = null;
  selectedPaymentMethod: PayConductorState["selectedPaymentMethod"] = null;
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
        defaultPaymentMethod: this.defaultPaymentMethod,
      };
      const api: PayConductorApi = {
        confirmPayment: (options: { intentToken: string }) =>
          confirmPayment(
            this.iframeRef?.nativeElement,
            this.pendingMap,
            options
          ),
        validate: (data: unknown) =>
          validatePayment(this.iframeRef?.nativeElement, this.pendingMap, data),
        reset: () =>
          resetPayment(this.iframeRef?.nativeElement, this.pendingMap),
        getSelectedPaymentMethod: () => this.selectedPaymentMethod,
      };
      window.PayConductor = {
        frame,
        config,
        api,
        selectedPaymentMethod: this.selectedPaymentMethod,
      };
      const sendConfigToIframe = async () => {
        if (!this.configSent && this.iframeRef?.nativeElement) {
          this.configSent = true;
          sendConfig(this.iframeRef?.nativeElement, this.pendingMap, {
            intentToken: this.intentToken,
            theme: this.theme,
            locale: this.locale,
            paymentMethods: this.paymentMethods,
            defaultPaymentMethod: this.defaultPaymentMethod,
            showPaymentButtons: this.showPaymentButtons,
            nuPayConfig: this.nuPayConfig,
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
          (data) => this.onPaymentComplete?.(data as PaymentResult),
          (data) => this.onPaymentFailed?.(data as PaymentResult),
          (data) => this.onPaymentPending?.(data as PaymentResult),
          (method) => {
            this.selectedPaymentMethod = method;
            if (window.PayConductor) {
              window.PayConductor.selectedPaymentMethod = method;
            }
            this.onPaymentMethodSelected?.(method);
          }
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
