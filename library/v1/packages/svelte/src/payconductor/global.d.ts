import { PayConductorContextValue } from "./types";
export interface PayConductorWindow {
  PayConductor: PayConductorContextValue | null;
}
declare global {
  interface Window extends PayConductorWindow {}
}