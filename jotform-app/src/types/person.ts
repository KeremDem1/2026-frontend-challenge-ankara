import type { RecordSource } from './record';

export interface Person {
  name: string;
  recordCount: number;
  sourceCounts: Partial<Record<RecordSource, number>>;
  locations: string[];
}
