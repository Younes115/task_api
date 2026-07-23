const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const express = require('express');

const app = express();  

app.use(express.json());

const openapiDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

const PORT = process.env.PORT || 3000;
// sample data for tasks
let tasks = [
    { id: 1, title: "Learn Express", done: true },
    { id: 2, title: "Build CRUD API", done: false },
    { id: 3, title: "Publish to GitHub", done: false }
];

app.get('/', (req, res) => {
 res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
 res.json({ status: "ok" });
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if(!task) {
        return res.status(404).json({ "error": "Task not found" });
    }
    res.json(task);
});

app.post("/tasks", (req, res) => {
    const { title, done } = req.body;
    if (!title || typeof title !== 'string'|| title.trim() === '') {
        return res.status(400).json({ error: "Title is required and cannot be empty" });
    }
    const task = {
        id: tasks.length + 1,
        title,
        done: false
    };
    tasks.push(task);
    res.status(201).json(task);
});


app.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }
    const { title, done } = req.body;
    if (!title || typeof title !== 'string'|| title.trim() === '') {
        return res.status(400).json({ error: "Title is required and cannot be empty" });
    }

    if (title) task.title = title;
    if (done !== undefined) task.done = done;
    res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found" });
    }
    tasks.splice(taskIndex, 1);
    res.json({ message: "Task deleted successfully" });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});