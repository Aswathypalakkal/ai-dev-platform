import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, uiActions } from '../store';
import { 
  LayoutDashboard, 
  Code2, 
  Kanban, 
  GitPullRequest, 
  MessageSquare, 
  Database, 
  Settings,
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const activeView = useSelector((state: RootState) => state.ui.activeView);
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', name: 'AI Workspace', icon: Code2 },
    { id: 'kanban', name: 'Kanban Board', icon: Kanban },
    { id: 'prs', name: 'Pull Requests', icon: GitPullRequest },
    { id: 'chat-video', name: 'Team Space', icon: MessageSquare },
    { id: 'docker', name: 'Docker Engine', icon: Database },
  ] as const;

  return (
    <aside className={`h-screen border-r border-slate-800 bg-slate-950 flex flex-col justify-between transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
    
     
      <div>
        {/* Header/Logo */}

        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center glow-indigo">
            <Cpu className="w-5 h-5 text-white" />
          </div>
            <button
  onClick={() => {
             // Any component
dispatch(uiActions.toggleSidebar());

  }}
  className="text-left bg-transparent border-0 p-0"
>
  <h1 className="font-bold text-lg tracking-tight text-white">
    DevFlow AI
  </h1>

  <span className="text-xs font-semibold text-indigo-400">
    Enterprise Edition
  </span>
</button>
         
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(uiActions.setView(item.id))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
            A
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">Aswathy</h4>
              <p className="text-xs text-slate-500 truncate">Lead Developer</p>
            </div>
          )}
        </div>
      </div>
      
    </aside>
    
  );
};
