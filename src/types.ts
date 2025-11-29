export enum AppStep { IDLE = 'IDLE', CAMERA = 'CAMERA', PROCESSING_IMAGE = 'PROCESSING_IMAGE', RESULT = 'RESULT', ERROR = 'ERROR' }
export type Language = 'de' | 'en' | 'ar';
export interface StreetResult { name: string; number?: string; district?: string; streetBox?: number[]; numberBox?: number[]; }
export interface HouseNumberParts { num: number; suffix: string; }