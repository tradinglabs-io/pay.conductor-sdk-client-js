import { PayConductorConfig } from '../iframe/types';
import { PayConductorFrame } from '../types';

type UsePayConductorReturn = PayConductorFrame & Partial<PayConductorConfig>;
export declare function usePayConductor(): UsePayConductorReturn;
export {};
