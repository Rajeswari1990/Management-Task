
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Task } from '../../../types';
import * as api from '../../../api';

type TasksState = {
  items: Task[];
  loading: boolean;
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null
};

// ---- Thunks (CRUD) ----
export const fetchTasks = createAsyncThunk('tasks/fetchAll', async () => {
  return await api.getTasks();
});

export const addTask = createAsyncThunk(
  'tasks/add',
  async (payload: Omit<Task, 'id'>) => {
    return await api.createTask(payload);
  }
);

export const saveTask = createAsyncThunk(
  'tasks/save',
  async ({ id, data }: { id: string; data: Omit<Task, 'id'> }) => {
    return await api.updateTask(id, data);
  }
);

export const quickPatch = createAsyncThunk(
  'tasks/patch',
  async ({ id, patch }: { id: string; patch: Partial<Omit<Task, 'id'>> }) => {
    return await api.patchTask(id, patch);
  }
);

export const removeTask = createAsyncThunk('tasks/remove', async (id: string) => {
  await api.deleteTask(id);
  return id;
});

// ---- Slice ----
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load tasks';
      })

      // create
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.unshift(action.payload);
      })

      // update (PUT)
      .addCase(saveTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const i = state.items.findIndex((t) => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })

      // patch (e.g., status change)
      .addCase(quickPatch.fulfilled, (state, action: PayloadAction<Task>) => {
        const i = state.items.findIndex((t) => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })

      // delete
      .addCase(removeTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  }
});

export default tasksSlice.reducer;