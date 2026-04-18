import type { CSSProperties } from 'react';
import type { RecordSource } from '../types/record';
import styles from './SourceBadge.module.css';

const SOURCE_COLOR_VAR: Record<RecordSource, string> = {
  Checkins: 'var(--source-checkins)',
  Messages: 'var(--source-messages)',
  Sightings: 'var(--source-sightings)',
  PersonalNotes: 'var(--source-personalnotes)',
  AnonymousTips: 'var(--source-anonymoustips)',
};

const SOURCE_LABEL: Record<RecordSource, string> = {
  Checkins: 'Check-ins',
  Messages: 'Messages',
  Sightings: 'Sightings',
  PersonalNotes: 'Notes',
  AnonymousTips: 'Tips',
};

type Variant = 'default' | 'chip';

interface Props {
  source: RecordSource;
  count?: number;
  variant?: Variant;
  active?: boolean;
  onClick?: () => void;
}

export default function SourceBadge({
  source,
  count,
  variant = 'default',
  active,
  onClick,
}: Props) {
  const isChip = variant === 'chip';
  const classes = [styles.badge];
  if (onClick) classes.push(styles.clickable);
  if (isChip) classes.push(active ? styles.active : styles.inactive);

  const style = { '--source-color': SOURCE_COLOR_VAR[source] } as CSSProperties;

  const content = (
    <>
      {!isChip && <span className={styles.dot} />}
      <span>{SOURCE_LABEL[source]}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes.join(' ')}
        style={style}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={classes.join(' ')} style={style}>
      {content}
    </span>
  );
}
