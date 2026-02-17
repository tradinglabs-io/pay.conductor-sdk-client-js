import { PendingRequest } from "./internal";
export type PayConductorFrame = {
  iframe: HTMLIFrameElement | Element | unknown | null;
  isReady: boolean;
  error: string | null;
};
export type PayConductorApi = {
  createPaymentMethod: (options: CreatePaymentMethodOptions) => Promise<PaymentMethod>;
  confirmPayment: (paymentMethodId: string) => Promise<PaymentResult>;
  validate: (data: any) => Promise<boolean>;
  reset: () => Promise<void>;
};
export type PayConductorContextValue = {
  frame: PayConductorFrame;
  config: PayConductorConfig | null;
  api: PayConductorApi;
};
export type PayConductorConfig = {
  clientId: string;
  token: string;
  theme?: PayConductorTheme;
  locale?: string;
};
export type PayConductorTheme = {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textSecondaryColor?: string;
  errorColor?: string;
  successColor?: string;
  warningColor?: string;
  borderColor?: string;
  disabledColor?: string;
  fontFamily?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  fontWeight?: {
    normal?: number;
    medium?: number;
    bold?: number;
  };
  lineHeight?: string;
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  borderRadius?: string;
  borderWidth?: string;
  boxShadow?: string;
  boxShadowHover?: string;
  inputBackground?: string;
  inputBorderColor?: string;
  inputBorderRadius?: string;
  inputHeight?: string;
  inputPadding?: string;
  buttonHeight?: string;
  buttonPadding?: string;
  buttonBorderRadius?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
};
export type PayConductorState = {
  isLoaded: boolean;
  isReady: boolean;
  error: string | null;
  iframeUrl: string;
  pendingMap: Map<string, PendingRequest> | null;
};
export type CreatePaymentMethodOptions = {
  billingDetails: BillingDetails;
  card?: CardData;
};
export type BillingDetails = {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};
export type CardData = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
};
export type PaymentMethod = {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: BillingDetails;
};
export type PaymentResult = {
  paymentIntentId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
  currency: string;
};
export type OutgoingMessageType = 'INIT' | 'CREATE_PAYMENT_METHOD' | 'CONFIRM_PAYMENT' | 'VALIDATE' | 'RESET';
export type IncomingMessageType = 'READY' | 'ERROR' | 'PAYMENT_METHOD_CREATED' | 'PAYMENT_COMPLETE' | 'VALIDATION_ERROR'