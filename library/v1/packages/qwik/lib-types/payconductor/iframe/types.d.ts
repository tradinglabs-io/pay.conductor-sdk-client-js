export declare enum PaymentMethod {
    Pix = "Pix",
    CreditCard = "CreditCard",
    DebitCard = "DebitCard",
    BankSlip = "BankSlip",
    Crypto = "Crypto",
    ApplePay = "ApplePay",
    NuPay = "NuPay",
    PicPay = "PicPay",
    AmazonPay = "AmazonPay",
    SepaDebit = "SepaDebit",
    GooglePay = "GooglePay"
}
export declare enum PaymentMethodLayout {
    Grid = "grid",
    Vertical = "vertical",
    Horizontal = "horizontal"
}
export declare enum PaymentStatus {
    Succeeded = "succeeded",
    Pending = "pending",
    Failed = "failed"
}
export declare enum DeviceType {
    Android = "android",
    IOS = "ios",
    Web = "web"
}
export declare enum InputStyleKey {
    Padding = "padding",
    Radius = "radius",
    Color = "color",
    Background = "background",
    Shadow = "shadow"
}
export declare enum OutgoingMessage {
    Init = "INIT",
    Config = "CONFIG",
    Update = "UPDATE",
    ConfirmPayment = "CONFIRM_PAYMENT",
    Validate = "VALIDATE",
    Reset = "RESET"
}
export declare enum IncomingMessage {
    Ready = "READY",
    Error = "ERROR",
    PaymentComplete = "PAYMENT_COMPLETE",
    PaymentFailed = "PAYMENT_FAILED",
    PaymentPending = "PAYMENT_PENDING",
    ValidationError = "VALIDATION_ERROR",
    PaymentMethodSelected = "PAYMENT_METHOD_SELECTED"
}
export declare enum ErrorCode {
    InvalidClient = "InvalidClient",
    InvalidToken = "InvalidToken",
    NetworkError = "NetworkError",
    IframeNotReady = "IframeNotReady",
    PaymentDeclined = "PaymentDeclined",
    ValidationError = "ValidationError",
    Timeout = "Timeout"
}
export type InputStyleConfig = {
    padding?: string;
    radius?: string;
    color?: string;
    background?: string;
    shadow?: string;
};
export type PaymentMethodsConfig = {
    layout?: PaymentMethodLayout;
    gap?: string;
    inputStyle?: InputStyleConfig;
};
export type PaymentMethodConfig = {
    method: PaymentMethod;
    discount?: number;
    showBrands?: boolean;
    installments?: {
        count: number;
        amount: number;
    }[];
};
export type PaymentMethodsResponse = {
    methods: PaymentMethod[];
    config: PaymentMethodsConfig;
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
export declare const defaultTheme: PayConductorTheme;
export type PayConductorConfig = {
    publicKey: string;
    intentToken?: string;
    theme?: PayConductorTheme;
    locale?: string;
    paymentMethods?: PaymentMethod[] | "all";
    defaultPaymentMethod?: PaymentMethod;
    paymentMethodsConfig?: PaymentMethodConfig[];
    methodsDirection?: "vertical" | "horizontal";
    showPaymentButtons?: boolean;
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
export type CreatePaymentMethodOptions = {
    billingDetails: BillingDetails;
    card?: CardData;
};
export type PaymentMethodResult = {
    id: string;
    type: PaymentMethod;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    billingDetails?: BillingDetails;
};
export type PaymentResult = {
    paymentIntentId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    message?: string;
};
export interface MessagePayload {
    type: OutgoingMessage | IncomingMessage;
    data?: unknown;
    requestId?: string;
    error?: {
        code: string;
        message: string;
        field?: string;
    };
}
export type CardTokenData = {
    token: string;
    firstSixCardNumber?: string;
};
export type CardFullData = {
    number: string;
    holderName: string;
    cvv: string;
    expiration: {
        month: number;
        year: number;
    };
};
export type CardPaymentData = CardTokenData | CardFullData;
export type PixPaymentData = {
    paymentMethod: PaymentMethod.Pix;
    expirationInSeconds?: number;
};
export type CreditCardPaymentData = {
    paymentMethod: PaymentMethod.CreditCard;
    card: CardPaymentData;
    installments: number;
    softDescriptor?: string;
};
export type BankSlipPaymentData = {
    paymentMethod: PaymentMethod.BankSlip;
    expirationInDays?: number;
};
export type NuPayData = {
    cancelUrl: string;
    merchantName: string;
    returnUrl: string;
    storeName?: string;
};
export type NuPayPaymentData = {
    paymentMethod: PaymentMethod.NuPay;
    nuPay: NuPayData;
};
export type PicPayPaymentData = {
    paymentMethod: PaymentMethod.PicPay;
};
export type PaymentConfirmData = PixPaymentData | CreditCardPaymentData | BankSlipPaymentData | NuPayPaymentData | PicPayPaymentData;
