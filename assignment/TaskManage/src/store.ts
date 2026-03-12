import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './components/features/Tasks/TaskSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer
  }
});

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;