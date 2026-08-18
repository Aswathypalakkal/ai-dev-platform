import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, kanbanActions } from '../store';
import { 
  Sparkles, 
  Plus, 
  Tag, 
  User, 
  ArrowRight,
  ArrowLeft,
  X,
  Loader
} from 'lucide-react';

export const KanbanView: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.kanban.tasks);
  
  const [featureInput, setFeatureInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Alex Rivera');
  //const [newTaskAssignee, setNewTaskAssignee] = useState('Alex Rivera');


  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      if (res.ok) {
        const data = await res.json();
        console.log("API data:", data);
      // Convert MongoDB _id to frontend id
      const formattedTasks = data.tasks.map((task: any) => ({
        ...task,
        id: task._id,
      }));
      dispatch(kanbanActions.setTasks(formattedTasks));
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [dispatch]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


 

  const handleMoveTask = async (id: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const statuses: ('todo' | 'in-progress' | 'in-review' | 'done')[] = ['todo', 'in-progress', 'in-review', 'done'];
    const idx = statuses.indexOf(currentStatus as 'todo' | 'in-progress' | 'in-review' | 'done');
    const nextIdx = direction === 'forward' ? idx + 1 : idx - 1;
    
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      const nextStatus = statuses[nextIdx];
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) {
          dispatch(kanbanActions.moveTask({ id, status: nextStatus }));
        }
      } catch (err) {
        console.error('Failed to update task status:', err);
      }
    }
  };

  const handleAITaskGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureInput.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:5000/api/tasks/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureDescription: featureInput })
      });
      if (res.ok) {
        setFeatureInput('');
        fetchTasks(); // Refresh tasks list
      }
    } catch (err) {
      console.error('Failed to generate AI tasks:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("newdded")

    if (!newTaskTitle.trim()) return;
    console.log("new task added")


    try {
    console.log("new task added1")

      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          status: 'todo',
          priority: newTaskPriority,
          assignee: newTaskAssignee,
          tags: ['custom']
        })
      });
      console.log("response status :",res)
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setShowAddModal(false);
        fetchTasks(); // Refresh tasks list
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const columns = [
    { id: 'todo', name: 'To Do', border: 'border-t-indigo-500' },
    { id: 'in-progress', name: 'In Progress', border: 'border-t-sky-500' },
    { id: 'in-review', name: 'In Review', border: 'border-t-amber-500' },
    { id: 'done', name: 'Done', border: 'border-t-emerald-500' }
  ] as const;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-2px)] bg-slate-900">
      
      {/* Page Header + Task Creator Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Project Kanban Board</h2>
          <p className="text-slate-400 text-xs">Manage tasks, collaborate with AI product agents, and track deployment releases.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold glow-indigo transition self-start"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* AI Task Generator Bar */}
      <div className="glass-panel p-5 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">AI Agile Task Synthesizer</h3>
        </div>
        <form onSubmit={handleAITaskGenerate} className="flex gap-4">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe a feature (e.g., 'Implement multi-factor authentication with SMS OTP fallback')..."
            className="flex-1 bg-slate-950 text-xs text-white border border-slate-800 rounded-lg px-4 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isGenerating || !featureInput.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 text-xs font-semibold disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Generate Tasks
              </>
            )}
          </button>
        </form>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          console.log("tasks",tasks);
          console.log("tasks of task")
          if(tasks.length==0){
            console.log("no tasks")
            return
          }
          else{

          

          //const colTasks = tasks[tasks].filter((t) => t.status === col.id);
         // console.log("coltasks are :",colTasks)

          const colTasks = tasks.filter((t) => t.status === col.id);
          console.log("coltasks are :",colTasks)
          return (
            <div key={col.id} className={`glass-panel rounded-xl border-t-4 ${col.border} p-4 space-y-4 min-h-[400px] flex flex-col`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h4 className="font-semibold text-sm text-slate-200">{col.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">{colTasks.length}</span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{task.id}</span>
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs text-white leading-relaxed">{task.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-normal">{task.description}</p>
                      
                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((t, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-500">
                              <Tag className="w-2 h-2" /> {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer controls */}
                      <div className="flex items-center justify-between border-t border-slate-850 pt-2.5 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="truncate max-w-[80px]">{task.assignee}</span>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {col.id !== 'todo' && (
                            <button 
                              onClick={() => handleMoveTask(task.id, task.status, 'backward')}
                              className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button 
                              onClick={() => handleMoveTask(task.id, task.status, 'forward')}
                              className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        }
        })}
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Kanban Task</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Summarize the work item..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-400">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detail the implementation steps..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Assignee</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition mt-2"
                //onClick={() => console.log("Button clicked!")}
                onClick={handleAddCustomTask}

               
                

                >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
