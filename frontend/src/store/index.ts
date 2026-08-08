import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI Slice
export interface UIState {
  activeView: 'dashboard' | 'workspace' | 'kanban' | 'prs' | 'chat-video' | 'docker' | 'settings';
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
}

const initialUIState: UIState = {
  activeView: 'dashboard',
  theme: 'dark',
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setView: (state, action: PayloadAction<UIState['activeView']>) => {
      state.activeView = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    }
  }
});

// Workspace Slice
export interface WorkspaceFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface TerminalLog {
  id: string;
  text: string;
  type: 'info' | 'error' | 'success' | 'input';
}

export interface WorkspaceState {
  files: WorkspaceFile[];
  activeFilePath: string;
  activeFileContent: string;
  terminalLogs: TerminalLog[];
  aiResponse: string;
  isAiLoading: boolean;
}

const initialWorkspaceState: WorkspaceState = {
  files: [],
  activeFilePath: 'server.js',
  activeFileContent: '',
  terminalLogs: [
    { id: '1', text: 'AI Coding Workspace OS v1.0.0 Initialized.', type: 'info' },
    { id: '2', text: 'Type "help" to view available simulator commands.', type: 'info' }
  ],
  aiResponse: '',
  isAiLoading: false
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: initialWorkspaceState,
  reducers: {
    setFiles: (state, action: PayloadAction<WorkspaceFile[]>) => {
      state.files = action.payload;
      // Default set active content
      const active = action.payload.find(f => f.path === state.activeFilePath);
      if (active) {
        state.activeFileContent = active.content;
      }
    },
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFilePath = action.payload;
      const file = state.files.find(f => f.path === action.payload);
      if (file) {
        state.activeFileContent = file.content;
      }
    },
    addFile: (state, action: PayloadAction<WorkspaceFile>) => {
    state.files.push(action.payload);
  },
    updateActiveContent: (state, action: PayloadAction<string>) => {
      state.activeFileContent = action.payload;
      const file = state.files.find(f => f.path === state.activeFilePath);
      if (file) {
        file.content = action.payload;
      }
    },
    addTerminalLog: (state, action: PayloadAction<Omit<TerminalLog, 'id'>>) => {
      state.terminalLogs.push({
        ...action.payload,
        id: Math.random().toString()
      });
    },
    clearTerminal: (state) => {
      state.terminalLogs = [];
    },
    setAiResponse: (state, action: PayloadAction<string>) => {
      state.aiResponse = action.payload;
    },
    setAiLoading: (state, action: PayloadAction<boolean>) => {
      state.isAiLoading = action.payload;
    }
  }
});

// Kanban Slice
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

export interface KanbanState {
  tasks: KanbanTask[];
  loading: boolean;
}

const initialKanbanState: KanbanState = {
  tasks: [],
  loading: false
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState: initialKanbanState,
  reducers: {
    setTasks: (state, action: PayloadAction<KanbanTask[]>) => {
      state.tasks = action.payload;
    },
    moveTask: (state, action: PayloadAction<{ id: string; status: KanbanTask['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
    },
    addTaskLocally: (state, action: PayloadAction<KanbanTask>) => {
      state.tasks.push(action.payload);
    }
  }
});

// Chat Slice
export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  activeChannel: string;
}

const initialChatState: ChatState = {
  messages: [],
  activeChannel: '#general'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialChatState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessageLocally: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setActiveChannel: (state, action: PayloadAction<string>) => {
      state.activeChannel = action.payload;
    }
  }
});

// Docker Slice
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

export interface DockerState {
  containers: DockerContainer[];
}

const initialDockerState: DockerState = {
  containers: []
};

const dockerSlice = createSlice({
  name: 'docker',
  initialState: initialDockerState,
  reducers: {
    setContainers: (state, action: PayloadAction<DockerContainer[]>) => {
      state.containers = action.payload;
    },
    updateContainerLocally: (state, action: PayloadAction<{ id: string; status: DockerContainer['status'] }>) => {
      const cont = state.containers.find(c => c.id === action.payload.id);
      if (cont) {
        cont.status = action.payload.status;
      }
    }
  }
});

// Pull Requests Slice
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

export interface PRState {
  pullRequests: PullRequest[];
  activePrId: string | null;
}

const initialPRState: PRState = {
  pullRequests: [],
  activePrId: null
};

const prSlice = createSlice({
  name: 'prs',
  initialState: initialPRState,
  reducers: {
    setPRs: (state, action: PayloadAction<PullRequest[]>) => {
      state.pullRequests = action.payload;
      if (!state.activePrId && action.payload.length > 0) {
        state.activePrId = action.payload[0].id;
      }
    },
    setActivePR: (state, action: PayloadAction<string>) => {
      state.activePrId = action.payload;
    }
  }
});

// Configure Store
export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    workspace: workspaceSlice.reducer,
    kanban: kanbanSlice.reducer,
    chat: chatSlice.reducer,
    docker: dockerSlice.reducer,
    prs: prSlice.reducer
  }
});

// Export Actions
export const uiActions = uiSlice.actions;
export const workspaceActions = workspaceSlice.actions;
export const kanbanActions = kanbanSlice.actions;
export const chatActions = chatSlice.actions;
export const dockerActions = dockerSlice.actions;
export const prActions = prSlice.actions;

// Export Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
