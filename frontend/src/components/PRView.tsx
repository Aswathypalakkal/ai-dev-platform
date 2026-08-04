import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, prActions } from '../store';
import { 
  Sparkles, 
  Loader
} from 'lucide-react';

export const PRView: React.FC = () => {
  const dispatch = useDispatch();
  const prs = useSelector((state: RootState) => state.prs.pullRequests);
  const activePrId = useSelector((state: RootState) => state.prs.activePrId);

  const [aiReviewResult, setAiReviewResult] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchPRs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/prs');
      if (res.ok) {
        const data = await res.json();
        dispatch(prActions.setPRs(data));
      }
    } catch (err) {
      console.error('Failed to fetch PRs:', err);
    }
  }, [dispatch]);

  // Fetch PRs on mount
  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  const activePR = prs.find(p => p.id === activePrId);

  const triggerAIReview = async () => {
    if (!activePrId) return;
    setIsReviewing(true);
    setAiReviewResult('');
    try {
      const res = await fetch(`http://localhost:5000/api/prs/${activePrId}/ai-review`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAiReviewResult(data.review);
        fetchPRs(); // Refresh to load reviews
      }
    } catch {
      setAiReviewResult('Failed to run AI Pull Request reviewer server.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-2px)] bg-slate-900">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pull Request Code Review</h2>
          <p className="text-slate-400 text-xs">Run security audits, view code diffs, and fetch automated AI code reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left pane: PR List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pull Requests</h3>
          <div className="space-y-3">
            {prs.map((pr) => (
              <button
                key={pr.id}
                onClick={() => {
                  dispatch(prActions.setActivePR(pr.id));
                  setAiReviewResult('');
                }}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  activePrId === pr.id 
                    ? 'bg-indigo-600/10 border-indigo-500 glow-indigo' 
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-500">{pr.id}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    {pr.status}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-white leading-relaxed mb-1.5">{pr.title}</h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Author: {pr.author}</span>
                  <span className="font-mono text-indigo-400">{pr.branchFrom} ➔ {pr.branchTo}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right pane: PR Diff and AI Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {activePR ? (
            <div className="space-y-6">
              
              {/* PR Header Meta */}
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{activePR.title}</h3>
                  <button
                    onClick={triggerAIReview}
                    disabled={isReviewing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold glow-indigo disabled:opacity-50 transition"
                  >
                    {isReviewing ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" /> Reviewing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Request AI Review
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{activePR.description}</p>
              </div>

              {/* Code Diff Panel */}
              <div className="glass-panel rounded-xl overflow-hidden">
                <div className="h-9 bg-slate-950/80 px-4 flex items-center border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  File Changes: server.js Diff
                </div>
                <div className="p-4 bg-slate-950/40 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
                  {activePR.diff.split('\n').map((line, idx) => {
                    const isAddition = line.startsWith('+');
                    const isDeletion = line.startsWith('-');
                    return (
                      <div 
                        key={idx} 
                        className={`px-3 py-0.5 rounded-sm ${
                          isAddition ? 'bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500' :
                          isDeletion ? 'bg-rose-950/30 text-rose-400 border-l-2 border-rose-500' : 'text-slate-400'
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Review Results Section */}
              {(aiReviewResult || activePR.reviews.length > 0) && (
                <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">AI Agent Code Review</h4>
                  </div>
                  
                  <div className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap prose prose-invert">
                    {aiReviewResult ? aiReviewResult : activePR.reviews.map((r, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>Reviewer: {r.reviewer}</span>
                          <span className="text-indigo-400">Approved: {r.approved ? 'Yes' : 'No'}</span>
                        </div>
                        {r.comment.split('\n').map((line, idx) => {
                          if (line.startsWith('###')) return <h5 key={idx} className="font-bold text-white text-xs mt-3">{line.replace('###', '')}</h5>;
                          if (line.startsWith('##')) return <h4 key={idx} className="font-bold text-white text-sm mt-3">{line.replace('##', '')}</h4>;
                          if (line.includes('UNSAFE')) return <div key={idx} className="text-rose-400 font-semibold mt-1">{line}</div>;
                          return <p key={idx}>{line}</p>;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-64 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              No pull request selected.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
