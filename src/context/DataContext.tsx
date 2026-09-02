import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Task,
  TaskStatus,
  WorkSubmission,
  DailyReport,
  AttendanceRecord,
  Notification,
  CommunityPost,
  LearningResource,
  IntelligenceItem,
  SOPItem,
  CalendarEvent,
  AuditLog,
  SystemSettings,
  AttachmentFile,
  TaskComment,
  CustomFieldDefinition,
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_LEARNING_RESOURCES,
  INITIAL_SOPS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { db, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from '../lib/firebase';

interface DataContextType {
  // Tasks
  tasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'submissions' | 'comments' | 'timeline'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, details?: string) => void;
  deleteTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  
  // Submissions & Proof-of-Work
  submitWorkForReview: (submissionData: {
    taskId: string;
    summary: string;
    challengesFaced?: string;
    notesForAdmin?: string;
    leadsFound?: number;
    leadsQualified?: number;
    leadsContacted?: number;
    repliesReceived?: number;
    followupsSent?: number;
    meetingsBooked?: number;
    successfulConversions?: number;
    customFields?: { fieldId: string; label: string; value: string | number | boolean }[];
    attachments: AttachmentFile[];
    googleSheetUrl?: string;
    proofLinks?: string[];
  }) => Promise<void>;
  reviewSubmission: (taskId: string, submissionId: string, decision: 'approve' | 'revision' | 'reject', feedback?: string) => void;
  
  // Daily Reports
  dailyReports: DailyReport[];
  createDailyReport: (reportData: Omit<DailyReport, 'id' | 'createdAt' | 'userId' | 'userName' | 'userEmail' | 'userAvatar'>) => Promise<DailyReport>;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  
  // Files
  files: AttachmentFile[];
  uploadFile: (fileData: Omit<AttachmentFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => Promise<AttachmentFile>;
  deleteFile: (fileId: string) => void;
  
  // Community & Agency Feed
  communityPosts: CommunityPost[];
  createCommunityPost: (postData: {
    title: string;
    content: string;
    category: CommunityPost['category'];
    section?: 'agency_feed' | 'community';
    isPinned?: boolean;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
    attachments?: AttachmentFile[];
  }) => Promise<CommunityPost>;
  togglePostLike: (postId: string) => void;
  addPostReaction: (postId: string, emoji: string) => void;
  addPostComment: (postId: string, content: string) => void;
  togglePinPost: (postId: string) => void;
  deletePost?: (postId: string) => void;
  
  // Learning & SOPs
  learningResources: LearningResource[];
  createLearningResource: (resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'completedByUsers' | 'uploadedBy' | 'uploadedByName'>) => Promise<LearningResource>;
  toggleResourceCompleted: (resourceId: string) => void;
  toggleResourceCompletion?: (resourceId: string) => void;
  deleteLearningResource?: (resourceId: string) => void;
  sops: SOPItem[];
  createSOP: (sopData: Omit<SOPItem, 'id' | 'lastUpdated' | 'authorName'>) => Promise<SOPItem>;
  updateSOP: (sopId: string, updates: Partial<SOPItem>) => void;
  deleteSOP: (sopId: string) => void;

  // Intelligence
  intelligenceItems: IntelligenceItem[];
  createIntelligenceItem: (itemData: Omit<IntelligenceItem, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorAvatar'>) => Promise<IntelligenceItem>;
  deleteIntelligenceItem: (itemId: string) => void;

  // Central Publishing & Broadcast
  publishCentralContent: (publishData: {
    title: string;
    content: string;
    section: 'feed' | 'community' | 'academy' | 'intelligence' | 'announcements';
    category: string;
    targetAudience: 'all' | string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
    attachments?: AttachmentFile[];
    isPinned?: boolean;
    keyTakeaways?: string[];
    reportUrl?: string;
    videoUrl?: string;
  }) => Promise<void>;
  
  // Calendar
  calendarEvents: CalendarEvent[];
  createCalendarEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdBy'>) => Promise<CalendarEvent>;
  deleteCalendarEvent: (eventId: string) => void;
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  createNotification: (notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  deleteNotification: (notificationId: string) => void;
  
  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, target: string, targetType: AuditLog['targetType'], details: string) => void;
  
  // Settings
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  addCustomFieldTemplate: (name: string, category: string, fields: CustomFieldDefinition[]) => void;
  
  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Export Data
  exportToCSV: (type: 'tasks' | 'attendance' | 'reports' | 'submissions') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  // Clean legacy mock cache if present
  useEffect(() => {
    const legacyKeys = [
      'noryxa_tasks_db', 'noryxa_reports_db', 'noryxa_attendance_db',
      'noryxa_posts_db', 'noryxa_learning_db', 'noryxa_sops_db',
      'noryxa_calendar_db', 'noryxa_notifications_db', 'noryxa_audit_logs_db',
      'noryxa_files_db'
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // Local storage state keys - initialized cleanly with zero artificial records
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_reports');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_posts');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  const [learningResources, setLearningResources] = useState<LearningResource[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_learning');
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_RESOURCES;
  });

  const [sops, setSops] = useState<SOPItem[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_sops');
    return saved ? JSON.parse(saved) : INITIAL_SOPS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_calendar');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [intelligenceItems, setIntelligenceItems] = useState<IntelligenceItem[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_intelligence');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [files, setFiles] = useState<AttachmentFile[]>(() => {
    const saved = localStorage.getItem('noryxa_agency_v5_files');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistence hooks
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_reports', JSON.stringify(dailyReports)); }, [dailyReports]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_attendance', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_posts', JSON.stringify(communityPosts)); }, [communityPosts]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_learning', JSON.stringify(learningResources)); }, [learningResources]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_intelligence', JSON.stringify(intelligenceItems)); }, [intelligenceItems]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_sops', JSON.stringify(sops)); }, [sops]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_calendar', JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('noryxa_agency_v5_files', JSON.stringify(files)); }, [files]);

  // Real-Time Firestore Synchronization
  useEffect(() => {
    if (!db) return;

    try {
      // 1. Notifications listener
      const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list: Notification[] = [];
        snapshot.forEach((d) => list.push(d.data() as Notification));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setNotifications(list);
      }, (err) => console.log('Firestore notifications listener note:', err.message));

      // 2. Posts & Feed listener
      const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
        const list: CommunityPost[] = [];
        snapshot.forEach((d) => list.push(d.data() as CommunityPost));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setCommunityPosts(list);
      }, (err) => console.log('Firestore posts listener note:', err.message));

      // 3. Learning Resources listener
      const unsubLearning = onSnapshot(collection(db, 'learningResources'), (snapshot) => {
        const list: LearningResource[] = [];
        snapshot.forEach((d) => list.push(d.data() as LearningResource));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setLearningResources(list);
      }, (err) => console.log('Firestore learning listener note:', err.message));

      // 4. Intelligence listener
      const unsubIntel = onSnapshot(collection(db, 'intelligence'), (snapshot) => {
        const list: IntelligenceItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as IntelligenceItem));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setIntelligenceItems(list);
      }, (err) => console.log('Firestore intelligence listener note:', err.message));

      // 5. Audit logs listener
      const unsubAudit = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((d) => list.push(d.data() as AuditLog));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (list.length > 0) setAuditLogs(list);
      }, (err) => console.log('Firestore audit logs listener note:', err.message));

      // 6. Tasks listener
      const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
        const list: Task[] = [];
        snapshot.forEach((d) => list.push(d.data() as Task));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setTasks(list);
      }, (err) => console.log('Firestore tasks listener note:', err.message));

      // 7. Daily Reports listener
      const unsubReports = onSnapshot(collection(db, 'dailyReports'), (snapshot) => {
        const list: DailyReport[] = [];
        snapshot.forEach((d) => list.push(d.data() as DailyReport));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (list.length > 0) setDailyReports(list);
      }, (err) => console.log('Firestore dailyReports listener note:', err.message));

      // 8. Files listener
      const unsubFiles = onSnapshot(collection(db, 'files'), (snapshot) => {
        const list: AttachmentFile[] = [];
        snapshot.forEach((d) => list.push(d.data() as AttachmentFile));
        list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        if (list.length > 0) setFiles(list);
      }, (err) => console.log('Firestore files listener note:', err.message));

      // 9. SOPs listener
      const unsubSops = onSnapshot(collection(db, 'sops'), (snapshot) => {
        const list: SOPItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as SOPItem));
        if (list.length > 0) setSops(list);
      }, (err) => console.log('Firestore sops listener note:', err.message));

      return () => {
        unsubNotifs();
        unsubPosts();
        unsubLearning();
        unsubIntel();
        unsubAudit();
        unsubTasks();
        unsubReports();
        unsubFiles();
        unsubSops();
      };
    } catch (err) {
      console.warn('Real-time listener setup fallback:', err);
    }
  }, []);

  // Audit Logger helper
  const logAuditAction = (action: string, target: string, targetType: AuditLog['targetType'], details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      action,
      actorId: currentUser.id,
      actorName: currentUser.displayName || currentUser.fullName,
      actorRole: currentUser.role,
      userName: currentUser.displayName || currentUser.fullName,
      target,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (db) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((err) => console.warn('Audit setDoc note:', err));
    }
  };

  // Notification helper
  const createNotification = async (notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderUserId: notifData.senderUserId || currentUser?.id,
      senderName: notifData.senderName || currentUser?.displayName || 'System',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    try {
      if (db) {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      }
    } catch (err) {
      console.warn('Firestore setDoc notification note:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    try {
      if (db) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
    } catch (err) {
      console.warn('Firestore deleteDoc notification note:', err);
    }
  };

  // Intelligence Operations
  const createIntelligenceItem = async (
    itemData: Omit<IntelligenceItem, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorAvatar'>
  ): Promise<IntelligenceItem> => {
    const newItem: IntelligenceItem = {
      ...itemData,
      id: `intel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      authorId: currentUser?.id || 'admin',
      authorName: currentUser?.displayName || 'Admin',
      authorAvatar: currentUser?.avatarUrl,
      createdAt: new Date().toISOString(),
    };

    setIntelligenceItems((prev) => [newItem, ...prev]);

    try {
      if (db) {
        await setDoc(doc(db, 'intelligence', newItem.id), newItem);
      }
    } catch (err) {
      console.warn('Firestore setDoc intelligence note:', err);
    }

    // Broadcast notification to team members
    createNotification({
      userId: 'all',
      title: `💡 Intelligence Update: ${newItem.title}`,
      message: newItem.summary,
      category: 'intelligence',
      section: 'intelligence',
      relatedContentId: newItem.id,
      link: '/intelligence',
    });

    logAuditAction('Intelligence Published', newItem.title, 'settings', `Category: ${newItem.category}`);
    return newItem;
  };

  const deleteIntelligenceItem = async (itemId: string) => {
    const target = intelligenceItems.find((i) => i.id === itemId);
    setIntelligenceItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      if (db) {
        await deleteDoc(doc(db, 'intelligence', itemId));
      }
    } catch (err) {
      console.warn('Firestore deleteDoc intelligence note:', err);
    }
    logAuditAction('Intelligence Deleted', target?.title || itemId, 'settings', 'Deleted report');
  };

  // Central Publisher & Broadcast Engine
  const publishCentralContent = async (publishData: {
    title: string;
    content: string;
    section: 'feed' | 'community' | 'academy' | 'intelligence' | 'announcements';
    category: string;
    targetAudience: 'all' | string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
    attachments?: AttachmentFile[];
    isPinned?: boolean;
    keyTakeaways?: string[];
    reportUrl?: string;
    videoUrl?: string;
  }) => {
    const { title, content, section, category, targetAudience, mediaUrl, mediaType, attachments, isPinned, keyTakeaways, reportUrl, videoUrl } = publishData;
    const contentId = `content_${Date.now()}`;

    if (section === 'feed' || section === 'community' || section === 'announcements') {
      const newPost: CommunityPost = {
        id: contentId,
        section: section === 'feed' || section === 'announcements' ? 'agency_feed' : 'community',
        title,
        content,
        category: (category as any) || 'Announcements',
        isPinned: Boolean(isPinned),
        authorId: currentUser?.id || 'admin',
        authorName: currentUser?.displayName || 'Michael Carter (Admin)',
        authorAvatar: currentUser?.avatarUrl,
        authorRole: currentUser?.role || 'admin',
        mediaUrl,
        mediaType,
        attachments: attachments || [],
        likes: [],
        reactions: {},
        commentsCount: 0,
        comments: [],
        targetAudience: Array.isArray(targetAudience) ? targetAudience.join(',') : targetAudience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCommunityPosts((prev) => [newPost, ...prev]);
      if (db) setDoc(doc(db, 'posts', newPost.id), newPost).catch((e) => console.warn(e));
    } else if (section === 'academy') {
      const newResource: LearningResource = {
        id: contentId,
        title,
        content,
        description: content.substring(0, 100),
        category: (category as any) || 'Training',
        type: mediaType === 'video' ? 'video' : 'guide',
        videoUrl: videoUrl || mediaUrl,
        uploadedBy: currentUser?.id || 'admin',
        uploadedByName: currentUser?.displayName || 'Admin',
        completedByUsers: [],
        createdAt: new Date().toISOString(),
      };

      setLearningResources((prev) => [newResource, ...prev]);
      if (db) setDoc(doc(db, 'learningResources', newResource.id), newResource).catch((e) => console.warn(e));
    } else if (section === 'intelligence') {
      const newIntel: IntelligenceItem = {
        id: contentId,
        title,
        summary: content.substring(0, 120),
        content,
        category: (category as any) || 'AI Insights',
        tags: [category || 'AI'],
        keyTakeaways,
        reportUrl,
        videoUrl: videoUrl || mediaUrl,
        authorId: currentUser?.id || 'admin',
        authorName: currentUser?.displayName || 'Admin',
        authorAvatar: currentUser?.avatarUrl,
        createdAt: new Date().toISOString(),
      };

      setIntelligenceItems((prev) => [newIntel, ...prev]);
      if (db) setDoc(doc(db, 'intelligence', newIntel.id), newIntel).catch((e) => console.warn(e));
    }

    // Send targeted Notifications
    const recipients = Array.isArray(targetAudience) ? targetAudience : ['all'];
    const notifCategory = section === 'academy' ? 'learning' : section === 'intelligence' ? 'intelligence' : mediaType === 'video' ? 'video' : 'announcement';

    recipients.forEach((uid) => {
      createNotification({
        userId: uid,
        senderUserId: currentUser?.id,
        senderName: currentUser?.displayName || 'Admin',
        title: `📢 ${title}`,
        message: content.substring(0, 80) + '...',
        category: notifCategory as any,
        section: section === 'academy' ? 'academy' : section === 'intelligence' ? 'intelligence' : 'community',
        relatedContentId: contentId,
        link: section === 'academy' ? '/learning' : section === 'intelligence' ? '/intelligence' : '/community',
      });
    });

    logAuditAction('Central Content Published', title, 'community', `Section: ${section}, Target: ${targetAudience}`);
  };

  // Task Operations
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'submissions' | 'comments' | 'timeline'>): Promise<Task> => {
    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: taskId,
      submissions: [],
      comments: [],
      timeline: [
        {
          id: `time_${Date.now()}`,
          taskId: taskId,
          timestamp: new Date().toISOString(),
          userId: currentUser?.id || 'admin',
          userName: currentUser?.displayName || 'Admin',
          action: 'Created task',
          details: `Assigned to ${taskData.assignedUserNames?.join(', ') || 'members'}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    if (db) setDoc(doc(db, 'tasks', newTask.id), newTask).catch((e) => console.warn('Task setDoc note:', e));

    // Create Calendar Event for deadline
    if (newTask.deadline) {
      const calEvent: CalendarEvent = {
        id: `cal_${newTask.id}`,
        title: `Deadline: ${newTask.title}`,
        startDate: newTask.deadline,
        endDate: newTask.deadline,
        type: 'task_deadline',
        relatedId: newTask.id,
        assignedTo: newTask.assignedTo,
        createdBy: currentUser?.id || 'admin',
      };
      setCalendarEvents((prev) => [calEvent, ...prev]);
    }

    // Send notifications to assigned members
    newTask.assignedTo.forEach((userId) => {
      createNotification({
        userId,
        title: 'New Task Assigned',
        message: `You were assigned "${newTask.title}" by ${currentUser?.displayName || 'Admin'}.`,
        category: 'task',
        link: `/tasks/${newTask.id}`,
      });
    });

    logAuditAction('Task Created', newTask.title, 'task', `Priority: ${newTask.priority}, Category: ${newTask.category}`);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
          if (db) setDoc(doc(db, 'tasks', taskId), updated).catch((e) => console.warn('Task update note:', e));
          return updated;
        }
        return t;
      })
    );
    logAuditAction('Task Updated', taskId, 'task', 'Updated task attributes');
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, details?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const timelineEntry = {
            id: `time_${Date.now()}`,
            taskId,
            timestamp: new Date().toISOString(),
            userId: currentUser?.id || 'system',
            userName: currentUser?.displayName || 'System',
            action: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
            details: details || '',
          };
          const updated = {
            ...t,
            status: newStatus,
            timeline: [timelineEntry, ...t.timeline],
            updatedAt: new Date().toISOString(),
            completedAt: (newStatus === 'completed' || newStatus === 'approved') ? new Date().toISOString() : t.completedAt,
          };
          if (db) setDoc(doc(db, 'tasks', taskId), updated).catch((e) => console.warn('Task status update note:', e));
          return updated;
        }
        return t;
      })
    );

    logAuditAction('Task Status Changed', taskId, 'task', `New status: ${newStatus}`);
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCalendarEvents((prev) => prev.filter((c) => c.relatedId !== taskId));
    if (db) deleteDoc(doc(db, 'tasks', taskId)).catch((e) => console.warn('Task delete note:', e));
    logAuditAction('Task Deleted', task?.title || taskId, 'task', 'Admin deleted task');
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedChecklist = t.checklist.map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c
          );
          return { ...t, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment: TaskComment = {
      id: `comm_${Date.now()}`,
      taskId,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
      userRole: currentUser.role,
      content,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: [...t.comments, newComment],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // Notify task owner or admin
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask) {
      if (currentUser.role === 'admin') {
        targetTask.assignedTo.forEach((uid) => {
          createNotification({
            userId: uid,
            title: 'Admin commented on your task',
            message: `${currentUser.displayName}: "${content.substring(0, 50)}..."`,
            category: 'task',
            link: `/tasks/${taskId}`,
          });
        });
      } else {
        createNotification({
          userId: 'user_admin_michael',
          title: 'Member commented on task',
          message: `${currentUser.displayName} on "${targetTask.title}": "${content.substring(0, 50)}..."`,
          category: 'task',
          link: `/tasks/${taskId}`,
        });
      }
    }
  };

  // Proof-of-work Submission Workflow
  const submitWorkForReview = async (submissionData: {
    taskId: string;
    summary: string;
    challengesFaced?: string;
    notesForAdmin?: string;
    leadsFound?: number;
    leadsQualified?: number;
    leadsContacted?: number;
    repliesReceived?: number;
    followupsSent?: number;
    meetingsBooked?: number;
    successfulConversions?: number;
    customFields?: { fieldId: string; label: string; value: string | number | boolean }[];
    attachments: AttachmentFile[];
    googleSheetUrl?: string;
    proofLinks?: string[];
  }) => {
    if (!currentUser) return;
    const task = tasks.find((t) => t.id === submissionData.taskId);
    if (!task) return;

    const newSubmission: WorkSubmission = {
      id: `sub_${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatarUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      summary: submissionData.summary,
      challengesFaced: submissionData.challengesFaced,
      notesForAdmin: submissionData.notesForAdmin,
      leadsFound: submissionData.leadsFound,
      leadsQualified: submissionData.leadsQualified,
      leadsContacted: submissionData.leadsContacted,
      repliesReceived: submissionData.repliesReceived,
      followupsSent: submissionData.followupsSent,
      meetingsBooked: submissionData.meetingsBooked,
      successfulConversions: submissionData.successfulConversions,
      customFields: submissionData.customFields,
      attachments: submissionData.attachments,
      googleSheetUrl: submissionData.googleSheetUrl,
      proofLinks: submissionData.proofLinks,
      revisionCount: task.submissions.length,
    };

    // Add attachments to global files list
    if (submissionData.attachments && submissionData.attachments.length > 0) {
      submissionData.attachments.forEach((file) => {
        if (db) setDoc(doc(db, 'files', file.id), file).catch((e) => console.warn('File setDoc note:', e));
      });
      setFiles((prev) => [...submissionData.attachments, ...prev]);
    }

    const timelineEntry = {
      id: `time_${Date.now()}`,
      taskId: task.id,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      action: 'Submitted work for review',
      details: submissionData.summary,
    };

    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === task.id) {
          const updated = {
            ...t,
            status: 'waiting_for_review' as TaskStatus,
            submissions: [newSubmission, ...t.submissions],
            timeline: [timelineEntry, ...t.timeline],
            updatedAt: new Date().toISOString(),
          };
          updatedTaskObj = updated;
          return updated;
        }
        return t;
      })
    );

    if (updatedTaskObj && db) {
      setDoc(doc(db, 'tasks', task.id), updatedTaskObj).catch((e) => console.warn('Task setDoc note:', e));
    }

    // Notify Admin
    createNotification({
      userId: 'user_admin_michael',
      title: 'Work Submitted for Review',
      message: `${currentUser.displayName} submitted work for "${task.title}".`,
      category: 'review',
      link: `/tasks/${task.id}`,
    });

    logAuditAction(
      'Work Submitted',
      task.title,
      'submission',
      `Submitted by ${currentUser.displayName}. Proof files: ${submissionData.attachments.length}`
    );
  };

  // Admin Review Decision
  const reviewSubmission = (
    taskId: string,
    submissionId: string,
    decision: 'approve' | 'revision' | 'reject',
    feedback?: string
  ) => {
    if (!currentUser) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let nextStatus: TaskStatus = 'approved';
    let submissionStatus: WorkSubmission['status'] = 'approved';
    let actionTitle = 'Approved Task';

    if (decision === 'revision') {
      nextStatus = 'revision_required';
      submissionStatus = 'revision_requested';
      actionTitle = 'Requested Revisions';
    } else if (decision === 'reject') {
      nextStatus = 'rejected';
      submissionStatus = 'rejected';
      actionTitle = 'Rejected Submission';
    }

    const timelineEntry = {
      id: `time_${Date.now()}`,
      taskId,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      action: actionTitle,
      details: feedback || '',
    };

    let updatedTaskObj: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubmissions = t.submissions.map((s) => {
            if (s.id === submissionId) {
              return {
                ...s,
                status: submissionStatus,
                reviewedBy: currentUser.id,
                reviewedByName: currentUser.displayName || currentUser.fullName,
                reviewedAt: new Date().toISOString(),
                adminFeedback: feedback,
              };
            }
            return s;
          });

          const updated = {
            ...t,
            status: nextStatus,
            submissions: updatedSubmissions,
            timeline: [timelineEntry, ...t.timeline],
            completedAt: decision === 'approve' ? new Date().toISOString() : t.completedAt,
            updatedAt: new Date().toISOString(),
          };
          updatedTaskObj = updated;
          return updated;
        }
        return t;
      })
    );

    if (updatedTaskObj && db) {
      setDoc(doc(db, 'tasks', taskId), updatedTaskObj).catch((e) => console.warn('Review task setDoc note:', e));
    }

    // Notify assigned members
    task.assignedTo.forEach((userId) => {
      createNotification({
        userId,
        title: decision === 'approve' ? 'Task Approved! 🎉' : decision === 'revision' ? 'Revision Requested' : 'Submission Rejected',
        message: `Admin ${currentUser.displayName} reviewed "${task.title}": ${feedback || 'Approved'}`,
        category: 'review',
        link: `/tasks/${taskId}`,
      });
    });

    logAuditAction(
      `Admin Review: ${decision.toUpperCase()}`,
      task.title,
      'submission',
      `Feedback: ${feedback || 'None'}`
    );
  };

  // Daily Reports
  const createDailyReport = async (
    reportData: Omit<DailyReport, 'id' | 'createdAt' | 'userId' | 'userName' | 'userEmail' | 'userAvatar'>
  ): Promise<DailyReport> => {
    if (!currentUser) throw new Error('Not authenticated');

    const newReport: DailyReport = {
      ...reportData,
      id: `rep_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
    };

    setDailyReports((prev) => [newReport, ...prev]);
    if (db) setDoc(doc(db, 'dailyReports', newReport.id), newReport).catch((e) => console.warn('Report setDoc note:', e));

    // Add attachments to files
    if (reportData.attachments && reportData.attachments.length > 0) {
      reportData.attachments.forEach((file) => {
        if (db) setDoc(doc(db, 'files', file.id), file).catch((e) => console.warn('File setDoc note:', e));
      });
      setFiles((prev) => [...reportData.attachments, ...prev]);
    }

    // Notify Admin
    createNotification({
      userId: 'user_admin_michael',
      title: 'Daily Report Submitted',
      message: `${currentUser.displayName} submitted daily report for ${reportData.date}. Leads: ${reportData.leadsGenerated || 0}`,
      category: 'task',
      link: '/admin/reports',
    });

    logAuditAction('Daily Report Submitted', `Report for ${reportData.date}`, 'attendance', `By ${currentUser.displayName}`);
    return newReport;
  };

  // Files
  const uploadFile = async (
    fileData: Omit<AttachmentFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>
  ): Promise<AttachmentFile> => {
    const newFile: AttachmentFile = {
      ...fileData,
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      uploadedBy: currentUser?.id || 'system',
      uploadedByName: currentUser?.displayName || 'User',
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
    if (db) setDoc(doc(db, 'files', newFile.id), newFile).catch((e) => console.warn('File setDoc note:', e));
    logAuditAction('File Uploaded', newFile.name, 'file', `Size: ${(newFile.size / 1024).toFixed(1)} KB`);
    return newFile;
  };

  const deleteFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (db) deleteDoc(doc(db, 'files', fileId)).catch((e) => console.warn('File delete note:', e));
    logAuditAction('File Deleted', file?.name || fileId, 'file', 'Removed by user');
  };

  // Community
  const createCommunityPost = async (postData: {
    title: string;
    content: string;
    category: CommunityPost['category'];
    isPinned?: boolean;
    attachments?: AttachmentFile[];
  }): Promise<CommunityPost> => {
    if (!currentUser) throw new Error('Not logged in');

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      title: postData.title,
      content: postData.content,
      category: postData.category,
      isPinned: postData.isPinned || false,
      authorId: currentUser.id,
      authorName: currentUser.displayName || currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role,
      attachments: postData.attachments || [],
      likes: [],
      reactions: {},
      commentsCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    if (db) setDoc(doc(db, 'posts', newPost.id), newPost).catch((e) => console.warn('Post setDoc note:', e));

    // If it's an announcement, broadcast notification
    if (postData.category === 'Announcements') {
      createNotification({
        userId: 'all',
        title: `📢 Announcement: ${postData.title}`,
        message: postData.content.substring(0, 100) + '...',
        category: 'announcement',
        link: '/community',
      });
    }

    logAuditAction('Community Post Created', postData.title, 'community', `Category: ${postData.category}`);
    return newPost;
  };

  const togglePostUpvote = (postId: string) => {
    if (!currentUser) return;
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const upvotes = p.upvotes || [];
          const downvotes = p.downvotes || [];
          const hasUpvoted = upvotes.includes(currentUser.id);

          const newUpvotes = hasUpvoted
            ? upvotes.filter((id) => id !== currentUser.id)
            : [...upvotes, currentUser.id];
          const newDownvotes = downvotes.filter((id) => id !== currentUser.id);

          const updatedPost = { ...p, upvotes: newUpvotes, downvotes: newDownvotes };
          if (db) setDoc(doc(db, 'posts', p.id), updatedPost).catch((e) => console.warn(e));
          return updatedPost;
        }
        return p;
      })
    );
  };

  const togglePostDownvote = (postId: string) => {
    if (!currentUser) return;
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const upvotes = p.upvotes || [];
          const downvotes = p.downvotes || [];
          const hasDownvoted = downvotes.includes(currentUser.id);

          const newDownvotes = hasDownvoted
            ? downvotes.filter((id) => id !== currentUser.id)
            : [...downvotes, currentUser.id];
          const newUpvotes = upvotes.filter((id) => id !== currentUser.id);

          const updatedPost = { ...p, upvotes: newUpvotes, downvotes: newDownvotes };
          if (db) setDoc(doc(db, 'posts', p.id), updatedPost).catch((e) => console.warn(e));
          return updatedPost;
        }
        return p;
      })
    );
  };

  const togglePostLike = (postId: string) => {
    if (!currentUser) return;
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const liked = p.likes.includes(currentUser.id);
          const updatedLikes = liked ? p.likes.filter((id) => id !== currentUser.id) : [...p.likes, currentUser.id];
          const updatedPost = { ...p, likes: updatedLikes };
          if (db) setDoc(doc(db, 'posts', p.id), updatedPost).catch((e) => console.warn(e));
          return updatedPost;
        }
        return p;
      })
    );
  };

  const addPostReaction = (postId: string, emoji: string) => {
    if (!currentUser) return;
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const existing = (p.reactions && p.reactions[emoji]) || [];
          const hasReacted = existing.includes(currentUser.id);
          const updated = hasReacted ? existing.filter((id) => id !== currentUser.id) : [...existing, currentUser.id];
          const updatedPost = { ...p, reactions: { ...p.reactions, [emoji]: updated } };
          if (db) setDoc(doc(db, 'posts', p.id), updatedPost).catch((e) => console.warn(e));
          return updatedPost;
        }
        return p;
      })
    );
  };

  const addPostComment = (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const comment = {
      id: `comm_${Date.now()}`,
      postId,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
      userRole: currentUser.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedPost = {
            ...p,
            commentsCount: (p.commentsCount || p.comments.length) + 1,
            comments: [...(p.comments || []), comment],
          };
          if (db) setDoc(doc(db, 'posts', p.id), updatedPost).catch((e) => console.warn(e));
          return updatedPost;
        }
        return p;
      })
    );

    logAuditAction('Comment Added', `Post ${postId}`, 'community', `By ${currentUser.displayName}: "${content.substring(0, 40)}..."`);
  };

  const togglePinPost = (postId: string) => {
    if (!isAdmin) return;
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  // Learning & SOPs
  const createLearningResource = async (
    resourceData: Omit<LearningResource, 'id' | 'createdAt' | 'completedByUsers' | 'uploadedBy' | 'uploadedByName'>
  ): Promise<LearningResource> => {
    const newRes: LearningResource = {
      ...resourceData,
      id: `res_${Date.now()}`,
      completedByUsers: [],
      uploadedBy: currentUser?.id || 'admin',
      uploadedByName: currentUser?.displayName || 'Admin',
      createdAt: new Date().toISOString(),
    };
    setLearningResources((prev) => [newRes, ...prev]);
    logAuditAction('Learning Resource Published', newRes.title, 'settings', `Category: ${newRes.category}`);
    return newRes;
  };

  const toggleResourceCompleted = (resourceId: string) => {
    if (!currentUser) return;
    let resourceTitle = resourceId;
    setLearningResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          resourceTitle = r.title;
          const completed = r.completedByUsers.includes(currentUser.id);
          const updated = completed
            ? r.completedByUsers.filter((id) => id !== currentUser.id)
            : [...r.completedByUsers, currentUser.id];
          return { ...r, completedByUsers: updated };
        }
        return r;
      })
    );

    logAuditAction('Academy Progress Updated', resourceTitle, 'sop', `User ${currentUser.displayName} toggled completion.`);
  };

  const createSOP = async (sopData: Omit<SOPItem, 'id' | 'lastUpdated' | 'authorName'>): Promise<SOPItem> => {
    const newSOP: SOPItem = {
      ...sopData,
      id: `sop_${Date.now()}`,
      authorName: currentUser?.displayName || 'Michael Carter',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setSops((prev) => [newSOP, ...prev]);
    logAuditAction('SOP Created', newSOP.title, 'sop', `Version: ${newSOP.version}`);
    return newSOP;
  };

  const updateSOP = (sopId: string, updates: Partial<SOPItem>) => {
    setSops((prev) =>
      prev.map((s) => (s.id === sopId ? { ...s, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : s))
    );
    logAuditAction('SOP Updated', sopId, 'sop', 'Admin modified SOP');
  };

  const deleteSOP = (sopId: string) => {
    setSops((prev) => prev.filter((s) => s.id !== sopId));
  };

  // Calendar Events
  const createCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy'>): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal_${Date.now()}`,
      createdBy: currentUser?.id || 'admin',
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Notifications
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Settings
  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logAuditAction('System Settings Updated', 'Global Settings', 'settings', 'Updated system preferences');
  };

  const addCustomFieldTemplate = (name: string, category: string, fields: CustomFieldDefinition[]) => {
    setSettings((prev) => ({
      ...prev,
      customTaskTemplates: [...prev.customTaskTemplates, { name, category, fields }],
    }));
  };

  // Export Data Utilities
  const exportToCSV = (type: 'tasks' | 'attendance' | 'reports' | 'submissions') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `noryxa_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'tasks') {
      headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Assignees', 'Deadline', 'Created By', 'Created Date'];
      rows = tasks.map((t) => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        `"${t.assignedUserNames?.join(', ') || ''}"`,
        t.deadline || '',
        t.createdByName,
        t.createdAt,
      ]);
    } else if (type === 'attendance') {
      headers = ['Member', 'Date', 'Login Time', 'Status', 'Session (Mins)', 'Tasks Completed', 'Reports Submitted'];
      rows = attendanceRecords.map((a) => [
        `"${a.userName}"`,
        a.date,
        a.loginTime,
        a.status,
        String(a.durationMinutes),
        String(a.tasksCompletedCount),
        String(a.reportsSubmittedCount),
      ]);
    } else if (type === 'reports') {
      headers = ['Member', 'Date', 'Leads Found', 'Leads Contacted', 'Replies', 'Meetings', 'Tasks Worked On', 'Summary'];
      rows = dailyReports.map((r) => [
        `"${r.userName}"`,
        r.date,
        String(r.leadsGenerated),
        String(r.leadsContacted),
        String(r.repliesReceived),
        String(r.meetingsBooked),
        `"${r.tasksWorkedOn.join('; ')}"`,
        `"${r.completedTasksSummary.replace(/"/g, '""')}"`,
      ]);
    } else if (type === 'submissions') {
      headers = ['Task Title', 'Member', 'Submitted At', 'Status', 'Leads Found', 'Meetings', 'Google Sheet URL', 'Reviewer', 'Feedback'];
      const allSubmissions: WorkSubmission[] = [];
      tasks.forEach((t) => t.submissions.forEach((s) => allSubmissions.push(s)));
      rows = allSubmissions.map((s) => [
        `"${s.taskTitle}"`,
        `"${s.userName}"`,
        s.submittedAt,
        s.status,
        String(s.leadsFound || 0),
        String(s.meetingsBooked || 0),
        s.googleSheetUrl || '',
        s.reviewedByName || '',
        `"${(s.adminFeedback || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleChecklistItem,
        addTaskComment,
        submitWorkForReview,
        reviewSubmission,
        dailyReports,
        createDailyReport,
        attendanceRecords,
        files,
        uploadFile,
        deleteFile,
        communityPosts,
        createCommunityPost,
        togglePostLike,
        togglePostUpvote,
        togglePostDownvote,
        addPostReaction,
        addPostComment,
        togglePinPost,
        learningResources,
        createLearningResource,
        toggleResourceCompleted,
        toggleResourceCompletion: toggleResourceCompleted,
        sops,
        createSOP,
        updateSOP,
        deleteSOP,
        intelligenceItems,
        createIntelligenceItem,
        deleteIntelligenceItem,
        publishCentralContent,
        calendarEvents,
        createCalendarEvent,
        deleteCalendarEvent,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        createNotification,
        deleteNotification,
        auditLogs,
        logAuditAction,
        settings,
        updateSettings,
        addCustomFieldTemplate,
        searchQuery,
        setSearchQuery,
        exportToCSV,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
