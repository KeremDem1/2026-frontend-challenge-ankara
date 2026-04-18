import { useMemo } from 'react';
import type { RecordSource } from '../types/record';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectFilteredRecordsForSelectedPerson,
  selectRecordsForSelectedPerson,
} from '../store/records/selectors';
import {
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
  const selectedRecordId = useAppSelector(
    (state) => state.ui.selectedRecordId,
  );
  const recordSearch = useAppSelector((state) => state.ui.recordSearch);
  const sourceFilter = useAppSelector((state) => state.ui.sourceFilter);
  const allForPerson = useAppSelector(selectRecordsForSelectedPerson);
  const filtered = useAppSelector(selectFilteredRecordsForSelectedPerson);

  const stats = useMemo(() => {
    const locations = new Set(
      allForPerson.map((r) => r.location).filter(Boolean) as string[],
    );
    const sources = new Set(allForPerson.map((r) => r.source));
    return {
      total: allForPerson.length,
      locations: locations.size,
      sources: sources.size,
    };
  }, [allForPerson]);

  if (!selectedPersonName) {
    return (
      <section className={styles.panel}>
        <div className={styles.placeholder}>
          <EmptyState
            title="Pick a person"
            description="Select someone from the People list to see their timeline of events across all sources."
          />
        </div>
      </section>
    );
  }

  const sourceFilterActive = sourceFilter.length > 0;

  return (
    <section className={styles.panel} aria-label="Records timeline">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{selectedPersonName}</h2>
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
            placeholder="Search within records (text, location, seen with)..."
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
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className={styles.placeholder}>
          <EmptyState
            title="No matching records"
            description={
              allForPerson.length === 0
                ? 'This person has no records.'
                : 'Try clearing the search or adjusting the source filters.'
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
                    <span>{formatTimestamp(record.timestamp, record.timestampMs)}</span>
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
                  {record.seenWith && (
                    <span className={styles.withPill}>
                      with {record.seenWith}
                    </span>
                  )}
                  {record.personName &&
                    record.personName !== selectedPersonName && (
                      <span className={styles.withPill}>
                        reported about {record.personName}
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
