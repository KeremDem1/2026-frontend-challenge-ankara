import { configureStore } from '@reduxjs/toolkit';
import formsSlice from './forms/formsSlice';

const store = configureStore({
  reducer: {
    forms: formsSlice,
  },
});

export default store;