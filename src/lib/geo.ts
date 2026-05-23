const IPAPI_URL = "https://ipapi.co/json/";

const timezoneCountryMap: Record<string, string> = {
  "Africa/Lagos": "NG", "Africa/Accra": "GH", "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA",
  "Africa/Kampala": "UG", "Africa/Dar_es_Salaam": "TZ", "Africa/Kigali": "RW", "Africa/Douala": "CM",
  "Africa/Lusaka": "ZM", "Africa/Harare": "ZW", "America/New_York": "US", "America/Chicago": "US",
  "America/Los_Angeles": "US", "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "Europe/London": "UK", "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Madrid": "ES",
  "Asia/Kolkata": "IN", "Asia/Manila": "PH", "Asia/Dubai": "AE", "Asia/Singapore": "SG",
  "Australia/Sydney": "AU", "Pacific/Auckland": "NZ",
};

export interface GeoInfo {
  country: string;
  currency: string;
  symbol: string;
  locale: string;
}

export async function detectCountry(): Promise<string> {
  try {
    const res = await fetch(IPAPI_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("IP API failed");
    const data = await res.json();
    return data.country_code || fallbackCountry();
  } catch {
    return fallbackCountry();
  }
}

export function detectLanguage(): string {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || "en";
  const code = lang.split("-")[0];
  if (["en", "fr", "es", "pt"].includes(code)) return code;
  return "en";
}

function fallbackCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezoneCountryMap[tz] || "US";
  } catch {
    return "US";
  }
}

const currencyMap: Record<string, { currency: string; symbol: string; locale: string }> = {
  NG: { currency: "NGN", symbol: "₦", locale: "en-NG" },
  GH: { currency: "GHS", symbol: "GH₵", locale: "en-GH" },
  KE: { currency: "KES", symbol: "KSh", locale: "en-KE" },
  ZA: { currency: "ZAR", symbol: "R", locale: "en-ZA" },
  UG: { currency: "UGX", symbol: "USh", locale: "en-UG" },
  TZ: { currency: "TZS", symbol: "TSh", locale: "en-TZ" },
  RW: { currency: "RWF", symbol: "FRw", locale: "en-RW" },
  CM: { currency: "XAF", symbol: "FCFA", locale: "en-CM" },
  ZM: { currency: "ZMW", symbol: "ZK", locale: "en-ZM" },
  ZW: { currency: "ZWL", symbol: "Z$", locale: "en-ZW" },
  US: { currency: "USD", symbol: "$", locale: "en-US" },
  UK: { currency: "GBP", symbol: "£", locale: "en-GB" },
  FR: { currency: "EUR", symbol: "€", locale: "fr-FR" },
  DE: { currency: "EUR", symbol: "€", locale: "de-DE" },
  IN: { currency: "INR", symbol: "₹", locale: "en-IN" },
  PH: { currency: "PHP", symbol: "₱", locale: "en-PH" },
  BR: { currency: "BRL", symbol: "R$", locale: "pt-BR" },
  AU: { currency: "AUD", symbol: "A$", locale: "en-AU" },
};

export function getCurrencyForCountry(country: string) {
  return currencyMap[country] || currencyMap.US;
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("Exchange rate API failed");
    const data = await res.json();
    return data.rates?.[to] || 1;
  } catch {
    return 1;
  }
}
