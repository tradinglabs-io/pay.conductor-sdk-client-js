import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  SimpleChanges,
} from "@angular/core";

export interface PayConductorCheckoutElementProps {
  height?: string;
}

import { IFRAME_DEFAULT_HEIGHT_VALUE } from "./constants";

@Component({
  selector: "pay-conductor-checkout-element",
  template: `
    <div
      class="payconductor-element"
      [ngStyle]='{
          width: "100%"
        }'
    >
      <ng-container *ngIf="isLoaded && iframeUrl"
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
export default class PayConductorCheckoutElement {
  IFRAME_DEFAULT_HEIGHT_VALUE = IFRAME_DEFAULT_HEIGHT_VALUE;

  @Input() height!: PayConductorCheckoutElementProps["height"];

  @ViewChild("iframeRef") iframeRef!: ElementRef;

  iframeUrl = "";
  isLoaded = false;

  ngOnInit() {
    if (typeof window !== "undefined") {
      const init = (ctx: typeof window.PayConductor) => {
        if (!ctx?.frame) return;
        this.iframeUrl = ctx.frame.iframeUrl || "";
        this.isLoaded = true;
      };
      const ctx = typeof window !== "undefined" ? window.PayConductor : null;
      if (ctx) {
        init(ctx);
      } else {
        const handler = (e: Event) => {
          init((e as CustomEvent).detail);
          window.removeEventListener("payconductor:registered", handler);
        };
        window.addEventListener("payconductor:registered", handler);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof window !== "undefined") {
      if (this.isLoaded && this.iframeUrl && window.PayConductor?.frame) {
        const el =
          this.iframeRef?.nativeElement ||
          document.querySelector(".payconductor-element iframe");
        if (el) window.PayConductor.frame.iframe = el;
      }
    }
  }
}

@NgModule({
  declarations: [PayConductorCheckoutElement],
  imports: [CommonModule],
  exports: [PayConductorCheckoutElement],
})
export class PayConductorCheckoutElementModule {}
