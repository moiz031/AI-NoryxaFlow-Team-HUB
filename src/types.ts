export type UserRole = 'admin' | 'member';

export type UserStatus = 'active' | 'inactive' | 'pending';

export type OnlineStatus = 'online' | 'away' | 'offline';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'waiting_for_review'
  | 'revision_required'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 'overdue';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  displayName: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  onlineStatus: OnlineStatus;
  authProvider?: 'email' | 'google';
  isActive?: boolean;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  city?: string;
  country?: string;
  timezone?: string;
  phone?: string;
  whatsapp?: string;
  emergencyContact?: string;
  jobTitle: string;
  department: string;
  skills: string[];
  experienceLevel?: string;
  yearsOfExperience?: number;
  bio?: string;
  areasOfExpertise?: string;
  preferredWorkType?: 'full_time' | 'part_time' | 'contract' | 'freelance';
  linkedin?: string;
  github?: string;
  portfolioWebsite?: string;
  otherLinks?: string[];
  completedResources?: string[];
  isOnboarded: boolean;
  lastActiveAt: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export type User = UserProfile;


export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  taskId?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface TaskTimelineEvent {
  id: string;
  taskId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'url' | 'file' | 'textarea';
  required?: boolean;
  options?: string[]; // for select
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  label: string;
  value: string | number | boolean;
}

export interface WorkSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'revision_requested' | 'rejected';
  summary: string;
  challengesFaced?: string;
  notesForAdmin?: string;
  
  // Structured metrics
  leadsFound?: number;
  leadsQualified?: number;
  leadsContacted?: number;
  repliesReceived?: number;
  followupsSent?: number;
  meetingsBooked?: number;
  successfulConversions?: number;
  
  // Custom form metrics
  customFields?: CustomFieldValue[];
  
  // Proofs
  attachments: AttachmentFile[];
  googleSheetUrl?: string;
  proofLinks?: string[];
  
  // Admin Review Data
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  adminFeedback?: string;
  revisionCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  detailedInstructions: string;
  assignedTo: string[]; // array of user IDs
  assignedUserNames?: string[];
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  deadline: string;
  originalDeadline?: string;
  estimatedHours?: number;
  checklist: ChecklistItem[];
  attachments: AttachmentFile[];
  referenceLinks: string[];
  notes?: string;
  customSubmissionFields?: CustomFieldDefinition[];
  googleSheetSyncUrl?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Submissions history
  submissions: WorkSubmission[];
  comments: TaskComment[];
  timeline: TaskTimelineEvent[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  date: string; // YYYY-MM-DD
  loginTime: string;
  logoutTime?: string;
  lastActiveTime: string;
  status: 'active' | 'completed' | 'auto_closed';
  durationMinutes: number;
  tasksCompletedCount: number;
  reportsSubmittedCount: number;
}

export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  date: string; // YYYY-MM-DD
  tasksWorkedOn: string[];
  leadsGenerated: number;
  leadsContacted: number;
  repliesReceived: number;
  followupsSent: number;
  meetingsBooked: number;
  successfulConversions: number;
  completedTasksSummary: string;
  challenges: string;
  additionalNotes?: string;
  proofLinks: string[];
  attachments: AttachmentFile[];
  googleSheetUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // recipient user ID or 'all' or 'admin'
  senderUserId?: string;
  senderName?: string;
  title: string;
  message: string;
  category: 'task' | 'review' | 'announcement' | 'learning' | 'community' | 'intelligence' | 'video' | 'agency_feed' | 'system';
  section?: 'feed' | 'community' | 'academy' | 'intelligence' | 'tasks' | 'announcements' | 'resources' | 'videos';
  relatedContentId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  section?: 'agency_feed' | 'community';
  title: string;
  content: string;
  category: 'General' | 'Work' | 'Questions' | 'Learning' | 'Resources' | 'Announcements' | 'Wins & Achievements' | 'News' | 'Agency Updates' | 'Instructions' | 'AI Masterclass' | 'Instructors';
  isPinned?: boolean;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  attachments?: AttachmentFile[];
  likes: string[]; // user IDs who liked
  upvotes?: string[]; // user IDs who upvoted
  downvotes?: string[]; // user IDs who downvoted
  reactions?: Record<string, string[]>; // reaction emoji -> user IDs
  commentsCount: number;
  comments: CommunityComment[];
  targetAudience?: string; // 'all' or user IDs
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category: 'Lead Generation' | 'Sales' | 'Communication' | 'AI Tools' | 'Productivity' | 'Company SOPs' | 'Training' | 'Other' | 'Outreach & Sales' | 'AI Tools & Automation' | 'SOPs & Workflows' | 'Client Communication' | 'AI Masterclass' | 'Direct Lessons';
  type: 'video' | 'pdf' | 'image' | 'document' | 'link' | 'guide' | 'checklist' | 'quiz' | 'test';
  contentUrl?: string;
  contentBody?: string;
  content?: string;
  estimatedReadTimeMinutes?: number;
  estimatedMinutes?: number;
  videoUrl?: string;
  imageUrl?: string;
  testInstructions?: string;
  quizQuestions?: QuizQuestion[];
  passingScorePercent?: number;
  checklistItems?: string[];
  uploadedBy: string;
  uploadedByName: string;
  completedByUsers: string[]; // user IDs
  createdAt: string;
  order?: number;
}

export interface IntelligenceItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'AI Insights' | 'Market Intelligence' | 'Industry Trends' | 'Strategy & Reports' | 'AI Tools & Workflows' | 'Research';
  tags: string[];
  keyTakeaways?: string[];
  reportUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SOPDocument {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  steps: (string | { stepNumber: number; title: string; description?: string })[];
  dos?: string[];
  donts?: string[];
  doAndDonts?: { dos: string[]; donts: string[] };
  version: string;
  authorName?: string;
  updatedByName?: string;
  updatedAt?: string;
  lastUpdated?: string;
  tags?: string[];
  relatedLinks?: { title: string; url: string }[];
}

export type SOPItem = SOPDocument;


export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  allDay?: boolean;
  type: 'task_deadline' | 'meeting' | 'training' | 'announcement' | 'holiday';
  relatedId?: string; // taskId or resourceId
  assignedTo?: string[];
  createdBy: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  target: string;
  targetType: 'task' | 'user' | 'submission' | 'file' | 'settings' | 'community' | 'sop' | 'attendance' | 'auth';
  details: string;
  severity?: 'info' | 'warning' | 'critical';
  userName?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  companyName: string;
  productName: string;
  logoUrl?: string;
  primaryColor: string;
  adminEmail: string;
  timezone: string;
  allowUserSelfSignup: boolean;
  requireAdminApproval: boolean;
  taskCategories: string[];
  taskStatuses: string[];
  emailNotificationsEnabled: boolean;
  emailProvider: 'smtp' | 'resend' | 'sendgrid' | 'simulated';
  smtpHost?: string;
  smtpPort?: number;
  googleSheetsSyncEnabled: boolean;
  defaultGoogleSheetUrl?: string;
  reminderHours: number[];
  customTaskTemplates: {
    name: string;
    category: string;
    fields: CustomFieldDefinition[];
  }[];
}
