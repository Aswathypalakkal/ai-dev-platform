import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, uiActions } from '../store';
import { 
  GitPullRequest, 
  CheckCircle2, 
  MessageSquareCode, 
  Activity, 
  Sparkles, 
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.kanban.tasks);
  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const prs = useSelector((state: RootState) => state.prs.pullRequests);
  const containers = useSelector((state: RootState) => state.docker.containers);

  // Derive metrics
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const activePRs = prs.filter(p => p.status === 'open').length;
  const activeContainers = containers.filter(c => c.status === 'running').length;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-2px)]">
      {/* Top Banner Greeting */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/20 glow-indigo">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine Online
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, Aswathy.</h2>
          <p className="text-slate-300 text-sm md:text-base">
            Your workspace is active. The AI agent recommends performing an review on Pull Request **PR-1** or checking the SQL injection task.
          </p>
        </div>
      </div>

      {/* Grid Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Kanban Tasks</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{tasks.length}</h3>
            <p className="text-xs text-slate-500 mt-1">{doneTasks} tasks marked as Completed</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Open Pull Requests</span>
            <GitPullRequest className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{activePRs}</h3>
            <p className="text-xs text-slate-500 mt-1">Pending AI review feedback</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Active Microservices</span>
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{activeContainers} / {containers.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Docker Daemon active & healthy</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Team Chat Notifications</span>
            <MessageSquareCode className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">{chatMessages.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Active channels: #general, #dev-team</p>
          </div>
        </div>
      </div>

      {/* Main Core Layout: Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Double Panel: Action center */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> AI Suggested Workspaces
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suggestion 1 */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-rose-500 space-y-4">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">Security Critical</span>
              <h4 className="font-semibold text-white text-sm">Fix plain-text passwords in API</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The login endpoint in \`server.js\` uses plain text password checking. Refactor to use bcrypt hashing and load secret keys from environment variables.
              </p>
              <button 
                onClick={() => dispatch(uiActions.setView('workspace'))}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Open in Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggestion 2 */}
            <div className="glass-panel p-5 rounded-xl border-l-4 border-amber-500 space-y-4">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">Optimization</span>
              <h4 className="font-semibold text-white text-sm">Optimize pagination database queries</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database service queries currently retrieve entire collections. Implement paginated endpoints to reduce network payloads.
              </p>
              <button 
                onClick={() => dispatch(uiActions.setView('workspace'))}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Open in Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-white text-sm">Orchestrated Tasks Dashboard</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button 
                onClick={() => dispatch(uiActions.setView('workspace'))}
                className="p-3 text-center rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-xs font-medium text-slate-300"
              >
                Open IDE Editor
              </button>
              <button 
                onClick={() => dispatch(uiActions.setView('kanban'))}
                className="p-3 text-center rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-xs font-medium text-slate-300"
              >
                Open Kanban Board
              </button>
              <button 
                onClick={() => dispatch(uiActions.setView('prs'))}
                className="p-3 text-center rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-xs font-medium text-slate-300"
              >
                Review Pull Requests
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Infrastructure Health and AI status */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" /> Container Monitoring
          </h3>

          <div className="glass-panel p-6 rounded-xl space-y-6">
            {containers.map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                    c.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>CPU: {c.cpu}%</span>
                      <span>MEM: {c.memory}</span>
                    </div>
                    <div className="h-1.5 rounded bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${c.status === 'running' ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        style={{ width: `${c.status === 'running' ? Math.min(100, c.cpu * 20) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* AI Connection status */}
          <div className="glass-panel p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Engines Connection Matrix</h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">OpenAI API (Cloud)</span>
                <span className="font-semibold text-slate-500">Auto-configured</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Ollama API (Local)</span>
                <span className="font-semibold text-slate-500">Active Fallback</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Simulated AI Kernel</span>
                <span className="font-semibold text-emerald-400">Connected (Ready)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
