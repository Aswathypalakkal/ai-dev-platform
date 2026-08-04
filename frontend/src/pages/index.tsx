import React from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Sidebar } from '../components/Sidebar';
import { DashboardView } from '../components/DashboardView';
import { WorkspaceView } from '../components/WorkspaceView';
import { KanbanView } from '../components/KanbanView';
import { PRView } from '../components/PRView';
import { TeamChatView } from '../components/TeamChatView';
import { DockerView } from '../components/DockerView';

export default function Home() {
  const activeView = useSelector((state: RootState) => state.ui.activeView);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'workspace':
        return <WorkspaceView />;
      case 'kanban':
        return <KanbanView />;
      case 'prs':
        return <PRView />;
      case 'chat-video':
        return <TeamChatView />;
      case 'docker':
        return <DockerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Head>
        <title>DevFlow AI - Enterprise Coding Platform</title>
        <meta name="description" content="AI Software Development platform combining code editor, Jira-like board, and live team collaboration space." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Main Sidebar Shell */}
      <Sidebar />

      {/* Main Content Workspace viewport */}
      <main className="flex-1 min-w-0 bg-slate-900/60 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900 to-slate-950 -z-10" />
        {renderActiveView()}
      </main>
    </div>
  );
}
