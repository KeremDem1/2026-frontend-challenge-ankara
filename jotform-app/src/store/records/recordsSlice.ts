import { createSlice } from '@reduxjs/toolkit';
import type { InvestigationRecord } from '../../types/record';
import { fetchAllRecords } from './recordsThunks';

export type RecordsStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface RecordsState {
  items: InvestigationRecord[];
  status: RecordsStatus;
  error: string | null;
}

const initialState: RecordsState = {
  items: [],
  status: 'idle',
  error: null,
};

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRecords.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchAllRecords.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAllRecords.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export default recordsSlice.reducer;
