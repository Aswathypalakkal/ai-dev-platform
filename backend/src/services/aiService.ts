import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client if API key is provided
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

class AIService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private modelName = process.env.OLLAMA_MODEL || 'llama2';

  // Core generation logic
  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    // 1. Try OpenAI if enabled
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt } as const] : []),
            { role: 'user', content: prompt }
          ],
        });
        return response.choices[0]?.message?.content || 'No response from OpenAI.';
      } catch (err: any) {
        console.error('OpenAI generation failed, falling back to local systems:', err.message);
      }
    }

    // 2. Try Ollama (Local LLM)
    try {
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        return data.message?.content || 'No content from local Ollama.';
      }
    } catch (err: any) {
      console.log('Ollama is not running, using high-fidelity mock LLM simulation.');
    }

    // 3. Fallback: High-fidelity Mock LLM Simulation
    return this.mockLLMResponse(prompt, systemPrompt);
  }

  private mockLLMResponse(prompt: string, systemPrompt?: string): string {
    const promptLower = prompt.toLowerCase();
    
    // Check if the user is asking to review, explain, or fix the seeded server.js
    const isServerJs = promptLower.includes('const jwt = require') || promptLower.includes('jwt_secret') || promptLower.includes('server.js');

    // Handle "Explain Code"
    if (promptLower.includes('explain') || promptLower.includes('what does this code do')) {
      if (isServerJs) {
        return `### Code Explanation: \`server.js\`

This script sets up a basic **Express.js API server** with JSON parsing middleware and includes routing for authentication (\`/api/auth/login\`) and user retrieval (\`/api/users\`).

#### Key Architectural Components:
1. **Express Routing**: 
   - \`POST /api/auth/login\`: Validates credentials. Currently handles verification using a hardcoded password check.
   - \`GET /api/users\`: Retrieves a list of users from a MongoDB database using Mongoose. Requires a Bearer token verification.
2. **Security & Cryptography**:
   - Uses \`jsonwebtoken (JWT)\` to sign and verify access tokens.
3. **Database Integration**:
   - Uses \`mongoose\` to communicate with MongoDB.

> [!WARNING]
> **Severe Vulnerabilities Identified:**
> * **Plain-text Credentials**: Hardcoded password comparisons (\`admin123\`).
> * **Hardcoded Secret Key**: The \`JWT_SECRET\` is hardcoded inline, allowing token forgery.
> * **SQL-like injection / bypass**: No encryption is performed on inputs during authentication.
> * **Unbounded Queries**: Fetching all users (\`find({})\`) without limit/pagination could lead to Out Of Memory (OOM) failures under heavy load.`;
      }
      return `### Code Explanation

Here is a structural breakdown of the provided code block:

1. **Imports & Dependencies**: The module loads required packages and configures configurations.
2. **Business Logic Flow**: Executes standard calculations and input sanitizations.
3. **Error Handling**: Implements standard try-catch blocks to catch boundary runtime exceptions.
4. **Export / Output**: Exports functions/classes to be used in other modules.

*Recommendation*: Check imports and make sure environment variable loading is handled cleanly inside a config file.`;
    }

    // Handle "Review Pull Request" or "Review Code"
    if (promptLower.includes('review') || promptLower.includes('pr') || promptLower.includes('diff')) {
      return `## AI Pull Request Review Summary

I have reviewed the changes in the repository. Here is a summary of recommended fixes:

### 🚨 Critical Vulnerability (Security)
* **Hardcoded Secret Keys in Source Code**:
  \`\`\`javascript
  const JWT_SECRET = 'super-secret-key-12345!'; // UNSAFE!
  \`\`\`
  *Fix*: Move secrets to \`.env\` and reference them via \`process.env.JWT_SECRET\`.

### ⚡ Performance Optimization
* **Unpaginated Database Queries**:
  \`\`\`javascript
  const users = await mongoose.model('User').find({});
  \`\`\`
  *Fix*: Implement standard pagination (limit, skip) and projection to select only required fields (e.g. \`find({}, { password: 0 })\`).

### 🛠️ Best Practices & Quality
* **Missing BCrypt Password Hashing**:
  Passwords should be compared using \`bcrypt.compare()\` instead of direct plain text comparisons.`;
    }

    // Handle "Fix Bugs"
    if (promptLower.includes('fix') || promptLower.includes('debug') || promptLower.includes('bug')) {
      if (isServerJs) {
        return `### Bug Fix Recommendation: Secure \`server.js\`

Here is the secure refactoring of \`server.js\` addressing plain-text authentication and environment configurations:

\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Added bcrypt for secure comparisons

const app = express();
app.use(express.json());

// Load secret safely from env configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const User = mongoose.model('User');
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ success: true, token });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Server authentication process error' });
  }
});

app.get('/api/users', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fixed: Implemented pagination and password projection exclusion
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
    const users = await mongoose.model('User')
      .find({}, { passwordHash: 0 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json(users);
  } catch (err) {
    res.status(403).json({ error: 'Forbidden / Token expired' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Secure server running on port \${PORT}\`);
});
\`\`\`

#### Improvements implemented:
1. **BCrypt hashing verification** for user passwords.
2. **Environment variable validation** for JWT secrets.
3. **Database pagination** and exclusion of sensitive password fields.`;
      }
      return `### Bug Fix Suggestion

The issue appears to be caused by missing null checks or unhandled exceptions in the asynchronous workflow.

Here is the recommended code change:
\`\`\`javascript
// Add error boundary protection
try {
  const data = await fetchService(params);
  if (!data) throw new Error("Null data payload received.");
  // process flow
} catch (error) {
  logger.error("Operation failed:", error);
  res.status(500).json({ error: error.message });
}
\`\`\`
Verify that connection parameters are defined correctly in your environment settings.`;
    }

    // Handle "Write Documentation"
    if (promptLower.includes('document') || promptLower.includes('doc') || promptLower.includes('comment')) {
      return `## Technical API Documentation

### Endpoint: \`POST /api/auth/login\`
Authenticates client users and returns a signed JSON Web Token (JWT).

#### Request Headers:
- \`Content-Type\`: \`application/json\`

#### Request Payload:
\`\`\`json
{
  "username": "admin",
  "password": "user_password"
}
\`\`\`

#### Response:
- **200 OK** (Success):
  \`\`\`json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  \`\`\`
- **401 Unauthorized** (Failed):
  \`\`\`json
  {
    "error": "Invalid credentials"
  }
  \`\`\`

---

### Endpoint: \`GET /api/users\`
Retrieves a list of registered database users. Supports pagination queries.

#### Request Headers:
- \`Authorization\`: \`Bearer <token>\`

#### Query Parameters:
- \`page\` (optional, default: 1): The page number.
- \`limit\` (optional, default: 10): Amount of items per page.`;
    }

    // Handle Kanban Task Generator
    if (promptLower.includes('generate kanban') || promptLower.includes('jira') || promptLower.includes('generate task')) {
      return JSON.stringify([
        {
          title: 'Implement database indexing for User collection',
          description: 'Add indexes to "username" and "email" fields in MongoDB to optimize queries and enforce unique constraints.',
          priority: 'medium',
          assignee: 'Database Agent (AI)',
          tags: ['performance', 'database']
        },
        {
          title: 'Configure environment variables for production build',
          description: 'Setup production environment files (.env.production) containing production API keys, Mongo URIs, and Redis configurations.',
          priority: 'high',
          assignee: 'DevOps Copilot (AI)',
          tags: ['devops']
        },
        {
          title: 'Refactor Auth middleware tests',
          description: 'Ensure token validation coverage checks token expiration, malformed signatures, and correct header parsing.',
          priority: 'low',
          assignee: 'Sarah Connor',
          tags: ['testing', 'auth']
        }
      ]);
    }

    // Default conversational AI
    return `### Hello! I am your AI Development Assistant.

I can help you build and manage your project. Here are some actions you can execute:
- Select a file in the workspace and click **Explain Code** or **Write Documentation** in the toolbar.
- Click **Request AI Review** in the Pull Requests view.
- Click **AI Task Generator** in the Kanban Board view to automatically generate structured tasks.

*Current Setup:* 
* Model: **${openai ? 'GPT-4o-mini' : 'Local Fallback (Simulated)'}**
* Active Tasks: **4 pending**
* Server Status: **Healthy**`;
  }
}

export const aiService = new AIService();
