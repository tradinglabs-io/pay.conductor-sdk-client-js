import { PayConductorContextValue } from "./types";
export interface PayConductorWindow {
  __payConductor: PayConductorContextValue | null;
}
declare global {
  interface Window extends PayConductorWindow {}
}