export interface CountryConfig {
  name: string;
  currency: string;
  symbol: string;
  locale: string;
  timezone: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  GH: { name: "Ghana", currency: "GHS", symbol: "GH₵", locale: "en-GH", timezone: "Africa/Accra" },
  NG: { name: "Nigeria", currency: "NGN", symbol: "₦", locale: "en-NG", timezone: "Africa/Lagos" },
  US: { name: "United States", currency: "USD", symbol: "$", locale: "en-US", timezone: "America/New_York" },
  UK: { name: "United Kingdom", currency: "GBP", symbol: "£", locale: "en-GB", timezone: "Europe/London" },
  KE: { name: "Kenya", currency: "KES", symbol: "KSh", locale: "en-KE", timezone: "Africa/Nairobi" },
  ZA: { name: "South Africa", currency: "ZAR", symbol: "R", locale: "en-ZA", timezone: "Africa/Johannesburg" },
  UG: { name: "Uganda", currency: "UGX", symbol: "USh", locale: "en-UG", timezone: "Africa/Kampala" },
  TZ: { name: "Tanzania", currency: "TZS", symbol: "TSh", locale: "en-TZ", timezone: "Africa/Dar_es_Salaam" },
  RW: { name: "Rwanda", currency: "RWF", symbol: "FRw", locale: "en-RW", timezone: "Africa/Kigali" },
  CM: { name: "Cameroon", currency: "XAF", symbol: "FCFA", locale: "en-CM", timezone: "Africa/Douala" },
  ZM: { name: "Zambia", currency: "ZMW", symbol: "ZK", locale: "en-ZM", timezone: "Africa/Lusaka" },
  ZW: { name: "Zimbabwe", currency: "ZWL", symbol: "Z$", locale: "en-ZW", timezone: "Africa/Harare" },
  IN: { name: "India", currency: "INR", symbol: "₹", locale: "en-IN", timezone: "Asia/Kolkata" },
  PH: { name: "Philippines", currency: "PHP", symbol: "₱", locale: "en-PH", timezone: "Asia/Manila" },
  BR: { name: "Brazil", currency: "BRL", symbol: "R$", locale: "pt-BR", timezone: "America/Sao_Paulo" },
  AU: { name: "Australia", currency: "AUD", symbol: "A$", locale: "en-AU", timezone: "Australia/Sydney" },
};

export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol} ${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyShort(amount: number, symbol: string): string {
  if (amount >= 1_000_000) return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol} ${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, symbol);
}
