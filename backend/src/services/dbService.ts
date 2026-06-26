import * as fs from 'fs';
import * as path from 'path';

// Define structures
export interface CodeFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  branchFrom: string;
  branchTo: string;
  diff: string;
  reviews: { reviewer: string; comment: string; line?: number; approved: boolean }[];
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting';
  ports: string;
  cpu: number;
  memory: string;
  logs: string[];
}

class DBService {
  private files: Record<string, CodeFile> = {};
  private tasks: KanbanTask[] = [];
  private chatMessages: ChatMessage[] = [];
  private pullRequests: PullRequest[] = [];
  private containers: DockerContainer[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Code Workspace Files
    this.files['package.json'] = {
      path: 'package.json',
      name: 'package.json',
      content: `{
  "name": "enterprise-api",
  "version": "1.0.0",
  "description": "Enterprise Core REST API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1"
  }
}`,
      language: 'json'
    };

    this.files['server.js'] = {
      path: 'server.js',
      name: 'server.js',
      content: `const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// TODO: Move security secret key to environment variables
const JWT_SECRET = 'super-secret-key-12345!';

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vulnerability: Insecure plain text password check
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET);
    return res.json({ success: true, token });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/users', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Performance Issue: Missing pagination and projection
    const users = await mongoose.model('User').find({});
    res.json(users);
  } catch (err) {
    res.status(403).json({ error: 'Forbidden' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      language: 'javascript'
    };

    this.files['Dockerfile'] = {
      path: 'Dockerfile',
      name: 'Dockerfile',
      content: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]`,
      language: 'dockerfile'
    };

    this.files['README.md'] = {
      path: 'README.md',
      name: 'README.md',
      content: `# Enterprise Core API Server

This server handles the backend business logic and database interactions for the enterprise suite.

## Development

1. Install dependencies: \`npm install\`
2. Start local server: \`npm run dev\`
3. Run tests: \`npm test\`
`,
      language: 'markdown'
    };

    // Seed Kanban Tasks
    this.tasks = [
      {
        id: 'TASK-101',
        title: 'Fix SQL injection vulnerability in Login API',
        description: 'Sanitize username inputs and move away from plain-text checks to bcrypt verification. The JWT secret should also be loaded from process.env instead of hardcoding.',
        status: 'todo',
        priority: 'high',
        assignee: 'Copilot (AI)',
        tags: ['security', 'auth'],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'TASK-102',
        title: 'Optimize MongoDB pagination query for users',
        description: 'Currently fetching all users from the DB. Implement pagination with offset/limit and project only necessary fields (e.g., exclude hashed password).',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Alex Rivera',
        tags: ['performance', 'database'],
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'TASK-103',
        title: 'Write unit tests for Auth endpoint',
        description: 'Add Jest tests covering login success, login failure, and user endpoint authentication validation.',
        status: 'in-review',
        priority: 'low',
        assignee: 'Sarah Connor',
        tags: ['testing', 'auth'],
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'TASK-104',
        title: 'Setup Docker multi-stage builds',
        description: 'Refactor current single-stage Dockerfile to use multi-stage builds for optimized image sizing and caching.',
        status: 'done',
        priority: 'medium',
        assignee: 'DevOps Copilot (AI)',
        tags: ['devops', 'docker'],
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
      }
    ];

    // Seed Chat Messages
    this.chatMessages = [
      {
        id: 'msg-1',
        sender: 'Sarah Connor',
        avatar: '👩‍💻',
        role: 'user',
        content: 'Hey team, has anyone started working on the Docker multi-stage builds? I see the task was marked Done.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'msg-2',
        sender: 'DevOps Copilot (AI)',
        avatar: '🤖',
        role: 'assistant',
        content: 'Hi Sarah! I successfully created and merged the PR for multi-stage Docker builds. The final image size was reduced from 450MB to 78MB by separating build-dependencies from the runtime Alpine environment.',
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        id: 'msg-3',
        sender: 'Alex Rivera',
        avatar: '👨‍💻',
        role: 'user',
        content: 'Nice job DevOps Copilot! I am currently working on TASK-102 (MongoDB pagination). Will request review shortly.',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ];

    // Seed Pull Requests
    this.pullRequests = [
      {
        id: 'PR-1',
        title: 'Enhance JWT authentication security standards',
        description: 'Replaced insecure plain text secret key references with process.env.JWT_SECRET. Improved error messages on authorization validation failure.',
        author: 'Sarah Connor',
        status: 'open',
        branchFrom: 'feature/auth-security',
        branchTo: 'main',
        diff: `diff --git a/server.js b/server.js
index 8f36c84..9cf201a 100644
--- a/server.js
+++ b/server.js
@@ -7,3 +7,3 @@ app.use(express.json());
 // TODO: Move security secret key to environment variables
-const JWT_SECRET = 'super-secret-key-12345!';
+const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-development';
 
@@ -12,4 +12,4 @@ app.post('/api/auth/login', (req, res) => {
-  // Vulnerability: Insecure plain text password check
-  if (username === 'admin' && password === 'admin123') {
+  // TODO: Implement bcrypt compare here
+  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
     const token = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET);
     return res.json({ success: true, token });`,
        reviews: [
          {
            reviewer: 'Copilot (AI)',
            comment: 'Moving the secret and admin passwords to environment variables is a great security improvement. However, ensure that a warning is thrown at startup if fallback values are used in production.',
            approved: true
          }
        ]
      }
    ];

    // Seed Docker Containers
    this.containers = [
      {
        id: 'cont-1',
        name: 'web-app-frontend',
        image: 'nextjs-frontend:latest',
        status: 'running',
        ports: '3000:3000',
        cpu: 1.2,
        memory: '145.4 MB',
        logs: [
          'ready - started server on 0.0.0.0:3000, url: http://localhost:3000',
          'info  - Loaded env variables from .env.local',
          'event - compiled client and server successfully in 982 ms',
          'event - GET / 200 in 120 ms'
        ]
      },
      {
        id: 'cont-2',
        name: 'api-service-backend',
        image: 'node-express-backend:latest',
        status: 'running',
        ports: '5000:5000',
        cpu: 0.8,
        memory: '88.1 MB',
        logs: [
          'Server running on port 5000',
          'Connected successfully to Database service.',
          'GET /api/users 200 - 45 ms'
        ]
      },
      {
        id: 'cont-3',
        name: 'db-mongodb',
        image: 'mongo:6.0',
        status: 'running',
        ports: '27017:27017',
        cpu: 2.1,
        memory: '312.8 MB',
        logs: [
          'Finished query memory preallocation',
          'Waiting for connections on port 27017',
          'Connection accepted from 172.17.0.3:55122'
        ]
      }
    ];
  }

  // Files API
  getFiles() {
    return Object.values(this.files);
  }

  getFile(filePath: string) {
    return this.files[filePath] || null;
  }

  saveFile(filePath: string, content: string) {
    if (this.files[filePath]) {
      this.files[filePath].content = content;
      return this.files[filePath];
    }
    const name = path.basename(filePath);
    const ext = path.extname(filePath).replace('.', '');
    const languageMap: Record<string, string> = {
      js: 'javascript', ts: 'typescript', json: 'json', md: 'markdown', dockerfile: 'dockerfile', yml: 'yaml', yaml: 'yaml'
    };
    this.files[filePath] = {
      path: filePath,
      name,
      content,
      language: languageMap[ext] || 'plaintext'
    };
    return this.files[filePath];
  }

  // Tasks API
  getTasks() {
    return this.tasks;
  }

  addTask(task: Omit<KanbanTask, 'id' | 'createdAt'>) {
    const newTask: KanbanTask = {
      ...task,
      id: `TASK-${100 + this.tasks.length + 1}`,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTaskStatus(id: string, status: KanbanTask['status']) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = status;
    }
    return task;
  }

  updateTask(id: string, updates: Partial<KanbanTask>) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates } as KanbanTask;
      return this.tasks[taskIndex];
    }
    return null;
  }

  // Chat API
  getChatMessages() {
    return this.chatMessages;
  }

  addChatMessage(sender: string, avatar: string, content: string, role: 'user' | 'assistant' | 'system' = 'user') {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      avatar,
      role,
      content,
      timestamp: new Date().toISOString()
    };
    this.chatMessages.push(newMessage);
    return newMessage;
  }

  // PR API
  getPullRequests() {
    return this.pullRequests;
  }

  addPullRequest(pr: Omit<PullRequest, 'id' | 'status' | 'reviews'>) {
    const newPr: PullRequest = {
      ...pr,
      id: `PR-${this.pullRequests.length + 1}`,
      status: 'open',
      reviews: []
    };
    this.pullRequests.push(newPr);
    return newPr;
  }

  addPRReview(prId: string, reviewer: string, comment: string, approved: boolean, line?: number) {
    const pr = this.pullRequests.find(p => p.id === prId);
    if (pr) {
      pr.reviews.push({ reviewer, comment, approved, line });
    }
    return pr;
  }

  // Docker API
  getContainers() {
    return this.containers;
  }

  updateContainerStatus(id: string, status: DockerContainer['status']) {
    const container = this.containers.find(c => c.id === id);
    if (container) {
      container.status = status;
      if (status === 'running') {
        container.cpu = Math.random() * 2 + 0.5;
        container.logs.push(`[${new Date().toISOString()}] Service started successfully.`);
      } else if (status === 'stopped') {
        container.cpu = 0;
        container.logs.push(`[${new Date().toISOString()}] Service stopped by user request.`);
      } else if (status === 'restarting') {
        container.cpu = 0;
        container.logs.push(`[${new Date().toISOString()}] Restart signal received.`);
        setTimeout(() => {
          container.status = 'running';
          container.cpu = Math.random() * 2 + 0.5;
          container.logs.push(`[${new Date().toISOString()}] Service running port configuration verification.`);
        }, 1500);
      }
    }
    return container;
  }
}

export const dbService = new DBService();
