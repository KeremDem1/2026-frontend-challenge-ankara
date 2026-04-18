import { useEffect, useMemo } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchAllForms } from './store/forms/formsThunks';
import { fetchAllRecords } from './store/records/recordsThunks';
import {
  selectAllRecords,
  selectRecordsError,
  selectRecordsStatus,
  selectUniqueLocations,
  selectUniquePeople,
} from './store/records/selectors';

function App() {
  const dispatch = useAppDispatch();

  const formsStatus = useAppSelector((state) => state.forms.status);
  const recordsStatus = useAppSelector(selectRecordsStatus);
  const recordsError = useAppSelector(selectRecordsError);
  const records = useAppSelector(selectAllRecords);
  const people = useAppSelector(selectUniquePeople);
  const locations = useAppSelector(selectUniqueLocations);

  useEffect(() => {
    if (formsStatus === 'idle') dispatch(fetchAllForms());
    if (recordsStatus === 'idle') dispatch(fetchAllRecords());
  }, [dispatch, formsStatus, recordsStatus]);

  const countsBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const record of records) {
      counts[record.source] = (counts[record.source] ?? 0) + 1;
    }
    return counts;
  }, [records]);

  return (
    <>
      <h1>Missing Podo: The Ankara Case</h1>

      {recordsStatus === 'pending' && <p>Loading records...</p>}
      {recordsStatus === 'failed' && <p>Error: {recordsError}</p>}

      {recordsStatus === 'succeeded' && (
        <section>
          <p>
            Loaded <strong>{records.length}</strong> records across{' '}
            <strong>{Object.keys(countsBySource).length}</strong> sources.
          </p>
          <ul>
            {Object.entries(countsBySource).map(([source, count]) => (
              <li key={source}>
                {source}: {count}
              </li>
            ))}
          </ul>
          <p>
            Unique people: <strong>{people.length}</strong> &middot; Unique
            locations: <strong>{locations.length}</strong>
          </p>
        </section>
      )}
    </>
  );
}

export default App;
