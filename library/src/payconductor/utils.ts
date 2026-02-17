import { DEFAULT_LOCALE, IFRAME_BASE_URL } from './constants';
import type { PayConductorConfig, PayConductorTheme } from './types';

export function buildIframeUrl(config: PayConductorConfig): string {
  const params = new URLSearchParams({
    clientId: config.clientId,
    token: config.token,
    locale: config.locale || DEFAULT_LOCALE,
  });

  if (config.theme) {
    params.set('theme', JSON.stringify(config.theme));
  }

  return `${IFRAME_BASE_URL}?${params.toString()}`;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

export function mergeTheme(userTheme: PayConductorTheme, defaultTheme: PayConductorTheme): PayConductorTheme {
  return {
    ...defaultTheme,
    ...userTheme,
    fontSize: {
      ...defaultTheme.fontSize,
      ...userTheme.fontSize
    },
    fontWeight: {
      ...defaultTheme.fontWeight,
      ...userTheme.fontWeight
    },
    spacing: {
      ...defaultTheme.spacing,
      ...userTheme.spacing
    }
  };
}
