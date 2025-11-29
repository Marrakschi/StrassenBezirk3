import { StreetResult, HouseNumberParts } from '../types';
export const normalizeStreetName = (name: string): string => name.toLowerCase().replace('straße', 'str.').replace('str', 'str.').replace(/\.$/, '.').replace(/\s+/g, '-').replace(/-+/g, '-');
const parseHouseNumber = (input: string): HouseNumberParts => {
  const match = input.match(/^(\d+)([a-zA-Z]*)$/);
  return match ? { num: parseInt(match[1], 10), suffix: match[2].toLowerCase() } : { num: 0, suffix: '' };
};
const isLessOrEqual = (a: HouseNumberParts, b: HouseNumberParts) => a.num !== b.num ? a.num < b.num : a.suffix <= b.suffix;
const isGreaterOrEqual = (a: HouseNumberParts, b: HouseNumberParts) => a.num !== b.num ? a.num > b.num : a.suffix >= b.suffix;

export const determineDistrict = (streetNameRaw: string, houseNumberRaw: string, streetMap?: Map<string, string>, streetBox?: number[], numberBox?: number[]): StreetResult => {
  const streetName = normalizeStreetName(streetNameRaw);
  const hn = parseHouseNumber(houseNumberRaw);
  const isEven = hn.num % 2 === 0;
  const baseResult = { name: streetNameRaw, number: houseNumberRaw, district: 'Bezirk Unbekannt', streetBox, numberBox };

  if (streetName.includes('gereonstr')) {
    let d1 = (!isEven && hn.num >= 1 && hn.num <= 3) || (isEven && isGreaterOrEqual(hn, {num:2,suffix:''}) && isLessOrEqual(hn, {num:2,suffix:'c'}));
    return { ...baseResult, name: 'Gereonstraße', district: d1 ? 'Bezirk 1' : 'Bezirk 2' };
  }
  if (streetName.includes('konrad-adenauer')) {
    if (!isEven) {
      if (isGreaterOrEqual(hn, {num:1,suffix:''}) && isLessOrEqual(hn, {num:71,suffix:'a'})) return { ...baseResult, name: 'Konrad-Adenauer-Str.', district: 'Bezirk 1' };
      if (isGreaterOrEqual(hn, {num:75,suffix:''}) && isLessOrEqual(hn, {num:151,suffix:''})) return { ...baseResult, name: 'Konrad-Adenauer-Str.', district: 'Bezirk 3' };
    } else {
      if (isGreaterOrEqual(hn, {num:4,suffix:''}) && isLessOrEqual(hn, {num:44,suffix:'b'})) return { ...baseResult, name: 'Konrad-Adenauer-Str.', district: 'Bezirk 1' };
      if (isGreaterOrEqual(hn, {num:46,suffix:''}) && isLessOrEqual(hn, {num:134,suffix:''})) return { ...baseResult, name: 'Konrad-Adenauer-Str.', district: 'Bezirk 3' };
    }
  }
  if (streetName.includes('oberdorfstr')) {
     if ((!isEven && hn.num <= 21) || (isEven && hn.num >= 2 && hn.num <= 18)) return { ...baseResult, name: 'Oberdorfstraße', district: 'Bezirk 7' };
  }
  if (streetName.includes('rheinblick')) {
    if (!isEven) {
      if (hn.num <= 19) return { ...baseResult, name: 'Rheinblick', district: 'Bezirk 8' };
      if (hn.num >= 21 && hn.num <= 25) return { ...baseResult, name: 'Rheinblick', district: 'Bezirk 7' };
    } else {
      if (hn.num === 12 && hn.suffix === 'a') return { ...baseResult, name: 'Rheinblick', district: 'Bezirk 7' };
      if (hn.num >= 2 && hn.num <= 12) return { ...baseResult, name: 'Rheinblick', district: 'Bezirk 8' };
    }
  }
  if (streetName.includes('rolandstr')) {
    if (!isEven) {
       if ((isGreaterOrEqual(hn,{num:1,suffix:''}) && isLessOrEqual(hn,{num:7,suffix:'b'})) || (hn.num >= 11 && hn.num <= 27)) return { ...baseResult, name: 'Rolandstraße', district: 'Bezirk 1' };
    } else {
       if (hn.num >= 2 && hn.num <= 20) return { ...baseResult, name: 'Rolandstraße', district: 'Bezirk 1' };
    }
  }

  if (streetMap && streetMap.has(streetName)) {
    return { ...baseResult, district: streetMap.get(streetName) || 'Bezirk Unbekannt' };
  }
  return baseResult;
};