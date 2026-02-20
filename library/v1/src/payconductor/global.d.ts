import { PayConductorContextValue, PaymentMethod } from "./types";

export interface PayConductorWindow {
  PayConductor: (PayConductorContextValue & { selectedPaymentMethod?: PaymentMethod | null }) | null;
}

declare global {
  interface Window extends PayConductorWindow {}
}
