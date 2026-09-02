import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Notification } from '../../types';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Trash2,
  CheckSquare,
  MessageSquare,
  GraduationCap,
  Brain,
  Megaphone,
  Video,
  FileText,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { currentUser, isAdmin } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useData();

  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter user notifications
  const userNotifs = notifications.filter(
    (n) =>
      n.userId === currentUser?.id ||
      n.userId === 'all' ||
      (isAdmin && n.userId === 'user_admin_michael')
  );

  const filteredNotifs = userNotifs.filter((n) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unread') return !n.isRead;
    if (filterCategory === 'tasks') return n.category === 'task' || n.category === 'review';
    if (filterCategory === 'community') return n.category === 'community' || n.category === 'agency_feed';
    if (filterCategory === 'academy') return n.category === 'learning' || n.category === 'video';
    if (filterCategory === 'intelligence') return n.category === 'intelligence';
    if (filterCategory === 'announcements') return n.category === 'announcement';
    return true;
  });

  const unreadTotal = userNotifs.filter((n) => !n.isRead).length;

  // Group notifications by date (Today, Yesterday, Earlier)
  const todayNotifs: Notification[] = [];
  const yesterdayNotifs: Notification[] = [];
  const earlierNotifs: Notification[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;

  filteredNotifs.forEach((n) => {
    const time = new Date(n.createdAt).getTime();
    if (time >= startOfToday) {
      todayNotifs.push(n);
    } else if (time >= startOfYesterday) {
      yesterdayNotifs.push(n);
    } else {
      earlierNotifs.push(n);
    }
  });

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'task':
      case 'review':
        return <CheckSquare className="w-4 h-4 text-indigo-400" />;
      case 'community':
      case 'agency_feed':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'learning':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'intelligence':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handleNotifClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);

    // Navigation mapping
    if (notif.link) {
      onNavigate(notif.link);
      return;
    }

    if (notif.section) {
      switch (notif.section) {
        case 'academy':
          onNavigate(`/learning${notif.relatedContentId ? `?id=${notif.relatedContentId}` : ''}`);
          break;
        case 'intelligence':
          onNavigate(`/intelligence${notif.relatedContentId ? `?id=${notif.relatedContentId}` : ''}`);
          break;
        case 'community':
        case 'feed':
          onNavigate(`/community${notif.relatedContentId ? `?id=${notif.relatedContentId}` : ''}`);
          break;
        case 'tasks':
          onNavigate(`/tasks${notif.relatedContentId ? `?id=${notif.relatedContentId}` : ''}`);
          break;
        default:
          onNavigate('/dashboard');
      }
    }
  };

  const renderNotifGroup = (title: string, list: Notification[]) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 font-mono flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          {title} ({list.length})
        </h4>

        <div className="space-y-2">
          {list.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group shadow-lg ${
                !notif.isRead
                  ? 'bg-gradient-to-r from-indigo-950/40 via-[#11182c] to-[#0d1322] border-indigo-500/40 shadow-indigo-950/20'
                  : 'bg-[#0d1322]/80 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                  !notif.isRead ? 'bg-indigo-500/15 border-indigo-500/30' : 'bg-white/5 border-white/10'
                }`}>
                  {getNotificationIcon(notif.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {notif.title}
                    </h5>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-sm shadow-indigo-400" />
                    )}
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded bg-white/5 text-slate-400">
                      {notif.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                    <span>
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notif.senderName && (
                      <span>From: <strong className="text-slate-300">{notif.senderName}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotifClick(notif);
                  }}
                  className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
                  title="Open Related Content"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {deleteNotification && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                    title="Dismiss Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notification Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Team Alerts & System Broadcasts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track task assignments, community replies, academy updates, and agency announcements.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadTotal})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-xl shadow-black/30">
        <Filter className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadTotal})` },
          { id: 'tasks', label: 'Tasks' },
          { id: 'community', label: 'Community' },
          { id: 'academy', label: 'Academy' },
          { id: 'intelligence', label: 'Intelligence' },
          { id: 'announcements', label: 'Announcements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grouped Notifications */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Notifications Match Your Filter</h4>
          <p className="text-xs text-slate-400">You are completely up to date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderNotifGroup('Today', todayNotifs)}
          {renderNotifGroup('Yesterday', yesterdayNotifs)}
          {renderNotifGroup('Earlier', earlierNotifs)}
        </div>
      )}
    </div>
  );
};
