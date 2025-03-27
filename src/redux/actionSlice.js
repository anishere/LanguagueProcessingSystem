import { createSlice } from '@reduxjs/toolkit';

const actionSlice = createSlice({
  name: 'action',
  initialState: {
    actionFlag: false
  },
  reducers: {
    toggleAction: (state) => {
      state.actionFlag = !state.actionFlag;
    }
  }
});

export const { toggleAction } = actionSlice.actions;
export default actionSlice.reducer;