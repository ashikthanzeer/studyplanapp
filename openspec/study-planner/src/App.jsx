import { useState, useEffect } from 'react';
import { AppStateProvider } from './context/AppContext';
import { useStreak } from './hooks/useStreak';
import { Header, MobileNav, MainContent, Sidebar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SubjectList } from './components/SubjectList';
import { PomodoroTimer } from './components/PomodoroTimer';
import './index.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  useStreak();

  const changePage = (page) => {
    if (!validPages.includes(page)) return;
    window.location.hash = page;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-950">
      <Header currentPage={currentPage} onPageChange={changePage} />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar currentPage={currentPage} onPageChange={changePage} />
        <MainContent>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'tasks' && <SubjectList onOpenTimer={() => changePage('timer')} />}
          {currentPage === 'timer' && <PomodoroTimer />}
        </MainContent>
      </div>

      <MobileNav currentPage={currentPage} onPageChange={changePage} />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

const validPages = ['dashboard', 'tasks', 'timer'];

function getPageFromHash() {
  const page = window.location.hash.replace('#', '');
  return validPages.includes(page) ? page : 'dashboard';
}
