import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, chatActions } from '../store';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  Hash, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  Sparkles,
  Users,
  MessageSquare
} from 'lucide-react';

let socket: Socket | null = null;

export const TeamChatView: React.FC = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const activeChannel = useSelector((state: RootState) => state.chat.activeChannel);

  const [messageText, setMessageText] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Meeting transcripts (simulated real-time transcription)
  const [meetingTranscripts, setMeetingTranscripts] = useState<{ speaker: string; text: string }[]>([]);
  const [meetingSummary, setMeetingSummary] = useState<string[]>([
    'Meeting initiated at ' + new Date().toLocaleTimeString(),
    'Alex and Sarah aligned on security refactors'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket client connection
  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.on('new-message', (msg) => {
      dispatch(chatActions.addMessageLocally(msg));
    });

    fetchMessages();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Autoscroll chat logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Autoscroll meeting transcript logs
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meetingTranscripts]);

  // Handle mock video participant transcript stream
  useEffect(() => {
    if (!isVideoActive) {
      setMeetingTranscripts([]);
      return;
    }

    const transcriptLines = [
      { speaker: 'Sarah Connor', text: 'Hey Alex, did you review the JWT security issue in server.js yet?' },
      { speaker: 'Alex Rivera', text: 'Yes! I moved the secret key references over to environment configurations.' },
      { speaker: 'Copilot Moderator (AI)', text: 'I recommend adding bcrypt comparison validations next to prevent plain-text audits.' },
      { speaker: 'Sarah Connor', text: 'Agreed, let\'s write those Jest verification tests today.' },
      { speaker: 'Alex Rivera', text: 'I am starting the docker testing environment now.' }
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < transcriptLines.length) {
        setMeetingTranscripts(prev => [...prev, transcriptLines[currentLine]]);
        
        // Append bulleted summary notes dynamically
        if (currentLine === 1) {
          setMeetingSummary(prev => [...prev, 'Alex refactored JWT secret keys to env configuration.']);
        } else if (currentLine === 2) {
          setMeetingSummary(prev => [...prev, 'AI Agent proposed bcrypt hashing implementation.']);
        } else if (currentLine === 3) {
          setMeetingSummary(prev => [...prev, 'Sarah scheduled Jest auth verification tests.']);
        }
        
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isVideoActive]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat');
      if (res.ok) {
        const data = await res.json();
        dispatch(chatActions.setMessages(data));
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Alex Rivera',
          avatar: '👨‍💻',
          content: messageText,
          role: 'user'
        })
      });
      if (res.ok) {
        setMessageText('');
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const channels = ['#general', '#dev-team', '#ai-suggestions'];

  return (
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      
      {/* Channels Sidebar List */}
      <div className="w-56 border-r border-slate-800 bg-slate-950/40 p-4 space-y-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Collaboration</h3>
          </div>
          <div className="space-y-1">
            {channels.map((chan) => (
              <button
                key={chan}
                onClick={() => dispatch(chatActions.setActiveChannel(chan))}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                  activeChannel === chan 
                    ? 'bg-slate-800 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>{chan.replace('#', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video Call Trigger Pane */}
        <div className="glass-panel p-4 rounded-xl space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase">Video Meeting Room</h4>
          <p className="text-[10px] text-slate-500">Conduct standups with team members and AI Moderator.</p>
          <button
            onClick={() => setIsVideoActive(!isVideoActive)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition ${
              isVideoActive 
                ? 'bg-rose-600/10 text-rose-400 border-rose-500/30 hover:bg-rose-600/20' 
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 glow-indigo'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {isVideoActive ? 'End Call' : 'Start Standup'}
          </button>
        </div>
      </div>

      {/* Main Center Space */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        
        {/* Chat window panel */}
        <div className={`flex-1 flex flex-col min-w-0 border-r border-slate-800 ${isVideoActive ? 'max-w-[45%]' : ''}`}>
          
          {/* Chat Header */}
          <div className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span>{activeChannel.replace('#', '')}</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" /> 3 Online
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                  {msg.avatar}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-white">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl rounded-tl-none text-xs text-slate-300 max-w-md leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/40 flex gap-3 shrink-0">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Send message to ${activeChannel}...`}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-4 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Video Standup Call Panel overlay (shows when active) */}
        {isVideoActive && (
          <div className="flex-1 flex bg-slate-950 p-6 gap-6 overflow-y-auto">
            
            <div className="flex-1 flex flex-col gap-6">
              {/* Participant Video Grid */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* User 1: You */}
                <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[140px] overflow-hidden">
                  <span className="text-3xl">👨‍💻</span>
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium flex items-center gap-1">
                    Alex Rivera (You) {!isMuted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                  </div>
                </div>

                {/* User 2: Sarah */}
                <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[140px] overflow-hidden">
                  <span className="text-3xl">👩‍💻</span>
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium flex items-center gap-1">
                    Sarah Connor <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>

                {/* User 3: AI Assistant Agent */}
                <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 flex items-center justify-center min-h-[140px] overflow-hidden glow-indigo">
                  <span className="text-3xl">🤖</span>
                  <div className="absolute bottom-3 left-3 bg-indigo-950/80 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                    Copilot Moderator (AI) <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                </div>

                {/* Screenshare preview */}
                <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between p-3 min-h-[140px] overflow-hidden">
                  <div className="font-mono text-[8px] text-slate-500 leading-normal select-none">
                    $ docker compose build<br />
                    [1/3] Building frontend<br />
                    [2/3] Building backend...<br />
                    [3/3] Done. Image: server:latest
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium flex items-center gap-1">
                    Shared Console
                  </div>
                </div>
              </div>

              {/* Call Controls panel */}
              <div className="h-16 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center gap-4 shrink-0 px-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-lg border transition ${
                    isMuted ? 'bg-rose-600/10 border-rose-500/30 text-rose-400' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setIsVideoActive(false)}
                  className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                >
                  Leave Call
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-3 rounded-lg border transition ${
                    isScreenSharing ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <MonitorUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Moderator side panel */}
            <div className="w-72 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-1 shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">AI Meeting Moderator</h4>
              </div>

              {/* Speech transcription */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[220px]">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Real-time Transcription</h5>
                {meetingTranscripts.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Waiting for speech transcript lines...</p>
                ) : (
                  meetingTranscripts.map((t, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[9px] font-bold text-indigo-400">{t.speaker}</span>
                      <p className="text-[10px] text-slate-300 leading-normal p-2 bg-slate-950/40 rounded border border-slate-850/60">{t.text}</p>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>

              {/* Automated minutes summary */}
              <div className="border-t border-slate-850 pt-3 space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auto Minutes Summary</h5>
                <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1.5">
                  {meetingSummary.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
