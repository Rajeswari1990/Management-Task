import React, { useEffect, useMemo, useState } from 'react';
import type { Task, Priority, Status } from '../types';

type Props = {
  onSubmit: (data: Omit<Task, 'id'>) => Promise<void> | void;
  onCancel?: () => void;
  initial?: Task | null;
};

const priorities: Priority[] = ['low', 'medium', 'high'];
const statuses: Status[] = ['todo', 'in-progress', 'done'];

export default function TaskForm({ onSubmit, onCancel, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [status, setStatus] = useState<Status>(initial?.status ?? 'todo');
  const [error, setError] = useState<string | null>(null);
  const isEdit = useMemo(() => Boolean(initial?.id), [initial]);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setPriority(initial?.priority ?? 'medium');
    setStatus(initial?.status ?? 'todo');
    setError(null);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status
      });
      if (!isEdit) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('todo');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>{isEdit ? 'Edit Task' : 'Create Task'}</h3>

      <label>
        Title
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
      </label>

      <label>
        Description
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" />
      </label>

      <div className="row">
        <label>
          Priority
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <label>
          Status
          <select value={status} onChange={e => setStatus(e.target.value as Status)}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row">
        <button type="submit">{isEdit ? 'Save' : 'Add Task'}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}