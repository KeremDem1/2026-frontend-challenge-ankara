import { createSlice } from '@reduxjs/toolkit';
import type { FormLabel } from '../../constants/formIds';
import type { JotformForm } from '../../types/jotform';
import { fetchAllForms } from './formsThunks';

export type FormsStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface FormsState {
  byLabel: Partial<Record<FormLabel, JotformForm>>;
  status: FormsStatus;
  error: string | null;
}

const initialState: FormsState = {
  byLabel: {},
  status: 'idle',
  error: null,
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllForms.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchAllForms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.byLabel = action.payload;
      })
      .addCase(fetchAllForms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export default formsSlice.reducer;
