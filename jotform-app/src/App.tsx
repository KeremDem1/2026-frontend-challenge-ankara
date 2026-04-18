import { Suspense, lazy, useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchAllRecords } from './store/records/recordsThunks';
import {
  selectAllRecords,
  selectCanonicalNameMap,
  selectPeople,
  selectRecordsError,
  selectRecordsStatus,
  selectUniqueLocations,
} from './store/records/selectors';
import {
  fuzzyToggled,
  mapOpened,
  selectedPersonReconciled,
} from './store/ui/uiSlice';
import PeoplePanel from './components/PeoplePanel';
import RecordsPanel from './components/RecordsPanel';
import DetailPanel from './components/DetailPanel';
import EmptyState from './components/EmptyState';

const MapModal = lazy(() => import('./components/MapModal'));

function App() {
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectRecordsStatus);
  const error = useAppSelector(selectRecordsError);
  const records = useAppSelector(selectAllRecords);
  const people = useAppSelector(selectPeople);
  const locations = useAppSelector(selectUniqueLocations);
  const fuzzyMatching = useAppSelector((state) => state.ui.fuzzyMatching);
  const selectedPersonName = useAppSelector(
    (state) => state.ui.selectedPersonName,
  );
  const mapOpen = useAppSelector((state) => state.ui.mapOpen);
  const nameMap = useAppSelector(selectCanonicalNameMap);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAllRecords());
  }, [dispatch, status]);

  useEffect(() => {
    if (!selectedPersonName) return;
    const entry = nameMap.get(selectedPersonName);
    if (entry && entry.canonical === selectedPersonName) return;
    if (entry) {
      dispatch(selectedPersonReconciled(entry.canonical));
      return;
    }
    const anyEntry = [...nameMap.values()].find(
      (e) => e.canonical === selectedPersonName,
    );
    if (!anyEntry) dispatch(selectedPersonReconciled(null));
  }, [dispatch, nameMap, selectedPersonName]);

  const isInitialLoad = status === 'pending' && records.length === 0;
  const retry = () => dispatch(fetchAllRecords());

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <h1 className="brandTitle">Missing Podo: The Ankara Case</h1>
          <span className="brandSubtitle">Investigation dashboard</span>
        </div>
        {status === 'succeeded' && records.length > 0 && (
          <div className="headerRight">
            <div className="globalStats">
              <span>
                <strong>{records.length}</strong> records
              </span>
              <span>
                <strong>{people.length}</strong> people
              </span>
              <span>
                <strong>{locations.length}</strong> locations
              </span>
            </div>
            <label
              className="fuzzyToggle"
              title="Merge near-duplicate name variants (e.g. Kağan, Kagan, Kağan A.)"
            >
              <input
                type="checkbox"
                checked={fuzzyMatching}
                onChange={(e) => dispatch(fuzzyToggled(e.target.checked))}
              />
              <span>Merge similar names</span>
            </label>
            <button
              type="button"
              className="mapButton"
              onClick={() => dispatch(mapOpened())}
              title="Plot the current records on a map"
            >
              <span aria-hidden>◎</span>
              <span>Open map</span>
            </button>
          </div>
        )}
      </header>

      {isInitialLoad && (
        <div className="fullState">
          <div className="loadingWrap">
            <div className="spinner" aria-hidden />
            <span>Loading records...</span>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="fullState">
          <EmptyState
            title="Couldn't load records"
            description={error ?? 'Something went wrong while talking to Jotform.'}
            actionLabel="Retry"
            onAction={retry}
          />
        </div>
      )}

      {status === 'succeeded' && records.length === 0 && (
        <div className="fullState">
          <EmptyState
            title="No records yet"
            description="None of the five forms returned any submissions."
            actionLabel="Refresh"
            onAction={retry}
          />
        </div>
      )}

      {status === 'succeeded' && records.length > 0 && (
        <main className="shell">
          <PeoplePanel />
          <RecordsPanel />
          <DetailPanel />
        </main>
      )}

      {mapOpen && (
        <Suspense fallback={null}>
          <MapModal />
        </Suspense>
      )}
    </div>
  );
}

export default App;
