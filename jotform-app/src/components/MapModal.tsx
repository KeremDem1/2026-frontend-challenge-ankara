import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L, { type LatLngBoundsExpression, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectFilteredVisibleRecords,
  selectVisibleRecords,
} from '../store/records/selectors';
import { mapClosed, recordSelected } from '../store/ui/uiSlice';
import type { InvestigationRecord, RecordSource } from '../types/record';
import { formatTimestamp, truncate } from '../utils/format';
import EmptyState from './EmptyState';
import SourceBadge from './SourceBadge';
import styles from './MapModal.module.css';

const ANKARA_CENTER: LatLngTuple = [39.9334, 32.8597];
const DEFAULT_ZOOM = 12;

const SOURCE_HEX: Record<RecordSource, string> = {
  Checkins: '#1f4e6b',
  Messages: '#6b3a66',
  Sightings: '#916408',
  PersonalNotes: '#5a6d3c',
  AnonymousTips: '#a0321c',
};

interface PlottedRecord {
  record: InvestigationRecord;
  position: LatLngTuple;
  index: number;
}

function buildIcon(
  source: RecordSource,
  label: string,
  selected: boolean,
): L.DivIcon {
  const color = SOURCE_HEX[source];
  const selectedClass = selected ? ' marker--selected' : '';
  return L.divIcon({
    className: 'recordMarker',
    html: `<div class="marker${selectedClass}" style="background:${color}"><span>${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points) as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [points, map]);
  return null;
}

export default function MapModal() {
  const dispatch = useAppDispatch();
  const filtered = useAppSelector(selectFilteredVisibleRecords);
  const visible = useAppSelector(selectVisibleRecords);
  const selectedPersonName = useAppSelector(
    (s) => s.ui.selectedPersonName,
  );
  const viewAll = useAppSelector((s) => s.ui.viewAllRecords);
  const selectedRecordId = useAppSelector((s) => s.ui.selectedRecordId);

  const plotted: PlottedRecord[] = useMemo(() => {
    return filtered
      .map((record, idx) => {
        if (!record.coordinates) return null;
        return {
          record,
          position: [
            record.coordinates.lat,
            record.coordinates.lng,
          ] as LatLngTuple,
          index: idx,
        };
      })
      .filter((p): p is PlottedRecord => p !== null);
  }, [filtered]);

  const missingCoords = filtered.length - plotted.length;

  const points = useMemo(() => plotted.map((p) => p.position), [plotted]);
  const polylinePoints = useMemo(() => {
    if (viewAll || !selectedPersonName) return [];
    return points;
  }, [points, viewAll, selectedPersonName]);

  const title = viewAll
    ? 'All records — map'
    : selectedPersonName
      ? `${selectedPersonName} — movements`
      : 'Map';

  const close = () => dispatch(mapClosed());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(mapClosed());
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [dispatch]);

  const openDetails = (id: string) => {
    dispatch(recordSelected(id));
    dispatch(mapClosed());
  };

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Records map"
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{title}</h2>
            <span className={styles.subtitle}>
              {plotted.length} of {filtered.length}{' '}
              {filtered.length === 1 ? 'record' : 'records'} plotted
              {missingCoords > 0 && (
                <>
                  {' · '}
                  <span className={styles.warn}>
                    {missingCoords} missing coordinates
                  </span>
                </>
              )}
              {filtered.length !== visible.length && (
                <>
                  {' · '}
                  {visible.length - filtered.length} hidden by filters
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Close map"
            title="Close (Esc)"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          {plotted.length === 0 ? (
            <div className={styles.placeholder}>
              <EmptyState
                title="Nothing to plot"
                description={
                  filtered.length === 0
                    ? 'No records match the current selection. Try clearing filters or picking a person with location data.'
                    : 'None of the matching records have coordinates.'
                }
              />
            </div>
          ) : (
            <MapContainer
              center={ANKARA_CENTER}
              zoom={DEFAULT_ZOOM}
              className={styles.map}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={points} />

              {polylinePoints.length >= 2 && (
                <Polyline
                  positions={polylinePoints}
                  pathOptions={{
                    color: '#2a1a0d',
                    weight: 2,
                    opacity: 0.65,
                    dashArray: '6 6',
                  }}
                />
              )}

              {plotted.map(({ record, position, index }) => {
                const isSelected = record.id === selectedRecordId;
                const label =
                  !viewAll && selectedPersonName ? String(index + 1) : '';
                const icon = buildIcon(record.source, label, isSelected);
                return (
                  <Marker
                    key={record.id}
                    position={position}
                    icon={icon}
                    zIndexOffset={isSelected ? 1000 : 0}
                  >
                    <Popup>
                      <div className={styles.popup}>
                        <div className={styles.popupTop}>
                          <SourceBadge source={record.source} />
                          <span className={styles.popupTime}>
                            {formatTimestamp(
                              record.timestamp,
                              record.timestampMs,
                            )}
                          </span>
                        </div>
                        {record.location && (
                          <div className={styles.popupLocation}>
                            {record.location}
                          </div>
                        )}
                        {record.text && (
                          <p className={styles.popupText}>
                            {truncate(record.text, 160)}
                          </p>
                        )}
                        <button
                          type="button"
                          className={styles.popupAction}
                          onClick={() => openDetails(record.id)}
                        >
                          Open in detail
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
