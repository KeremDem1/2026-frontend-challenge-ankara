import { useEffect } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchAllRecords } from './store/records/recordsThunks';
import {
  selectAllRecords,
  selectPeople,
  selectRecordsError,
  selectRecordsStatus,
  selectUniqueLocations,
} from './store/records/selectors';
import PeoplePanel from './components/PeoplePanel';
import RecordsPanel from './components/RecordsPanel';
import DetailPanel from './components/DetailPanel';
import EmptyState from './components/EmptyState';

function App() {
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectRecordsStatus);
  const error = useAppSelector(selectRecordsError);
  const records = useAppSelector(selectAllRecords);
  const people = useAppSelector(selectPeople);
  const locations = useAppSelector(selectUniqueLocations);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAllRecords());
  }, [dispatch, status]);

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
    </div>
  );
}

export default App;
