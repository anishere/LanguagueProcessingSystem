import { configureStore } from '@reduxjs/toolkit';
import actionReducer from './actionSlice';

const store = configureStore({
  reducer: {
    action: actionReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;