import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { InvestigationRecord, RecordSource } from '../../types/record';
import type { Person } from '../../types/person';
import {
  clusterNames,
  identityNameMap,
  normalizeName,
  type NameClusterEntry,
} from '../../utils/nameMatching';

export const selectAllRecords = (state: RootState) => state.records.items;

export const selectRecordsStatus = (state: RootState) => state.records.status;

export const selectRecordsError = (state: RootState) => state.records.error;

const selectFuzzyEnabled = (state: RootState) => state.ui.fuzzyMatching;

export const selectCanonicalNameMap = createSelector(
  [selectAllRecords, selectFuzzyEnabled],
  (records, fuzzy): Map<string, NameClusterEntry> => {
    const allParticipants = records.flatMap((r) => r.participants);
    return fuzzy ? clusterNames(allParticipants) : identityNameMap(allParticipants);
  },
);

function resolveCanonical(
  name: string,
  map: Map<string, NameClusterEntry>,
): string {
  return map.get(name)?.canonical ?? name;
}

export const selectUniquePeople = createSelector(
  [selectAllRecords, selectCanonicalNameMap],
  (records, nameMap): string[] => {
    const set = new Set<string>();
    for (const record of records) {
      for (const raw of record.participants) {
        set.add(resolveCanonical(raw, nameMap));
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  },
);

export const selectUniqueLocations = (state: RootState): string[] => {
  const locations = state.records.items
    .map((record) => record.location)
    .filter((location): location is string => Boolean(location));
  return [...new Set(locations)].sort((a, b) => a.localeCompare(b));
};

export const selectPeople = createSelector(
  [selectAllRecords, selectCanonicalNameMap],
  (records, nameMap): Person[] => {
    const byCanonical = new Map<
      string,
      Person & { aliasSet: Set<string> }
    >();

    for (const record of records) {
      const canonicalsSeen = new Set<string>();
      for (const raw of record.participants) {
        const canonical = resolveCanonical(raw, nameMap);
        if (canonicalsSeen.has(canonical)) continue;
        canonicalsSeen.add(canonical);

        let person = byCanonical.get(canonical);
        if (!person) {
          person = {
            name: canonical,
            aliases: [],
            recordCount: 0,
            sourceCounts: {},
            locations: [],
            aliasSet: new Set<string>(),
          };
          byCanonical.set(canonical, person);
        }
        person.recordCount += 1;
        person.sourceCounts[record.source] =
          (person.sourceCounts[record.source] ?? 0) + 1;
        if (record.location && !person.locations.includes(record.location)) {
          person.locations.push(record.location);
        }
      }

      for (const raw of record.participants) {
        const canonical = resolveCanonical(raw, nameMap);
        const person = byCanonical.get(canonical);
        if (person && raw !== canonical) person.aliasSet.add(raw);
      }
    }

    return [...byCanonical.values()]
      .map(({ aliasSet, ...person }) => ({
        ...person,
        aliases: [...aliasSet].sort((a, b) => a.localeCompare(b)),
      }))
      .sort(
        (a, b) => b.recordCount - a.recordCount || a.name.localeCompare(b.name),
      );
  },
);

const selectPersonSearch = (state: RootState) => state.ui.personSearch;

export const selectFilteredPeople = createSelector(
  [selectPeople, selectPersonSearch],
  (people, search): Person[] => {
    const query = search.trim().toLowerCase();
    if (!query) return people;
    return people.filter((person) => {
      if (person.name.toLowerCase().includes(query)) return true;
      return person.aliases.some((alias) =>
        alias.toLowerCase().includes(query),
      );
    });
  },
);

const byTimestampAsc = (a: InvestigationRecord, b: InvestigationRecord) => {
  const ta = a.timestampMs ?? Date.parse(a.createdAt) ?? 0;
  const tb = b.timestampMs ?? Date.parse(b.createdAt) ?? 0;
  return ta - tb;
};

const selectSelectedPersonName = (state: RootState) =>
  state.ui.selectedPersonName;

const selectViewAllRecords = (state: RootState) => state.ui.viewAllRecords;

export const selectVisibleRecords = createSelector(
  [
    selectAllRecords,
    selectCanonicalNameMap,
    selectSelectedPersonName,
    selectViewAllRecords,
  ],
  (records, nameMap, selected, viewAll): InvestigationRecord[] => {
    if (viewAll) {
      return records.slice().sort(byTimestampAsc);
    }

    if (!selected) return [];

    const aliasSet = new Set<string>();
    for (const [raw, entry] of nameMap) {
      if (entry.canonical === selected) aliasSet.add(raw);
    }
    if (aliasSet.size === 0) aliasSet.add(selected);

    return records
      .filter((record) => record.participants.some((p) => aliasSet.has(p)))
      .slice()
      .sort(byTimestampAsc);
  },
);

export const selectFilteredVisibleRecords = (
  state: RootState,
): InvestigationRecord[] => {
  const records = selectVisibleRecords(state);
  const query = state.ui.recordSearch.trim().toLowerCase();
  const filter: RecordSource[] = state.ui.sourceFilter;
  const fuzzy = state.ui.fuzzyMatching;
  const nameMap = selectCanonicalNameMap(state);
  const normalizedQuery = fuzzy ? normalizeName(query) : '';

  return records.filter((record) => {
    if (filter.length > 0 && !filter.includes(record.source)) return false;
    if (!query) return true;

    const names = [
      record.personName,
      record.seenWith,
      ...(record.mentions ?? []),
    ].filter((n): n is string => Boolean(n));

    const canonicalNames = fuzzy
      ? names.map((n) => nameMap.get(n)?.canonical ?? n)
      : [];

    const haystack = [
      record.text,
      record.location,
      record.timestamp,
      ...names,
      ...canonicalNames,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (haystack.includes(query)) return true;
    if (fuzzy && normalizedQuery) {
      return normalizeName(haystack).includes(normalizedQuery);
    }
    return false;
  });
};

export const selectSelectedRecord = (
  state: RootState,
): InvestigationRecord | undefined => {
  const id = state.ui.selectedRecordId;
  if (!id) return undefined;
  return state.records.items.find((record) => record.id === id);
};
