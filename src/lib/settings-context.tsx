"use client";

import { createContext, useContext, ReactNode } from "react";
import { ChurchSettings } from "@/lib/types";
import { formatCurrency as fmt } from "@/lib/currency";

interface SettingsContextType {
  settings: ChurchSettings;
  formatCurrency: (amount: number) => string;
}

const defaultSettings: ChurchSettings = {
  churchName: "", address: "", phone: "", email: "", website: "",
  branches: [], serviceTimes: [],
  country: "GH", currency: "GHS", currencySymbol: "GH₵", locale: "en-GH", timezone: "Africa/Accra",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  formatCurrency: (a: number) => `$${a}`,
});

export function SettingsProvider({ children, settings }: { children: ReactNode; settings: ChurchSettings }) {
  const s = settings || defaultSettings;
  const formatCurrency = (amount: number) => fmt(amount, s.currencySymbol);

  return (
    <SettingsContext.Provider value={{ settings: s, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
