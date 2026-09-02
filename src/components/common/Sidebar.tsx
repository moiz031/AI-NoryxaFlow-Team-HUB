import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Calendar,
  FileText,
  History,
  TrendingUp,
  FolderOpen,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings,
  Users,
  Clock,
  Inbox,
  BarChart3,
  ShieldCheck,
  Building,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
  Zap,
  Layers,
  Award
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { tasks, notifications, settings } = useData();
  const { currentThemeConfig } = useTheme();

  // Calculate pending counts
  const pendingReviewsCount = tasks.filter((t) => t.status === 'waiting_for_review').length;
  const myPendingTasksCount = tasks.filter(
    (t) => (t.status === 'assigned' || t.status === 'in_progress' || t.status === 'revision_required') &&
           t.assignedTo.includes(currentUser?.id || '')
  ).length;
  const unreadNotifsCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.isRead
  ).length;

  // Calculate section unread counts
  const unreadCommunityCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.isRead && (n.section === 'community' || n.section === 'feed' || n.category === 'community' || n.category === 'agency_feed')
  ).length;

  const unreadAcademyCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.isRead && (n.section === 'academy' || n.category === 'learning')
  ).length;

  const unreadIntelCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.isRead && (n.section === 'intelligence' || n.category === 'intelligence')
  ).length;

  const handleNavClick = (route: string) => {
    onNavigate(route);
    onCloseMobile();
  };

  // Nav item list for ADMIN
  const adminNavItems = [
    {
      group: 'COMMAND CENTER',
      items: [
        { label: 'Dashboard', route: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Team Roster', route: '/admin/team', icon: <Users className="w-4 h-4" /> },
        {
          label: 'Proof Submissions',
          route: '/admin/submissions',
          icon: <Inbox className="w-4 h-4" />,
          badge: pendingReviewsCount > 0 ? String(pendingReviewsCount) : undefined,
          badgeColor: 'bg-amber-500 text-black',
        },
        { label: 'Live Attendance', route: '/admin/attendance', icon: <Clock className="w-4 h-4" /> },
        { label: 'Activity Log', route: '/admin/activity-log', icon: <Sparkles className="w-4 h-4" /> },
      ],
    },
    {
      group: 'DELIVERY PIPELINE',
      items: [
        { label: 'Deliverables & Tasks', route: '/admin/tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'Kanban Pipeline', route: '/admin/task-board', icon: <Kanban className="w-4 h-4" /> },
        { label: 'Daily Work Reports', route: '/admin/reports', icon: <FileText className="w-4 h-4" /> },
        { label: 'Team Calendar', route: '/admin/calendar', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Files & Assets Vault', route: '/admin/files', icon: <FolderOpen className="w-4 h-4" /> },
      ],
    },
    {
      group: 'ACADEMY & INTEL',
      items: [
        {
          label: 'Agency Feed & Community',
          route: '/community',
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadCommunityCount > 0 ? String(unreadCommunityCount) : undefined,
          badgeColor: 'bg-cyan-500 text-black',
        },
        {
          label: 'Learning Center',
          route: '/learning',
          icon: <GraduationCap className="w-4 h-4" />,
          badge: unreadAcademyCount > 0 ? String(unreadAcademyCount) : undefined,
          badgeColor: 'bg-emerald-500 text-black',
        },
      ],
    },
    {
      group: 'GOVERNANCE & AUDIT',
      items: [
        { label: 'Agency Analytics', route: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Audit Trail', route: '/admin/audit-logs', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Agency Settings', route: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  // Nav item list for MEMBER
  const memberNavItems = [
    {
      group: 'MY WORKSPACE',
      items: [
        { label: 'My Dashboard', route: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          label: 'Assigned Deliverables',
          route: '/tasks',
          icon: <CheckSquare className="w-4 h-4" />,
          badge: myPendingTasksCount > 0 ? String(myPendingTasksCount) : undefined,
          badgeColor: 'bg-indigo-500 text-white',
        },
        { label: 'Task Pipeline', route: '/task-board', icon: <Kanban className="w-4 h-4" /> },
        { label: 'Submit Daily Report', route: '/daily-report', icon: <FileText className="w-4 h-4" /> },
        { label: 'Work History', route: '/work-history', icon: <History className="w-4 h-4" /> },
        { label: 'Performance Rank', route: '/performance', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      group: 'ACADEMY & INTEL',
      items: [
        {
          label: 'Team Community & Feed',
          route: '/community',
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadCommunityCount > 0 ? String(unreadCommunityCount) : undefined,
          badgeColor: 'bg-cyan-500 text-black',
        },
        {
          label: 'Learning Academy',
          route: '/learning',
          icon: <GraduationCap className="w-4 h-4" />,
          badge: unreadAcademyCount > 0 ? String(unreadAcademyCount) : undefined,
          badgeColor: 'bg-emerald-500 text-black',
        },
      ],
    },
    {
      group: 'PROFILE & ACCOUNT',
      items: [
        {
          label: 'Alerts',
          route: '/notifications',
          icon: <Bell className="w-4 h-4" />,
          badge: unreadNotifsCount > 0 ? String(unreadNotifsCount) : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { label: 'My Profile', route: '/profile', icon: <User className="w-4 h-4" /> },
        { label: 'Preferences', route: '/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const currentNavGroups = isAdmin ? adminNavItems : memberNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: currentThemeConfig.bgSurface,
          borderColor: currentThemeConfig.borderSubtle,
          color: currentThemeConfig.textPrimary,
        }}
      >
        {/* Header Branding */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ backgroundColor: `${currentThemeConfig.bgMain}aa`, borderColor: currentThemeConfig.borderSubtle }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl p-0.5 shadow-md flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${currentThemeConfig.primaryAccent} 0%, ${currentThemeConfig.secondaryAccent} 100%)`,
              }}
            >
              <div className="w-full h-full rounded-[10px] flex items-center justify-center font-black text-xs" style={{ backgroundColor: currentThemeConfig.bgMain, color: currentThemeConfig.primaryAccent }}>
                N
              </div>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest leading-none font-display" style={{ color: currentThemeConfig.textPrimary }}>
                {settings.productName || 'NORYXA TEAM HUB'}
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-wider block mt-1" style={{ color: currentThemeConfig.primaryAccent }}>
                {isAdmin ? 'ADMIN COMMAND' : 'MEMBER PORTAL'}
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg opacity-70 hover:opacity-100"
            style={{ color: currentThemeConfig.textSecondary }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {currentNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest mb-2 font-display" style={{ color: currentThemeConfig.textMuted }}>
                {group.group}
              </p>
              {group.items.map((item) => {
                const isActive =
                  currentRoute === item.route || currentRoute === item.route.replace(/^\//, '');
                return (
                  <button
                    key={item.route}
                    id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleNavClick(item.route)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer"
                    style={{
                      background: isActive ? currentThemeConfig.activeNavBg : 'transparent',
                      color: isActive ? '#ffffff' : currentThemeConfig.textSecondary,
                      boxShadow: isActive ? currentThemeConfig.glowEffect : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          color: isActive ? '#ffffff' : currentThemeConfig.textMuted,
                        }}
                        className="group-hover:scale-110 transition-transform"
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? '#ffffff' : currentThemeConfig.primaryAccent,
                          color: isActive ? '#0f172a' : '#ffffff',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Profile & Sign Out */}
        <div className="p-3 border-t" style={{ borderColor: currentThemeConfig.borderSubtle, backgroundColor: `${currentThemeConfig.bgMain}80` }}>
          <div className="flex items-center justify-between p-2.5 rounded-xl border" style={{ backgroundColor: currentThemeConfig.bgCard, borderColor: currentThemeConfig.borderSubtle }}>
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => handleNavClick('/profile')}
            >
              <UserAvatar
                name={currentUser?.displayName || currentUser?.fullName || 'User'}
                avatarUrl={currentUser?.avatarUrl}
                onlineStatus={currentUser?.onlineStatus || 'online'}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-none" style={{ color: currentThemeConfig.textPrimary }}>
                  {currentUser?.displayName || currentUser?.fullName}
                </p>
                <p className="text-[10px] uppercase tracking-wider truncate mt-1" style={{ color: currentThemeConfig.primaryAccent }}>
                  {isAdmin ? 'Agency Director' : currentUser?.jobTitle || 'Team Member'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
