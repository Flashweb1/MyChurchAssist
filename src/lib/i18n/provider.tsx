"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return <>{children}</>;
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
