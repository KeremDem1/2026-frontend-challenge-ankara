import { createSlice } from '@reduxjs/toolkit';

const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    forms: [],
  },
  reducers: {
    setForms: (state, action) => {
      state.forms = action.payload;
    },
  },
});

export const { setForms } = formsSlice.actions;
export default formsSlice.reducer;