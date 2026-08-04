import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, dockerActions } from '../store';
import { io } from 'socket.io-client';
import { 
  Database, 
  Play, 
  Square, 
  RefreshCw, 
  Terminal, 
  Loader
} from 'lucide-react';

interface MetricItem {
  id: string;
  cpu: number;
  memory: string;
  status: 'running' | 'stopped' | 'restarting';
}

export const DockerView: React.FC = () => {
  const dispatch = useDispatch();
  const containers = useSelector((state: RootState) => state.docker.containers);
  
  const [selectedContId, setSelectedContId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/docker/containers');
      if (res.ok) {
        const data = await res.json();
        dispatch(dockerActions.setContainers(data));
        if (data.length > 0 && !selectedContId) {
          setSelectedContId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load container lists:', err);
    }
  }, [dispatch, selectedContId]);

  useEffect(() => {
    fetchContainers();

    // Setup socket listeners to read real-time metrics and status
    const socket = io('http://localhost:5000');

    socket.on('containers-updated', (data) => {
      dispatch(dockerActions.setContainers(data));
    });

    socket.on('system-metrics', (metrics: MetricItem[]) => {
      // Stream fluctuating CPU/RAM values into store
      dispatch(dockerActions.setContainers(
        containers.map(c => {
          const match = metrics.find((m) => m.id === c.id);
          return match ? { ...c, cpu: match.cpu, memory: match.memory, status: match.status } : c;
        })
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [containers, dispatch, fetchContainers]);

  const handleContainerAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/docker/containers/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const updated = await res.json();
        dispatch(dockerActions.updateContainerLocally({ id, status: updated.status }));
        fetchContainers(); // Refresh image states
      }
    } catch (err) {
      console.error('Docker command failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeContainer = containers.find(c => c.id === selectedContId);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-2px)] bg-slate-900">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Docker Containers Engine</h2>
          <p className="text-slate-400 text-xs">Administrate local microservices, manage daemon controls, and monitor system resources.</p>
        </div>
      </div>

      {/* Main Containers Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Double Panel: Container Services Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Services</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {containers.map((c) => {
              const isSelected = selectedContId === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedContId(c.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between h-48 ${
                    isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500 glow-indigo' 
                      : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <h4 className="font-semibold text-xs text-white truncate max-w-[120px]">{c.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                        c.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>CPU Usage:</span>
                        <span className="text-slate-300 font-semibold">{c.cpu}%</span>
                      </div>
                      <div className="h-1 rounded bg-slate-900 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000"
                          style={{ width: `${c.status === 'running' ? Math.min(100, c.cpu * 20) : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Memory:</span>
                      <span className="text-slate-300 font-semibold">{c.memory}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 border-t border-slate-850 pt-3 mt-3 justify-end">
                    {actionLoadingId === c.id ? (
                      <Loader className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleContainerAction(c.id, 'start'); }}
                          disabled={c.status === 'running'}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-850 transition disabled:opacity-30"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleContainerAction(c.id, 'stop'); }}
                          disabled={c.status === 'stopped'}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-850 transition disabled:opacity-30"
                        >
                          <Square className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleContainerAction(c.id, 'restart'); }}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-850 transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Container Console Logs */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Console Logs</h3>
          
          <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-[400px]">
            <div className="h-9 bg-slate-950/80 px-4 flex items-center border-b border-slate-800 justify-between shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                {activeContainer ? `${activeContainer.name} stdout` : 'Select a service'}
              </span>
            </div>

            <div className="flex-1 p-4 bg-slate-950/40 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-2 text-slate-400">
              {activeContainer && activeContainer.logs.length > 0 ? (
                activeContainer.logs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">
                    <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                    {log}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center italic text-slate-650">
                  No logs available.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
