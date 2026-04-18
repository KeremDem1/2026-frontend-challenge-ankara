import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectSelectedRecord } from '../store/records/selectors';
import { personSelected, recordSelected } from '../store/ui/uiSlice';
import { formatTimestamp } from '../utils/format';
import EmptyState from './EmptyState';
import SourceBadge from './SourceBadge';
import styles from './DetailPanel.module.css';

export default function DetailPanel() {
  const dispatch = useAppDispatch();
  const record = useAppSelector(selectSelectedRecord);

  if (!record) {
    return (
      <aside className={styles.panel} aria-label="Record detail">
        <div className={styles.placeholder}>
          <EmptyState
            title="No record selected"
            description="Click a record from the timeline to see its full details and follow the chain."
          />
        </div>
      </aside>
    );
  }

  const followChain = (name: string) => dispatch(personSelected(name));

  return (
    <aside className={styles.panel} aria-label="Record detail">
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>Record detail</h3>
          <button
            type="button"
            className={styles.close}
            onClick={() => dispatch(recordSelected(null))}
            aria-label="Close detail"
            title="Close detail"
          >
            ×
          </button>
        </div>
        <SourceBadge source={record.source} />
        <span className={styles.timestamp}>
          {formatTimestamp(record.timestamp, record.timestampMs)}
          {record.timestamp &&
            record.timestampMs &&
            ` · ${record.timestamp}`}
        </span>
      </header>

      <div className={styles.body}>
        {record.personName && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Person</span>
            <button
              type="button"
              className={styles.linkChip}
              onClick={() => followChain(record.personName!)}
              title={`Focus timeline on ${record.personName}`}
            >
              {record.personName}
              <span className={styles.chipIcon}>↗</span>
            </button>
          </div>
        )}

        {record.seenWith && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Seen with</span>
            <button
              type="button"
              className={styles.linkChip}
              onClick={() => followChain(record.seenWith!)}
              title={`Follow the chain to ${record.seenWith}`}
            >
              {record.seenWith}
              <span className={styles.chipIcon}>↗</span>
            </button>
          </div>
        )}

        {record.mentions && record.mentions.length > 0 && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Mentions</span>
            <div className={styles.chipRow}>
              {record.mentions.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={styles.linkChip}
                  onClick={() => followChain(name)}
                  title={`Follow the chain to ${name}`}
                >
                  {name}
                  <span className={styles.chipIcon}>↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {record.location && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Location</span>
            <p className={styles.fieldValue}>{record.location}</p>
            {record.coordinates && (
              <span className={styles.coords}>
                {record.coordinates.lat.toFixed(5)},{' '}
                {record.coordinates.lng.toFixed(5)}
              </span>
            )}
          </div>
        )}

        {record.text && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Note</span>
            <p className={styles.fieldValue}>{record.text}</p>
          </div>
        )}

        {record.confidence && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Confidence</span>
            <span
              className={styles.confidence}
              data-level={record.confidence.toLowerCase()}
            >
              {record.confidence}
            </span>
          </div>
        )}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Submitted</span>
          <p className={styles.fieldValue}>
            {new Date(record.createdAt).toLocaleString()}
          </p>
        </div>

        <details className={styles.raw}>
          <summary className={styles.rawSummary}>Raw answers</summary>
          <pre className={styles.rawContent}>
            {JSON.stringify(record.rawAnswers, null, 2)}
          </pre>
        </details>
      </div>
    </aside>
  );
}
