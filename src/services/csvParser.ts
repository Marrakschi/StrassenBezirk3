import { normalizeStreetName } from './streetLogic';
export const parseCSV = async (file: File): Promise<Map<string, string>> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const map = new Map<string, string>();
  lines.forEach(line => {
    if (!line.trim()) return;
    let delimiter = line.indexOf(';') !== -1 ? ';' : ',';
    const parts = line.split(delimiter);
    if (parts.length >= 2) {
      const rawStreet = parts[0].trim();
      const district = parts[1].trim();
      if (rawStreet && district) {
        map.set(normalizeStreetName(rawStreet), district);
      }
    }
  });
  return map;
};