import express from 'express';
import cors from 'cors';
// ---- In-memory storage ----
let tasks = [
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
// ---- Server setup ----
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;
// ---- Helpers ----
const isPriority = (v) => ['low', 'medium', 'high'].includes(v);
const isStatus = (v) => ['todo', 'in-progress', 'done'].includes(v);
function validateTaskBody(body, requireAllFields = true) {
    const required = ['title', 'priority', 'status'];
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
// ---- Routes ----
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
// List all tasks
app.get('/tasks', (_req, res) => {
    res.json(tasks);
});
// Get task by id
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task)
        return res.status(404).json({ message: 'Task not found' });
    res.json(task);
});
// Create task
app.post('/tasks', (req, res) => {
    const { valid, message } = validateTaskBody(req.body, true);
    if (!valid)
        return res.status(400).json({ message });
    const { title, description, priority, status } = req.body;
    const id = Date.now().toString(); // simple unique-ish id
    const newTask = {
        id,
        title: title.trim(),
        description: description?.trim(),
        priority: priority,
        status: status
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});
// Replace (PUT)
app.put('/tasks/:id', (req, res) => {
    const { valid, message } = validateTaskBody(req.body, true);
    if (!valid)
        return res.status(400).json({ message });
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ message: 'Task not found' });
    const { title, description, priority, status } = req.body;
    const updated = {
        id: tasks[idx].id,
        title: title.trim(),
        description: description?.trim(),
        priority: priority,
        status: status
    };
    tasks[idx] = updated;
    res.json(updated);
});
// Partial update (PATCH)
app.patch('/tasks/:id', (req, res) => {
    const { valid, message } = validateTaskBody(req.body, false);
    if (!valid)
        return res.status(400).json({ message });
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ message: 'Task not found' });
    const current = tasks[idx];
    const next = {
        ...current,
        ...req.body,
        title: req.body.title !== undefined ? String(req.body.title).trim() : current.title,
        description: req.body.description !== undefined && req.body.description !== null
            ? String(req.body.description).trim()
            : current.description
    };
    tasks[idx] = next;
    res.json(next);
});
// Delete
app.delete('/tasks/:id', (req, res) => {
    const before = tasks.length;
    tasks = tasks.filter(t => t.id !== req.params.id);
    if (tasks.length === before)
        return res.status(404).json({ message: 'Task not found' });
    res.status(204).send();
});
// ---- Start ----
app.listen(PORT, () => {
    console.log(`Task API running on http://localhost:${PORT}`);
    console.log('Note: data is in-memory and resets on server restart.');
});
