import React, { useEffect, useMemo, useState } from 'react';
import './app.css';
import type { Task } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

import { useAppDispatch, useAppSelector } from './hooks';
import {
  addTask,
  fetchTasks,
  quickPatch,
  removeTask,
  saveTask
} from './components/features/Tasks/TaskSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const { items: tasks, loading, error } = useAppSelector((s) => s.tasks);

  const [editing, setEditing] = useState<Task | null>(null);

  // Sort (high → low, then title)
  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    return [...tasks].sort((a, b) => {
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return a.title.localeCompare(b.title);
    });
  }, [tasks]);

  // Initial load
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Handlers used by forms/lists. Using .unwrap() forwards errors to caller.
  const handleCreate = async (payload: Omit<Task, 'id'>) => {
    await dispatch(addTask(payload)).unwrap();
  };

  const handleSaveEdit = async (payload: Omit<Task, 'id'>) => {
    if (!editing) return;
    await dispatch(saveTask({ id: editing.id, data: payload })).unwrap();
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await dispatch(removeTask(id)).unwrap();
    if (editing?.id === id) setEditing(null);
  };

  const handleQuickStatus = async (id: string, status: Task['status']) => {
    await dispatch(quickPatch({ id, patch: { status } })).unwrap();
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <div className="grid">
        <div>
          <TaskForm
            onSubmit={editing ? handleSaveEdit : handleCreate}
            onCancel={editing ? () => setEditing(null) : undefined}
            initial={editing}
          />
        </div>

        <div>
          <div className="card">
            <h3>Tasks</h3>
            {loading ? (
              <div className="muted">Loading…</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <TaskList
                tasks={sorted}
                onEdit={setEditing}
                onDelete={handleDelete}
                onQuickUpdateStatus={handleQuickStatus}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="muted">
        API base: <code>{import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'}</code>
      </footer>
    </div>
  );
}