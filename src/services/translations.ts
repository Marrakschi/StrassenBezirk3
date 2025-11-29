import { Language } from '../types';
export const translations = {
  de: { uploadCSV: "CSV hochladen", downloadCode: "Code Download", install: "Anheften", startCamera: "Kamera Starten", newScan: "Neuer Scan", processing: "Analysiere Bild...", hint: "Fotografiere ein Straßenschild.", hintNoCSV: "Hinweis: Noch keine Straßenliste geladen. Bitte CSV importieren.", error: "Ein Fehler ist aufgetreten.", streetUnknown: "Konnte keine Straße erkennen.", csvSuccess: "Straßen geladen.", csvError: "Fehler beim Lesen.", resultLabel: "Ergebnis", noNumber: "Keine Nummer", readAgain: "Erneut vorlesen", footer: "Erzeugt von A. Abdel", district: "Bezirk", unknownDistrict: "Unbekannt", legendStreet: "Straße", legendNumber: "Nummer" },
  en: { uploadCSV: "Upload CSV", downloadCode: "Code Download", install: "Install", startCamera: "Start Camera", newScan: "New Scan", processing: "Analyzing...", hint: "Take a photo.", hintNoCSV: "Note: No street list loaded.", error: "Error occurred.", streetUnknown: "Unknown street.", csvSuccess: "Loaded.", csvError: "Read error.", resultLabel: "Result", noNumber: "No number", readAgain: "Read again", footer: "Created by A. Abdel", district: "District", unknownDistrict: "Unknown", legendStreet: "Street", legendNumber: "Number" },
  ar: { uploadCSV: "تحميل CSV", downloadCode: "تحميل الكود", install: "تثبيت", startCamera: "الكاميرا", newScan: "مسح جديد", processing: "تحليل...", hint: "صور اللوحة.", hintNoCSV: "لم يتم تحميل القائمة.", error: "خطأ.", streetUnknown: "غير معروف.", csvSuccess: "تم التحميل.", csvError: "خطأ.", resultLabel: "النتيجة", noNumber: "لا رقم", readAgain: "قراءة", footer: "A. Abdel", district: "المنطقة", unknownDistrict: "غير معروف", legendStreet: "الشارع", legendNumber: "الرقم" }
};
export const getTTSCode = (lang: Language): string => { switch (lang) { case 'en': return 'en-US'; case 'ar': return 'ar-SA'; default: return 'de-DE'; } };
export const translateDistrict = (districtRaw: string, lang: Language): string => {
  if (!districtRaw) return '';
  if (districtRaw.includes('Unbekannt') || districtRaw.includes('Unknown')) return translations[lang].unknownDistrict;
  const match = districtRaw.match(/\d+/);
  return match ? `${translations[lang].district} ${match[0]}` : districtRaw;
};