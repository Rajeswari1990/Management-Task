import express, { Request, Response } from 'express';
import cors from 'cors';


type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
}


let tasks: Task[] = [
  {
    id: '1',
    title: 'Design API',
    description: 'Plan REST endpoints and payloads',
    priority: 'high',
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Set up React app',
    description: 'Initialize project with Vite',
    priority: 'medium',
    status: 'todo'
  }
];

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;


const isPriority = (v: any): v is Priority =>
  ['low', 'medium', 'high'].includes(v);

const isStatus = (v: any): v is Status =>
  ['todo', 'in-progress', 'done'].includes(v);

function validateTaskBody(body: any, requireAllFields = true): { valid: boolean; message?: string } {
  const required = ['title', 'priority', 'status'] as const;

  if (requireAllFields) {
    for (const key of required) {
      if (!(key in body)) {
        return { valid: false, message: `Missing required field: ${key}` };
      }
    }
  }

  if ('title' in body && (typeof body.title !== 'string' || body.title.trim().length === 0)) {
    return { valid: false, message: 'title must be a non-empty string' };
  }

  if ('priority' in body && !isPriority(body.priority)) {
    return { valid: false, message: 'priority must be one of: low | medium | high' };
  }

  if ('status' in body && !isStatus(body.status)) {
    return { valid: false, message: 'status must be one of: todo | in-progress | done' };
  }

  if ('description' in body && typeof body.description !== 'string' && body.description !== undefined) {
    return { valid: false, message: 'description must be a string if provided' };
  }

  return { valid: true };
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


app.get('/tasks', (_req: Request, res: Response) => {
  res.json(tasks);
});


app.get('/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});


app.post('/tasks', (req: Request, res: Response) => {
  const { valid, message } = validateTaskBody(req.body, true);
  if (!valid) return res.status(400).json({ message });

  const { title, description, priority, status } = req.body as Partial<Task>;
  const id = Date.now().toString(); // simple unique-ish id

  const newTask: Task = {
    id,
    title: title!.trim(),
    description: description?.trim(),
    priority: priority as Priority,
    status: status as Status
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});


app.put('/tasks/:id', (req: Request, res: Response) => {
  const { valid, message } = validateTaskBody(req.body, true);
  if (!valid) return res.status(400).json({ message });

  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });

  const { title, description, priority, status } = req.body as Partial<Task>;

  const updated: Task = {
    id: tasks[idx].id,
    title: title!.trim(),
    description: description?.trim(),
    priority: priority as Priority,
    status: status as Status
  };

  tasks[idx] = updated;
  res.json(updated);
});


app.patch('/tasks/:id', (req: Request, res: Response) => {
  const { valid, message } = validateTaskBody(req.body, false);
  if (!valid) return res.status(400).json({ message });

  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });

  const current = tasks[idx];
  const next: Task = {
    ...current,
    ...req.body,
    title: req.body.title !== undefined ? String(req.body.title).trim() : current.title,
    description:
      req.body.description !== undefined && req.body.description !== null
        ? String(req.body.description).trim()
        : current.description
  };

  tasks[idx] = next;
  res.json(next);
});

// Delete
app.delete('/tasks/:id', (req: Request, res: Response) => {
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== req.params.id);
  if (tasks.length === before) return res.status(404).json({ message: 'Task not found' });
  res.status(204).send();
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`Task API running on http://localhost:${PORT}`);
  console.log('Note: data is in-memory and resets on server restart.');
});