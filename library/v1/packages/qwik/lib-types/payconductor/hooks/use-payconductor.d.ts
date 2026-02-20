import type { PayConductorConfig } from "../iframe/types";
import type { PayConductorFrame } from "../types";
type UsePayConductorReturn = PayConductorFrame & Partial<PayConductorConfig>;
export declare function usePayConductor(): UsePayConductorReturn;
export {};
