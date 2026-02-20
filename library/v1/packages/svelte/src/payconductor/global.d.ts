import { PayConductorContextValue } from "./types";
export interface PayConductorWindow {
  __PAY_CONDUCTOR__: PayConductorContextValue | null;
}
declare global {
  interface Window extends PayConductorWindow {}
}