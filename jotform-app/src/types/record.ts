import type { JotformAnswer } from './jotform';

export type RecordSource =
  | 'Checkins'
  | 'Messages'
  | 'Sightings'
  | 'PersonalNotes'
  | 'AnonymousTips';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface InvestigationRecord {
  id: string;
  source: RecordSource;
  formId: string;
  createdAt: string;

  personName?: string;
  seenWith?: string;
  participants: string[];

  location?: string;
  coordinates?: GeoPoint;

  timestamp?: string;
  timestampMs?: number;

  text?: string;

  rawAnswers: Record<string, JotformAnswer>;
}
