import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { Lock, Eye, ShieldAlert } from 'lucide-react';

// Pages & Views
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { TaskBoard } from './components/tasks/TaskBoard';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { TaskCreateModal } from './components/tasks/TaskCreateModal';
import { TeamActivityLive } from './components/attendance/TeamActivityLive';
import { DailyReportForm } from './components/reports/DailyReportForm';
import { DailyReportList } from './components/reports/DailyReportList';
import { CommunityFeed } from './components/community/CommunityFeed';
import { LearningCenter } from './components/learning/LearningCenter';
import { SOPList } from './components/sops/SOPList';
import { FileManager } from './components/files/FileManager';
import { TeamCalendar } from './components/calendar/TeamCalendar';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { AgencySettings } from './components/admin/AgencySettings';
import { UserProfileView } from './components/profile/UserProfileView';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { IntelligenceCenter } from './components/intelligence/IntelligenceCenter';
import { MemberActivityTimeline } from './components/admin/MemberActivityTimeline';
import { Task } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { currentThemeConfig } = useTheme();
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!currentUser) {
    return <AuthModal />;
  }

  const renderCurrentView = () => {
    const route = currentRoute.replace(/^\//, ''); // normalize leading slash

    // Strict Admin Route Guard for Non-Admin Members
    const isAdminOnlyRoute =
      route.startsWith('admin') ||
      route === 'admin/team' ||
      route === 'admin/audit-logs' ||
      route === 'admin/settings' ||
      route === 'admin/activity-log' ||
      route === 'team' ||
      route === 'audit-logs';

    if (!isAdmin && isAdminOnlyRoute && route !== 'dashboard' && route !== 'admin') {
      return (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-center max-w-lg mx-auto space-y-4 my-12 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Access Restricted</h3>
            <p className="text-xs text-slate-400 mt-1">
              Admin privileges are required to view this panel. Team members do not have permission to access admin controls.
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('dashboard')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            Return to My Dashboard
          </button>
        </div>
      );
    }

    switch (route) {
      case 'dashboard':
      case 'admin':
        return isAdmin ? (
          <AdminDashboard onNavigate={setCurrentRoute} />
        ) : (
          <MemberDashboard onNavigate={setCurrentRoute} />
        );

      case 'tasks':
      case 'task-board':
      case 'admin/tasks':
      case 'admin/task-board':
        return (
          <TaskBoard
            onOpenTaskDetail={(task) => setSelectedTask(task)}
            onOpenCreateTask={isAdmin ? () => setShowCreateTaskModal(true) : undefined}
          />
        );

      case 'attendance':
      case 'admin/attendance':
        return <TeamActivityLive />;

      case 'daily-reports':
      case 'daily-report':
      case 'admin/reports':
        return (
          <div className="space-y-8">
            {!isAdmin && (
              <DailyReportForm onSuccess={() => setCurrentRoute('/reports-history')} />
            )}
            <DailyReportList />
          </div>
        );

      case 'reports-history':
      case 'work-history':
        return <DailyReportList />;

      case 'community':
      case 'admin/community':
        return <CommunityFeed />;

      case 'learning':
      case 'admin/learning':
        return <LearningCenter />;

      case 'sops':
      case 'admin/sops':
        return <SOPList />;

      case 'files':
      case 'admin/files':
        return <FileManager />;

      case 'calendar':
      case 'admin/calendar':
        return <TeamCalendar />;

      case 'team':
      case 'admin/team':
      case 'team-roster':
        return isAdmin ? <UserManagement /> : <MemberDashboard onNavigate={setCurrentRoute} />;

      case 'submissions':
      case 'admin/submissions':
        return (
          <TaskBoard
            onOpenTaskDetail={(task) => setSelectedTask(task)}
            onOpenCreateTask={isAdmin ? () => setShowCreateTaskModal(true) : undefined}
          />
        );

      case 'audit-logs':
      case 'admin/audit-logs':
        return isAdmin ? <AuditLogsView /> : <MemberDashboard onNavigate={setCurrentRoute} />;

      case 'activity-log':
      case 'admin/activity-log':
        return isAdmin ? <MemberActivityTimeline /> : <MemberDashboard onNavigate={setCurrentRoute} />;

      case 'intelligence':
      case 'admin/intelligence':
        return <IntelligenceCenter onNavigate={setCurrentRoute} />;

      case 'notifications':
        return <NotificationsPage onNavigate={setCurrentRoute} />;

      case 'settings':
      case 'admin/settings':
        return isAdmin ? <AgencySettings /> : <UserProfileView />;

      case 'profile':
      case 'performance':
      case 'admin/performance':
      case 'admin/analytics':
        return <UserProfileView />;

      default:
        return isAdmin ? (
          <AdminDashboard onNavigate={setCurrentRoute} />
        ) : (
          <MemberDashboard onNavigate={setCurrentRoute} />
        );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300 selection:bg-teal-500 selection:text-white"
      style={{
        backgroundColor: currentThemeConfig.bgMain,
        color: currentThemeConfig.textPrimary,
        fontFamily: currentThemeConfig.fontBody,
      }}
    >
      {/* Navbar */}
      <Navbar
        onNavigate={setCurrentRoute}
        onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
          {!isAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#162033] via-[#1a182e] to-[#162033] border border-cyan-500/40 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold flex-shrink-0">
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300 font-display">
                      Team Member UI Design Preview
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold uppercase">
                      Read-Only Demo Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Viewing the Team Portal UI layout. All features & buttons are locked in Read-Only Mode (No changes can be made).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                <Lock className="w-3.5 h-3.5" /> Actions Locked (Demo UI)
              </div>
            </div>
          )}
          {renderCurrentView()}
        </main>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onEditTask={(task) => {
            setSelectedTask(null);
            setEditingTask(task);
          }}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <TaskCreateModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskCreateModal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          initialTask={editingTask}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
