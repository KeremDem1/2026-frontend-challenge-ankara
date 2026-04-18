import { useMemo } from 'react';
import type { RecordSource } from '../types/record';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCanonicalNameMap,
  selectFilteredVisibleRecords,
  selectLocationsForCurrentView,
  selectVisibleRecords,
} from '../store/records/selectors';
import {
  locationFilterChanged,
  recordSearchChanged,
  recordSelected,
  sourceFilterToggled,
} from '../store/ui/uiSlice';
import { formatTimestamp, truncate } from '../utils/format';
import EmptyState from './EmptyState';
import SourceBadge from './SourceBadge';
import styles from './RecordsPanel.module.css';

const ALL_SOURCES: RecordSource[] = [
  'Checkins',
  'Messages',
  'Sightings',
  'PersonalNotes',
  'AnonymousTips',
];

export default function RecordsPanel() {
  const dispatch = useAppDispatch();
  const selectedPersonName = useAppSelector(
    (state) => state.ui.selectedPersonName,
  );
  const viewAll = useAppSelector((state) => state.ui.viewAllRecords);
  const selectedRecordId = useAppSelector(
    (state) => state.ui.selectedRecordId,
  );
  const recordSearch = useAppSelector((state) => state.ui.recordSearch);
  const sourceFilter = useAppSelector((state) => state.ui.sourceFilter);
  const locationFilter = useAppSelector((state) => state.ui.locationFilter);
  const locations = useAppSelector(selectLocationsForCurrentView);
  const visible = useAppSelector(selectVisibleRecords);
  const filtered = useAppSelector(selectFilteredVisibleRecords);
  const nameMap = useAppSelector(selectCanonicalNameMap);

  const resolveName = (raw: string): { canonical: string; raw: string } => {
    const canonical = nameMap.get(raw)?.canonical ?? raw;
    return { canonical, raw };
  };

  const stats = useMemo(() => {
    const locations = new Set(
      visible.map((r) => r.location).filter(Boolean) as string[],
    );
    const sources = new Set(visible.map((r) => r.source));
    return {
      total: visible.length,
      locations: locations.size,
      sources: sources.size,
    };
  }, [visible]);

  if (!viewAll && !selectedPersonName) {
    return (
      <section className={styles.panel}>
        <div className={styles.placeholder}>
          <EmptyState
            title="Pick a person or view all"
            description="Select someone from the People list to see their timeline, or click 'All records' to browse every record."
          />
        </div>
      </section>
    );
  }

  const sourceFilterActive = sourceFilter.length > 0;
  const headerTitle = viewAll ? 'All records' : selectedPersonName!;
  const searchPlaceholder = viewAll
    ? 'Search all records (text, person, location, mentions)...'
    : 'Search within records (text, location, seen with)...';

  return (
    <section className={styles.panel} aria-label="Records timeline">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{headerTitle}</h2>
          <div className={styles.stats}>
            <span>
              <strong>{stats.total}</strong>{' '}
              {stats.total === 1 ? 'record' : 'records'}
            </span>
            <span>
              <strong>{stats.locations}</strong>{' '}
              {stats.locations === 1 ? 'location' : 'locations'}
            </span>
            <span>
              <strong>{stats.sources}</strong>{' '}
              {stats.sources === 1 ? 'source' : 'sources'}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <input
            type="search"
            className={styles.search}
            placeholder={searchPlaceholder}
            value={recordSearch}
            onChange={(e) => dispatch(recordSearchChanged(e.target.value))}
          />
          <div className={styles.chips}>
            <span className={styles.chipsLabel}>Sources</span>
            {ALL_SOURCES.map((source) => (
              <SourceBadge
                key={source}
                source={source}
                variant="chip"
                active={!sourceFilterActive || sourceFilter.includes(source)}
                onClick={() => dispatch(sourceFilterToggled(source))}
              />
            ))}
            <label className={styles.locationFilter}>
              <span className={styles.chipsLabel}>Location</span>
              <select
                className={styles.locationSelect}
                value={locationFilter ?? ''}
                onChange={(e) =>
                  dispatch(
                    locationFilterChanged(
                      e.target.value === '' ? null : e.target.value,
                    ),
                  )
                }
                disabled={locations.length === 0}
              >
                <option value="">All locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className={styles.placeholder}>
          <EmptyState
            title="No matching records"
            description={
              visible.length === 0
                ? viewAll
                  ? 'No records found.'
                  : 'This person has no records.'
                : 'Try clearing the search or adjusting the source and location filters.'
            }
          />
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((record) => {
            const isSelected = record.id === selectedRecordId;
            return (
              <button
                key={record.id}
                type="button"
                className={
                  isSelected
                    ? `${styles.item} ${styles.itemSelected}`
                    : styles.item
                }
                onClick={() => dispatch(recordSelected(record.id))}
                aria-pressed={isSelected}
              >
                <div className={styles.itemTop}>
                  <div className={styles.meta}>
                    <SourceBadge source={record.source} />
                    <span>
                      {formatTimestamp(record.timestamp, record.timestampMs)}
                    </span>
                    {record.location && (
                      <>
                        <span>&middot;</span>
                        <span className={styles.location}>
                          {record.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {record.text && (
                  <p className={styles.text}>{truncate(record.text, 200)}</p>
                )}
                <div className={styles.itemBottom}>
                  {viewAll &&
                    record.personName &&
                    (() => {
                      const { canonical, raw } = resolveName(record.personName);
                      return (
                        <span
                          className={styles.primaryPill}
                          title={canonical !== raw ? `Submitted as "${raw}"` : undefined}
                        >
                          {canonical}
                        </span>
                      );
                    })()}
                  {record.seenWith &&
                    (() => {
                      const { canonical, raw } = resolveName(record.seenWith);
                      return (
                        <span
                          className={styles.withPill}
                          title={canonical !== raw ? `Submitted as "${raw}"` : undefined}
                        >
                          with {canonical}
                        </span>
                      );
                    })()}
                  {!viewAll &&
                    record.personName &&
                    resolveName(record.personName).canonical !==
                      selectedPersonName && (
                      <span
                        className={styles.withPill}
                        title={`Submitted as "${record.personName}"`}
                      >
                        reported about {resolveName(record.personName).canonical}
                      </span>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
