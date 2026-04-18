import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RecordSource } from '../../types/record';

export interface UiState {
  selectedPersonName: string | null;
  selectedRecordId: string | null;
  personSearch: string;
  recordSearch: string;
  sourceFilter: RecordSource[];
}

const initialState: UiState = {
  selectedPersonName: null,
  selectedRecordId: null,
  personSearch: '',
  recordSearch: '',
  sourceFilter: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    personSelected(state, action: PayloadAction<string | null>) {
      state.selectedPersonName = action.payload;
      state.selectedRecordId = null;
      state.recordSearch = '';
      state.sourceFilter = [];
    },
    recordSelected(state, action: PayloadAction<string | null>) {
      state.selectedRecordId = action.payload;
    },
    personSearchChanged(state, action: PayloadAction<string>) {
      state.personSearch = action.payload;
    },
    recordSearchChanged(state, action: PayloadAction<string>) {
      state.recordSearch = action.payload;
    },
    sourceFilterToggled(state, action: PayloadAction<RecordSource>) {
      const source = action.payload;
      const idx = state.sourceFilter.indexOf(source);
      if (idx === -1) state.sourceFilter.push(source);
      else state.sourceFilter.splice(idx, 1);
    },
    sourceFiltersReset(state) {
      state.sourceFilter = [];
    },
  },
});

export const {
  personSelected,
  recordSelected,
  personSearchChanged,
  recordSearchChanged,
  sourceFilterToggled,
  sourceFiltersReset,
} = uiSlice.actions;

export default uiSlice.reducer;
