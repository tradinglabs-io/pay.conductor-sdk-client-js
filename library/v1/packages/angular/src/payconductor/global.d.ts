import { PayConductorContextValue } from "./types";
import { PaymentMethod } from "./iframe/types";
export interface PayConductorWindow {
  PayConductor: (PayConductorContextValue & {
    selectedPaymentMethod?: PaymentMethod | null;
  }) | null;
}
declare global {
  interface Window extends PayConductorWindow {}
}