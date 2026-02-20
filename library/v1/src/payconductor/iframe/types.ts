// PayConductor Shared Types
// Served statically at iframe.payconductor.ai/types.ts
// Used by the iFrame (imported directly) and the SDK Web (synced with: bun sync)

export enum PaymentMethod {
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
	GooglePay = "GooglePay",
}

export enum PaymentMethodLayout {
	Grid = "grid",
	Vertical = "vertical",
	Horizontal = "horizontal",
}

export enum PaymentStatus {
	Succeeded = "succeeded",
	Pending = "pending",
	Failed = "failed",
}

export enum DeviceType {
	Android = "android",
	IOS = "ios",
	Web = "web",
}

export enum InputStyleKey {
	Padding = "padding",
	Radius = "radius",
	Color = "color",
	Background = "background",
	Shadow = "shadow",
}

export enum OutgoingMessage {
	Init = "Init",
	Config = "Config",
	Update = "Update",
	ConfirmPayment = "ConfirmPayment",
	Validate = "Validate",
	Reset = "Reset",
}

export enum IncomingMessage {
	Ready = "Ready",
	Error = "Error",
	PaymentComplete = "PaymentComplete",
	PaymentFailed = "PaymentFailed",
	PaymentPending = "PaymentPending",
	ValidationError = "ValidationError",
	PaymentMethodSelected = "PaymentMethodSelected",
}

export enum ErrorCode {
	InvalidClient = "InvalidClient",
	InvalidToken = "InvalidToken",
	NetworkError = "NetworkError",
	IframeNotReady = "IframeNotReady",
	PaymentDeclined = "PaymentDeclined",
	ValidationError = "ValidationError",
	Timeout = "Timeout",
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
	installments?: { count: number; amount: number }[];
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

export const defaultTheme: PayConductorTheme = {
	primaryColor: "#0066ff",
	secondaryColor: "#5a6b7c",
	backgroundColor: "transparent",
	surfaceColor: "#f8fafc",
	textColor: "#0f172a",
	textSecondaryColor: "#64748b",
	errorColor: "#ef4444",
	successColor: "#22c55e",
	warningColor: "#f59e0b",
	borderColor: "#e2e8f0",
	disabledColor: "#cbd5e1",
	fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontSize: {
		xs: "0.75rem",
		sm: "0.875rem",
		md: "1rem",
		lg: "1.125rem",
		xl: "1.25rem",
	},
	fontWeight: {
		normal: 400,
		medium: 500,
		bold: 600,
	},
	lineHeight: "1.5",
	spacing: {
		xs: "4px",
		sm: "8px",
		md: "16px",
		lg: "24px",
		xl: "32px",
	},
	borderRadius: "8px",
	borderWidth: "1px",
	boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	boxShadowHover: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	inputBackground: "#ffffff",
	inputBorderColor: "#cbd5e1",
	inputBorderRadius: "8px",
	inputHeight: "44px",
	inputPadding: "12px 16px",
	buttonHeight: "48px",
	buttonPadding: "16px 24px",
	buttonBorderRadius: "8px",
	transitionDuration: "0.2s",
	transitionTimingFunction: "ease",
};

export type PayConductorConfig = {
	publicKey: string;
	orderId?: string;
	theme?: PayConductorTheme;
	locale?: string;
	paymentMethods?: PaymentMethod[] | "all";
	defaultPaymentMethod?: PaymentMethod;
	paymentMethodsConfig?: PaymentMethodConfig[];
	methodsDirection?: "vertical" | "horizontal";
	showPaymentButtons?: boolean;
	/** Required when NuPay is an available payment method */
	nuPayConfig?: NuPayData;
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
	orderId: string;
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

export type PaymentConfirmData =
	| PixPaymentData
	| CreditCardPaymentData
	| BankSlipPaymentData
	| NuPayPaymentData
	| PicPayPaymentData;
