import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RecordSource } from '../../types/record';

export interface UiState {
  selectedPersonName: string | null;
  selectedRecordId: string | null;
  personSearch: string;
  recordSearch: string;
  sourceFilter: RecordSource[];
  locationFilter: string | null;
  fuzzyMatching: boolean;
  viewAllRecords: boolean;
  mapOpen: boolean;
}

const initialState: UiState = {
  selectedPersonName: null,
  selectedRecordId: null,
  personSearch: '',
  recordSearch: '',
  sourceFilter: [],
  locationFilter: null,
  fuzzyMatching: true,
  viewAllRecords: false,
  mapOpen: false,
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
      state.locationFilter = null;
      state.viewAllRecords = false;
    },
    allRecordsSelected(state) {
      state.viewAllRecords = true;
      state.selectedPersonName = null;
      state.selectedRecordId = null;
      state.recordSearch = '';
      state.sourceFilter = [];
      state.locationFilter = null;
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
    locationFilterChanged(state, action: PayloadAction<string | null>) {
      state.locationFilter = action.payload;
    },
    fuzzyToggled(state, action: PayloadAction<boolean | undefined>) {
      state.fuzzyMatching =
        action.payload === undefined ? !state.fuzzyMatching : action.payload;
    },
    selectedPersonReconciled(state, action: PayloadAction<string | null>) {
      state.selectedPersonName = action.payload;
    },
    mapOpened(state) {
      state.mapOpen = true;
    },
    mapClosed(state) {
      state.mapOpen = false;
    },
  },
});

export const {
  personSelected,
  allRecordsSelected,
  recordSelected,
  personSearchChanged,
  recordSearchChanged,
  sourceFilterToggled,
  sourceFiltersReset,
  locationFilterChanged,
  fuzzyToggled,
  selectedPersonReconciled,
  mapOpened,
  mapClosed,
} = uiSlice.actions;

export default uiSlice.reducer;
