import { configureStore } from '@reduxjs/toolkit';
import formsReducer from './forms/formsSlice';
import recordsReducer from './records/recordsSlice';
import uiReducer from './ui/uiSlice';

const store = configureStore({
  reducer: {
    forms: formsReducer,
    records: recordsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
