import { configureStore } from '@reduxjs/toolkit';
import formsReducer from './forms/formsSlice';
import recordsReducer from './records/recordsSlice';

const store = configureStore({
  reducer: {
    forms: formsReducer,
    records: recordsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
