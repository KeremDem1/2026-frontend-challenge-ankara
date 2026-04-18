import type { RootState } from '../store';
import type { InvestigationRecord, RecordSource } from '../../types/record';
import type { Person } from '../../types/person';

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

export const selectPeople = (state: RootState): Person[] => {
  const byName = new Map<string, Person>();

  for (const record of state.records.items) {
    for (const name of record.participants) {
      let person = byName.get(name);
      if (!person) {
        person = {
          name,
          recordCount: 0,
          sourceCounts: {},
          locations: [],
        };
        byName.set(name, person);
      }
      person.recordCount += 1;
      person.sourceCounts[record.source] =
        (person.sourceCounts[record.source] ?? 0) + 1;
      if (record.location && !person.locations.includes(record.location)) {
        person.locations.push(record.location);
      }
    }
  }

  return [...byName.values()].sort(
    (a, b) => b.recordCount - a.recordCount || a.name.localeCompare(b.name),
  );
};

export const selectFilteredPeople = (state: RootState): Person[] => {
  const all = selectPeople(state);
  const query = state.ui.personSearch.trim().toLowerCase();
  if (!query) return all;
  return all.filter((person) => person.name.toLowerCase().includes(query));
};

const byTimestampAsc = (a: InvestigationRecord, b: InvestigationRecord) => {
  const ta = a.timestampMs ?? Date.parse(a.createdAt) ?? 0;
  const tb = b.timestampMs ?? Date.parse(b.createdAt) ?? 0;
  return ta - tb;
};

export const selectRecordsForSelectedPerson = (
  state: RootState,
): InvestigationRecord[] => {
  const name = state.ui.selectedPersonName;
  if (!name) return [];
  return state.records.items
    .filter((record) => record.participants.includes(name))
    .slice()
    .sort(byTimestampAsc);
};

export const selectFilteredRecordsForSelectedPerson = (
  state: RootState,
): InvestigationRecord[] => {
  const records = selectRecordsForSelectedPerson(state);
  const query = state.ui.recordSearch.trim().toLowerCase();
  const filter: RecordSource[] = state.ui.sourceFilter;

  return records.filter((record) => {
    if (filter.length > 0 && !filter.includes(record.source)) return false;
    if (!query) return true;

    const haystack = [
      record.text,
      record.location,
      record.seenWith,
      record.personName,
      record.timestamp,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
};

export const selectSelectedRecord = (
  state: RootState,
): InvestigationRecord | undefined => {
  const id = state.ui.selectedRecordId;
  if (!id) return undefined;
  return state.records.items.find((record) => record.id === id);
};
