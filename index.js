const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const express = require('express');
const Database = require('better-sqlite3');

const app = express();  

app.use(express.json());

const db = new Database('tasks.db');

const openapiDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

const PORT = process.env.PORT || 3000;

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT,
        done INTEGER
    )
`);

const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const rowCount = countStmt.get().count;

if (rowCount === 0) {
    const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    insertStmt.run('Learn Express', 1);
    insertStmt.run('Build CRUD API', 0);
    insertStmt.run('Connect to SQLite', 0);
}

app.get('/', (req, res) => {
 res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
 res.json({ status: "ok" });
});

app.get('/tasks', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks');
    const tasks = stmt.all();
    
    const formattedTasks = tasks.map(t => ({
        ...t,
        done: t.done === 1
    }));

    res.json(formattedTasks);
});

app.get('/tasks/:id', (req, res) => {
   const taskId = parseInt(req.params.id);
    
   
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = stmt.get(taskId);

    
    if (!task) {
        return res.status(404).json({ "error": "Task not found" });
    }

    task.done = task.done === 1;
    res.json(task);
});

app.post("/tasks", (req, res) => {
    const { title } = req.body;

    
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ "error": "Title is required and cannot be empty" });
    }

   
    const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    
   
    const info = stmt.run(title.trim(), 0);

    const newTask = {
        id: info.lastInsertRowid, 
        title: title.trim(),
        done: false 
    };

  
    res.status(201).json(newTask);
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