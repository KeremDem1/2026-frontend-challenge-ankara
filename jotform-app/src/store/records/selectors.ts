import type { RootState } from '../store';

export const selectAllRecords = (state: RootState) => state.records.items;

export const selectRecordsStatus = (state: RootState) => state.records.status;

export const selectRecordsError = (state: RootState) => state.records.error;

export const selectUniquePeople = (state: RootState): string[] =>
  [
    ...new Set(state.records.items.flatMap((record) => record.participants)),
  ].sort((a, b) => a.localeCompare(b));

export const selectUniqueLocations = (state: RootState): string[] => {
  const locations = state.records.items
    .map((record) => record.location)
    .filter((location): location is string => Boolean(location));
  return [...new Set(locations)].sort((a, b) => a.localeCompare(b));
};
