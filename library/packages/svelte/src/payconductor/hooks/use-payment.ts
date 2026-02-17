import { PayConductorApi } from "../types";
export function usePayment(): PayConductorApi {
  const ctx = typeof window !== 'undefined' ? window.__payConductor : null;
  if (!ctx) {
    return {
      createPaymentMethod: async () => {
        throw new Error('PayConductor not initialized');
      },
      confirmPayment: async () => {
        throw new Error('PayConductor not initialized');
      },
      validate: async () => {
        throw new Error('PayConductor not initialized');
      },
      reset: async () => {
        throw new Error('PayConductor not initialized');
      }
    };
  }
  return {
    createPaymentMethod: ctx.api.createPaymentMethod,
    confirmPayment: ctx.api.confirmPayment,
    validate: ctx.api.validate,
    reset: ctx.api.reset
  };
}