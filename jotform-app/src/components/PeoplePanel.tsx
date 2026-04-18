import type { RecordSource } from '../types/record';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectAllRecords,
  selectFilteredPeople,
  selectPeople,
} from '../store/records/selectors';
import {
  allRecordsSelected,
  personSearchChanged,
  personSelected,
} from '../store/ui/uiSlice';
import EmptyState from './EmptyState';
import SourceBadge from './SourceBadge';
import styles from './PeoplePanel.module.css';

export default function PeoplePanel() {
  const dispatch = useAppDispatch();
  const people = useAppSelector(selectFilteredPeople);
  const totalPeople = useAppSelector(selectPeople).length;
  const totalRecords = useAppSelector(selectAllRecords).length;
  const search = useAppSelector((state) => state.ui.personSearch);
  const selectedName = useAppSelector((state) => state.ui.selectedPersonName);
  const viewAll = useAppSelector((state) => state.ui.viewAllRecords);

  return (
    <aside className={styles.panel} aria-label="People">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>People</h2>
          <span className={styles.count}>
            {people.length}
            {search ? ` of ${totalPeople}` : ''}
          </span>
        </div>
        <input
          type="search"
          className={styles.search}
          placeholder="Search people..."
          value={search}
          onChange={(e) => dispatch(personSearchChanged(e.target.value))}
        />
      </header>

      <div className={styles.list}>
        <button
          type="button"
          className={
            viewAll
              ? `${styles.allItem} ${styles.itemSelected}`
              : styles.allItem
          }
          onClick={() => dispatch(allRecordsSelected())}
          aria-pressed={viewAll}
          title="Show every record across all people"
        >
          <div className={styles.itemTop}>
            <span className={styles.name}>All records</span>
            <span className={styles.recordCount}>
              {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
            </span>
          </div>
          <div className={styles.allHint}>
            Browse the full chronological feed
          </div>
        </button>

        {people.length === 0 ? (
          <EmptyState
            title="No people match"
            description={
              search
                ? `No one matches "${search}".`
                : 'No participants found in the records.'
            }
          />
        ) : (
          people.map((person) => {
            const isSelected = person.name === selectedName;
            const sources = Object.keys(person.sourceCounts) as RecordSource[];
            return (
              <button
                key={person.name}
                type="button"
                className={
                  isSelected
                    ? `${styles.item} ${styles.itemSelected}`
                    : styles.item
                }
                onClick={() => dispatch(personSelected(person.name))}
                aria-pressed={isSelected}
              >
                <div className={styles.itemTop}>
                  <span className={styles.name}>{person.name}</span>
                  <span className={styles.recordCount}>
                    {person.recordCount}{' '}
                    {person.recordCount === 1 ? 'record' : 'records'}
                  </span>
                </div>
                {person.aliases.length > 0 && (
                  <div className={styles.aliases} title="Merged name variants">
                    Also: {person.aliases.join(', ')}
                  </div>
                )}
                <div className={styles.sources}>
                  {sources.map((source) => (
                    <SourceBadge
                      key={source}
                      source={source}
                      count={person.sourceCounts[source]}
                    />
                  ))}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
