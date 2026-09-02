import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import { CentralPublishModal } from '../admin/CentralPublishModal';
import {
  Bell,
  Search,
  Clock,
  Play,
  Pause,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  ChevronDown,
  Menu,
  Sparkles,
  Users,
  Palette,
  ExternalLink,
  Zap,
  Check,
  Moon,
  Activity,
  PlusCircle,
  Megaphone,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const {
    currentUser,
    isAdmin,
    attendanceSession,
    startAttendanceSession,
    pauseAttendanceSession,
    logout,
    loginAsDemoUser,
    allUsers,
    setOnlineStatus,
  } = useAuth();

  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    settings,
  } = useData();

  const { theme, setTheme, allThemes, currentThemeConfig } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Format seconds into HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter user notifications
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || n.userId === 'all' || (isAdmin && n.userId === 'user_admin_michael')
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl transition-colors duration-300"
      style={{
        backgroundColor: `${currentThemeConfig.bgSurface}f0`,
        borderColor: currentThemeConfig.borderSubtle,
        color: currentThemeConfig.textPrimary,
      }}
    >
      {/* Left: Mobile Toggle & Brand Indicator */}
      <div className="flex items-center gap-4">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(isAdmin ? '/admin' : '/dashboard')}
        >
          <div
            className="w-9 h-9 rounded-xl p-0.5 shadow-lg group-hover:scale-105 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${currentThemeConfig.primaryAccent} 0%, ${currentThemeConfig.secondaryAccent} 100%)`,
            }}
          >
            <div
              className="w-full h-full rounded-[10px] flex items-center justify-center font-extrabold text-xs"
              style={{
                backgroundColor: currentThemeConfig.bgMain,
                color: currentThemeConfig.primaryAccent,
              }}
            >
              N
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-black uppercase tracking-widest leading-none font-display flex items-center gap-1.5" style={{ color: currentThemeConfig.textPrimary }}>
              {settings.productName || 'NORYXA TEAM HUB'}
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                style={{
                  backgroundColor: currentThemeConfig.badgeBg,
                  color: currentThemeConfig.badgeText,
                  border: `1px solid ${currentThemeConfig.borderSubtle}`,
                }}
              >
                v6.2
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold mt-1" style={{ color: currentThemeConfig.textMuted }}>
              {settings.companyName || 'NORYXA Agency'}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search tasks, pipeline, SOPs, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#11182c]/80 hover:bg-[#161f38] focus:bg-[#161f38] border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Workday Punch Timer */}
        <div className="hidden sm:flex items-center bg-[#11182c]/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs shadow-inner">
          <div className="flex items-center gap-2 text-slate-200 mr-2.5 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${attendanceSession.isActive ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold tracking-wider">{formatTimer(attendanceSession.secondsElapsed)}</span>
          </div>
          {attendanceSession.isActive ? (
            <button
              id="pause-session-btn"
              onClick={pauseAttendanceSession}
              title="Pause Work Session"
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="start-session-btn"
              onClick={startAttendanceSession}
              title="Resume Work Session"
              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Theme Presets Button */}
        <div className="relative" ref={themeRef}>
          <button
            id="theme-selector-btn"
            onClick={() => setShowThemeModal(!showThemeModal)}
            title="Switch Dashboard Design System"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm"
            style={{
              backgroundColor: currentThemeConfig.bgCard,
              borderColor: currentThemeConfig.borderSubtle,
              color: currentThemeConfig.textPrimary,
            }}
          >
            <Palette className="w-4 h-4" style={{ color: currentThemeConfig.primaryAccent }} />
            <span className="hidden xl:inline text-[11px] font-bold">Theme</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold uppercase" style={{ backgroundColor: currentThemeConfig.badgeBg, color: currentThemeConfig.badgeText }}>
              5 UI Options
            </span>
          </button>

          {showThemeModal && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: currentThemeConfig.bgSurface,
                borderColor: currentThemeConfig.borderGlow,
                color: currentThemeConfig.textPrimary,
              }}
            >
              <div className="flex items-center justify-between pb-2.5 border-b px-1" style={{ borderColor: currentThemeConfig.borderSubtle }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: currentThemeConfig.primaryAccent }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Dashboard UI Design Systems
                  </span>
                  <p className="text-[10px] mt-0.5" style={{ color: currentThemeConfig.textMuted }}>
                    Choose any of the 5 custom agency design presets
                  </p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase" style={{ backgroundColor: currentThemeConfig.badgeBg, color: currentThemeConfig.badgeText }}>
                  Live Switch
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-0.5">
                {allThemes.map((t) => {
                  const isCurrent = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeModal(false);
                      }}
                      className="w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer group"
                      style={{
                        backgroundColor: isCurrent ? currentThemeConfig.bgCard : `${currentThemeConfig.bgCard}80`,
                        borderColor: isCurrent ? t.primaryAccent : currentThemeConfig.borderSubtle,
                        boxShadow: isCurrent ? `0 0 15px ${t.primaryAccent}25` : 'none',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 items-center mt-1">
                          <div
                            className="w-4 h-4 rounded-full border shadow-sm flex-shrink-0"
                            style={{ backgroundColor: t.primaryAccent, borderColor: 'rgba(255,255,255,0.2)' }}
                            title={`Primary: ${t.primaryAccent}`}
                          />
                          <div
                            className="w-3 h-3 rounded-full border shadow-sm flex-shrink-0"
                            style={{ backgroundColor: t.secondaryAccent, borderColor: 'rgba(255,255,255,0.2)' }}
                            title={`Secondary: ${t.secondaryAccent}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold leading-tight" style={{ color: t.isLightMode ? '#0f172a' : '#f8fafc' }}>{t.name}</p>
                            {t.isLightMode && (
                              <span className="text-[8px] px-1.5 py-0.2 rounded font-bold uppercase bg-blue-100 text-blue-700">
                                Light Mode
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] leading-snug mt-1" style={{ color: t.isLightMode ? '#475569' : '#94a3b8' }}>
                            {t.subtitle}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded" style={{ backgroundColor: `${t.primaryAccent}15`, color: t.primaryAccent }}>
                              {t.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 flex-shrink-0" style={{ color: t.primaryAccent }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Publish Broadcast Button */}
        {isAdmin && (
          <button
            id="admin-central-publish-btn"
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            title="Publish Broadcast to Team"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Publish Update</span>
          </button>
        )}

        {/* Fast Switch User Button */}
        <button
          id="switch-role-btn"
          onClick={() => setShowSwitchUserModal(true)}
          className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#11182c]/80 hover:bg-indigo-600/20 text-slate-200 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Switch Account</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 relative transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-indigo-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0d1322] rounded-2xl shadow-2xl border border-white/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#11182c]/90">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-indigo-300 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {userNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No new alerts right now.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.link) {
                          onNavigate(notif.link);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-[#161f38] cursor-pointer transition-colors flex items-start gap-3 ${
                        !notif.isRead ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-indigo-400 shadow-sm shadow-indigo-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-tight">{notif.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-white/10 bg-[#11182c]/80 text-center">
                <button
                  onClick={() => {
                    onNavigate('/notifications');
                    setShowNotifications(false);
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          >
            <UserAvatar
              name={currentUser?.displayName || 'User'}
              avatarUrl={currentUser?.avatarUrl}
              onlineStatus={currentUser?.onlineStatus || 'online'}
              size="sm"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {currentUser?.displayName || currentUser?.fullName}
                {isAdmin && <Shield className="w-3 h-3 text-indigo-400" />}
              </p>
              <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">
                {isAdmin ? 'Agency Director' : currentUser?.jobTitle || 'Team Member'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d1322] rounded-2xl shadow-2xl border border-white/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-white/10 bg-[#11182c]/90">
                <p className="text-xs font-bold text-white">{currentUser?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                    {isAdmin ? 'EXECUTIVE ADMIN' : 'MEMBER PORTAL'}
                  </span>

                  <select
                    value={currentUser?.onlineStatus || 'online'}
                    onChange={(e) => setOnlineStatus(e.target.value as any)}
                    className="text-[10px] bg-[#090d16] border border-white/10 rounded-lg px-2 py-0.5 text-white font-medium focus:outline-none"
                  >
                    <option value="online">🟢 Online</option>
                    <option value="away">🟡 Away</option>
                    <option value="offline">⚪ Offline</option>
                  </select>
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    onNavigate('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  My Agency Profile
                </button>
                <button
                  onClick={() => {
                    onNavigate(isAdmin ? '/admin/settings' : '/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Portal Settings
                </button>
                <button
                  onClick={() => {
                    setShowSwitchUserModal(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-indigo-300 flex items-center gap-2.5 font-semibold transition-colors"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  Switch Test Account
                </button>

                <div className="border-t border-white/10 pt-1">
                  <button
                    id="user-signout-btn"
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Sign Out & Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Switch User Modal */}
      {showSwitchUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1322] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Switch Test Profile</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select any profile to test different roles:
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {allUsers.map((u) => {
                const isSelected = u.id === currentUser?.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAsDemoUser(u.id);
                      setShowSwitchUserModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-white/5 hover:border-white/20 bg-[#11182c]/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.displayName || u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {u.displayName || u.fullName}
                          {u.role === 'admin' && (
                            <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{u.jobTitle} • {u.department}</p>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSwitchUserModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Central Publish Broadcast Modal */}
      <CentralPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </header>
  );
};
