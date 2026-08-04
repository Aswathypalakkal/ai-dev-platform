import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, workspaceActions } from '../store';
import { 
  FileCode, 
  Terminal as TermIcon, 
  Sparkles, 
  Play, 
  Save, 
  Code,
  FileText,
  HelpCircle,
  Wrench,
  CheckCircle,
  Loader
} from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const dispatch = useDispatch();
  const { files, activeFilePath, activeFileContent, terminalLogs, aiResponse, isAiLoading } = useSelector(
    (state: RootState) => state.workspace
  );

  const [termInput, setTermInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch file list on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Autoscroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const fetchFiles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/files');
      if (res.ok) {
        const data = await res.json();
        dispatch(workspaceActions.setFiles(data));
      }
    } catch (err) {
      console.error('Failed to load files from server:', err);
    }
  };

  const handleFileClick = (path: string) => {
    dispatch(workspaceActions.setActiveFile(path));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(workspaceActions.updateActiveContent(e.target.value));
  };

  const saveFile = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('http://localhost:5000/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFilePath, content: activeFileContent })
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (err) {
      setSaveStatus('idle');
      console.error('Save failed:', err);
    }
  };

  const handleAIAction = async (action: 'explain' | 'review' | 'fix' | 'document') => {
    dispatch(workspaceActions.setAiLoading(true));
    dispatch(workspaceActions.setAiResponse(''));
    try {
      const res = await fetch('http://localhost:5000/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          filePath: activeFilePath,
          fileContent: activeFileContent
        })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(workspaceActions.setAiResponse(data.result));
      }
    } catch (err: any) {
      dispatch(workspaceActions.setAiResponse('Error connecting to AI backend. Ensure backend is running.'));
    } finally {
      dispatch(workspaceActions.setAiLoading(false));
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;

    const cmd = termInput.trim();
    dispatch(workspaceActions.addTerminalLog({ text: `$ ${cmd}`, type: 'input' }));
    setTermInput('');

    if (cmd.toLowerCase() === 'clear') {
      dispatch(workspaceActions.clearTerminal());
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      dispatch(workspaceActions.addTerminalLog({ 
        text: 'Available Commands: \n  docker ps - View active Docker status \n  docker stop <name> - Stop container \n  docker start <name> - Start container \n  docker images - View local repository images \n  git status - View workspace changes \n  clear - Clear terminal logs',
        type: 'info' 
      }));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(workspaceActions.addTerminalLog({ text: data.result, type: 'success' }));
      }
    } catch (err) {
      dispatch(workspaceActions.addTerminalLog({ text: 'Error executing command. Socket server offline.', type: 'error' }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      
      {/* File Actions Toolbar */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold text-white">{activeFilePath || 'Select a file'}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Helper Actions */}
          <button 
            onClick={() => handleAIAction('explain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-600/20 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Explain Code
          </button>
          <button 
            onClick={() => handleAIAction('fix')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-600/20 transition"
          >
            <Wrench className="w-3.5 h-3.5" /> Fix Bugs
          </button>
          <button 
            onClick={() => handleAIAction('document')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/10 text-sky-400 border border-sky-500/20 text-xs font-semibold hover:bg-sky-600/20 transition"
          >
            <FileText className="w-3.5 h-3.5" /> Document API
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-2" />

          {/* Save Button */}
          <button
            onClick={saveFile}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Save className="w-3.5 h-3.5" />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save File'}
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Nested File Explorer */}
        <div className="w-56 border-r border-slate-800 bg-slate-950/40 p-4 space-y-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Explorer</h3>
          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => handleFileClick(file.path)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                  activeFilePath === file.path 
                    ? 'bg-slate-800 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Code className={`w-4 h-4 shrink-0 ${activeFilePath === file.path ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Pane: Text Editor & Bottom Terminal */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          
          {/* Code Text Editor Container */}
          <div className="flex-1 relative bg-slate-950 flex font-mono text-sm leading-relaxed overflow-hidden">
            {/* Editor line numbers (simulated) */}
            <div className="w-12 bg-slate-950 border-r border-slate-800/60 p-4 text-right text-slate-600 select-none text-xs space-y-[2px]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            {/* Main Textarea input */}
            <textarea
              value={activeFileContent}
              onChange={handleContentChange}
              className="flex-1 h-full bg-slate-950 text-slate-300 p-4 focus:outline-none resize-none font-mono text-xs overflow-y-auto"
              style={{ tabSize: 2 }}
              placeholder="// Select a file from the explorer list to begin editing..."
            />
          </div>

          {/* Bottom Pane: Terminal Emulator */}
          <div className="h-56 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0">
            {/* Terminal Header */}
            <div className="h-8 border-b border-slate-850 bg-slate-950/90 px-4 flex items-center gap-2 shrink-0">
              <TermIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DevFlow OS Terminal Emulator</span>
            </div>

            {/* Terminal log logs */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300">
              {terminalLogs.map((log) => (
                <div key={log.id} className="whitespace-pre-wrap">
                  {log.type === 'input' ? (
                    <span className="text-indigo-400">{log.text}</span>
                  ) : log.type === 'error' ? (
                    <span className="text-rose-500">{log.text}</span>
                  ) : log.type === 'success' ? (
                    <span className="text-slate-300">{log.text}</span>
                  ) : (
                    <span className="text-sky-400">{log.text}</span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal prompt input form */}
            <form onSubmit={handleTerminalSubmit} className="h-9 border-t border-slate-850 bg-slate-950/40 px-4 flex items-center font-mono text-xs">
              <span className="text-indigo-500 mr-2">$</span>
              <input
                type="text"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
                placeholder="Type 'help' to view simulator commands..."
              />
            </form>
          </div>
        </div>

        {/* Right Pane: AI Assistant Output */}
        <div className="w-96 bg-slate-950/80 p-6 flex flex-col shrink-0 overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">AI Copilot Assistant</h3>
          </div>

          <div className="flex-1 space-y-4 text-xs leading-relaxed text-slate-300">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-slate-500 font-medium">AI Agent generating solution...</span>
              </div>
            ) : aiResponse ? (
              <div className="whitespace-pre-wrap font-sans space-y-3 prose prose-invert">
                {/* Parse Markdown headings and warnings */}
                {aiResponse.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) {
                    return <h4 key={idx} className="font-bold text-white mt-4 text-sm">{line.replace('###', '')}</h4>;
                  }
                  if (line.startsWith('##')) {
                    return <h3 key={idx} className="font-bold text-white mt-4 text-base">{line.replace('##', '')}</h3>;
                  }
                  if (line.startsWith('* **')) {
                    return <div key={idx} className="text-slate-300 pl-2 mt-1">{line}</div>;
                  }
                  if (line.startsWith('```')) {
                    return null; // Skip raw code blocks markers, standard text displays code cleanly
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>
            ) : (
              <div className="text-slate-500 text-center h-48 flex flex-col items-center justify-center space-y-2">
                <Sparkles className="w-8 h-8 text-slate-700" />
                <p>Select a file in the explorer tree and click an assistant action above to trigger code generation, explanation, or fix scripts.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
