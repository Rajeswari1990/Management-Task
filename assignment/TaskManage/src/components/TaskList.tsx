
import type { Task } from '../types';

type Props = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onQuickUpdateStatus?: (id: string, status: Task['status']) => void;
};

export default function TaskList({ tasks, onEdit, onDelete, onQuickUpdateStatus }: Props) {
  if (tasks.length === 0) {
    return <div className="muted">No tasks yet.</div>;
  }

  return (
    <ul className="list">
      {tasks.map(t => (
        <li key={t.id} className={`item prio-${t.priority}`}>
          <div className="item-main">
            <div className="title">{t.title}</div>
            <div className="desc">{t.description || <em className="muted">No description</em>}</div>
            <div className="meta">
              <span className={`badge ${t.priority}`}>priority: {t.priority}</span>
              <span className="badge">{t.status}</span>
            </div>
          </div>
          <div className="actions">
            {onQuickUpdateStatus && (
              <select
                value={t.status}
                onChange={(e) => onQuickUpdateStatus(t.id, e.target.value as Task['status'])}
                title="Quick update status"
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            )}
            <button onClick={() => onEdit(t)}>Edit</button>
            <button className="danger" onClick={() => onDelete(t.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}