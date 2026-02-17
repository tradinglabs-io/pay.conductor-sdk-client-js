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

@Component({
  selector: "pay-conductor",
  template: `
    <div
      id="payconductor"
      class="payconductor"
      [ngStyle]="{
          width: '100%',
          position: 'relative'
        }"
    >
      <ng-content></ng-content>
      <ng-container *ngIf="isLoaded"
        ><iframe
          title="PayConductor"
          allow="payment"
          #iframeRef
          [attr.src]="iframeUrl"
          [ngStyle]="{
          width: '100%',
          height: height || IFRAME_DEFAULT_HEIGHT,
          border: 'none'
        }"
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

  @Input() clientId!: PayConductorEmbedProps["clientId"];
  @Input() token!: PayConductorEmbedProps["token"];
  @Input() theme!: PayConductorEmbedProps["theme"];
  @Input() locale!: PayConductorEmbedProps["locale"];
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

  ngOnInit() {
    if (typeof window !== "undefined") {
      this.iframeUrl = buildIframeUrl({
        clientId: this.clientId,
        token: this.token,
        theme: this.theme,
        locale: this.locale,
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
      const api = {
        createPaymentMethod: (options: CreatePaymentMethodOptions) =>
          createPaymentMethod(
            this.iframeRef?.nativeElement,
            this.pendingMap,
            options
          ),
        confirmPayment: (paymentMethodId: string) =>
          confirmPayment(
            this.iframeRef?.nativeElement,
            this.pendingMap,
            paymentMethodId
          ),
        validate: (data: any) =>
          validatePayment(this.iframeRef?.nativeElement, this.pendingMap, data),
        reset: () =>
          resetPayment(this.iframeRef?.nativeElement, this.pendingMap),
      };
      window.__payConductor = {
        frame,
        config: {
          clientId: this.clientId,
          token: this.token,
          theme: this.theme,
          locale: this.locale,
        },
        api,
      };
      const eventHandler = (event: MessageEvent) => {
        handleMessageEvent(
          event,
          this.pendingMap,
          (val) => (this.isReady = val),
          (val) => (this.error = val),
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
