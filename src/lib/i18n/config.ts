import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";
import pt from "./pt.json";

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es }, pt: { translation: pt } },
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  detection: { order: ["navigator", "htmlTag", "path", "subdomain"], caches: [] },
});

export default i18n;
