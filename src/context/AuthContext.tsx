import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from '../lib/firebase';
import { UserProfile, UserRole, OnlineStatus } from '../types';
import { INITIAL_USERS, INITIAL_ADMIN_EMAIL } from '../data/initialData';

interface AttendanceSession {
  isActive: boolean;
  startTime: string | null;
  secondsElapsed: number;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  attendanceSession: AttendanceSession;
  login: (email: string, password?: string) => Promise<void>;
  registerUser: (
    email: string,
    password?: string,
    fullName?: string,
    role?: UserRole,
    department?: string,
    jobTitle?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoUser: (userId: string) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<void>;
  completeOnboarding: (profileData: Partial<UserProfile>) => void;
  setOnlineStatus: (status: OnlineStatus) => void;
  startAttendanceSession: () => void;
  pauseAttendanceSession: () => void;
  stopAttendanceSession: () => void;
  allUsers: UserProfile[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'noryxa_users_v6';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'noryxa_current_user_id_v6';
const LOCAL_STORAGE_SESSION_KEY = 'noryxa_attendance_session_v6';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  // Always-fresh ref for use in Firebase callbacks (avoids stale closures)
  const usersRef = useRef<UserProfile[]>(INITIAL_USERS);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (!saved || saved === 'null' || saved === '') return null;
    return saved;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Attendance session timer
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { isActive: true, startTime: new Date().toISOString(), secondsElapsed: 1420 };
      }
    }
    return { isActive: true, startTime: new Date().toISOString(), secondsElapsed: 1420 };
  });

  // Migration: Fix stale admin email in localStorage if present
  useEffect(() => {
    const savedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (savedUsers) {
      try {
        const parsed: UserProfile[] = JSON.parse(savedUsers);
        const needsMigration = parsed.some(
          (u) => u.email === 'michaelcarter893283@gmail.com'
        );
        if (needsMigration) {
          const migrated = parsed.map((u) =>
            u.email === 'michaelcarter893283@gmail.com'
              ? { ...u, email: 'moiz.noryxa@gmail.com', role: 'admin' as const }
              : u
          );
          localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(migrated));
          setUsers(migrated);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);


  // Save current user ID
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, currentUserId);
    } else {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, 'null');
    }
  }, [currentUserId]);

  // Real-time Firestore Users Listener
  useEffect(() => {
    const path = 'users';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserProfile;
            remoteUsers.push({
              ...data,
              id: docSnap.id || data.id,
            });
          });

          setUsers((prev) => {
            const userMap = new Map<string, UserProfile>();
            INITIAL_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));
            prev.forEach((u) => userMap.set(u.email.toLowerCase(), u));
            remoteUsers.forEach((u) => userMap.set(u.email.toLowerCase(), u));
            return Array.from(userMap.values());
          });
        }
      },
      (error) => {
        console.warn('Firestore user snapshot notice:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();
        // Use ref to get the latest users list (avoids stale closure)
        const existing = usersRef.current.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          setCurrentUserId(existing.id);
          try {
            await updateDoc(doc(db, 'users', existing.id), {
              onlineStatus: 'online',
              lastLoginAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            });
          } catch {
            // ignore
          }
        } else {
          const isAdminUser = cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase();
          const newUserId = `user_${Date.now()}`;
          const newUser: UserProfile = {
            id: newUserId,
            uid: fbUser.uid,
            email: cleanEmail,
            fullName: fbUser.displayName || cleanEmail.split('@')[0],
            displayName: fbUser.displayName || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            role: isAdminUser ? 'admin' : 'member',
            status: 'active',
            onlineStatus: 'online',
            authProvider: 'google',
            avatarUrl: fbUser.photoURL || undefined,
            jobTitle: isAdminUser ? 'Managing Director & Agency Lead' : 'Campaign Specialist',
            department: isAdminUser ? 'Management' : 'Lead Generation',
            skills: ['Outbound', 'Communication', 'Research'],
            isOnboarded: true,
            lastActiveAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUsers((prev) => [newUser, ...prev]);
          setCurrentUserId(newUserId);

          try {
            await setDoc(doc(db, 'users', newUserId), newUser);
          } catch (err) {
            console.warn('Failed to save Google user to Firestore:', err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Presence / Heartbeat system
  useEffect(() => {
    if (!currentUserId) return;

    const heartbeatInterval = setInterval(async () => {
      const nowStr = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUserId ? { ...u, onlineStatus: 'online', lastActiveAt: nowStr } : u))
      );

      try {
        await updateDoc(doc(db, 'users', currentUserId), {
          onlineStatus: 'online',
          lastActiveAt: nowStr,
        });
      } catch {
        // ignore
      }
    }, 30000);

    const handleBeforeUnload = async () => {
      const nowStr = new Date().toISOString();
      try {
        await updateDoc(doc(db, 'users', currentUserId), {
          onlineStatus: 'offline',
          lastActiveAt: nowStr,
        });
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUserId]);

  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;
  const isAdmin = currentUser
    ? currentUser.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase() && currentUser.role === 'admin'
    : false;
  const isMember = currentUser ? !isAdmin : false;

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        throw new Error('Please enter your email address.');
      }

      const isAdminEmail = cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase();

      if (isAdminEmail) {
        if (!password || password !== 'moiz@7222') {
          throw new Error('Invalid email or password. Admin login requires password: moiz@7222');
        }
      } else {
        if (!password || password.length < 6) {
          throw new Error('Invalid email or password.');
        }
      }

      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!matched) {
        throw new Error('No account found with this email. Please register first.');
      }

      const updatedRole = isAdminEmail ? 'admin' : matched.role || 'member';
      const nowStr = new Date().toISOString();

      setCurrentUserId(matched.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === matched.id
            ? {
                ...u,
                role: updatedRole,
                onlineStatus: 'online',
                lastLoginAt: nowStr,
                lastActiveAt: nowStr,
              }
            : u
        )
      );

      setAttendanceSession({
        isActive: true,
        startTime: nowStr,
        secondsElapsed: 0,
      });

      try {
        await updateDoc(doc(db, 'users', matched.id), {
          role: updatedRole,
          onlineStatus: 'online',
          lastLoginAt: nowStr,
          lastActiveAt: nowStr,
        });
      } catch (err) {
        console.warn('Could not update Firestore user on login:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (
    email: string,
    password?: string,
    fullName?: string,
    role: UserRole = 'member',
    department: string = 'Lead Generation',
    jobTitle: string = 'Campaign Specialist'
  ) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const isAdminEmail = cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase();
      if (isAdminEmail && password !== 'moiz@7222') {
        throw new Error('Access Denied! Admin registration requires password: moiz@7222');
      }

      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      const name = fullName?.trim() || cleanEmail.split('@')[0];
      const newUserId = `user_${Date.now()}`;
      const nowStr = new Date().toISOString();

      const newUser: UserProfile = {
        id: newUserId,
        uid: `local_${Date.now()}`,
        email: cleanEmail,
        fullName: name,
        displayName: name,
        username: cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        role: isAdminEmail ? 'admin' : role,
        status: 'active',
        onlineStatus: 'online',
        authProvider: 'email',
        jobTitle: isAdminEmail ? 'Managing Director & Agency Lead' : jobTitle,
        department: isAdminEmail ? 'Management' : department,
        skills: ['Outbound', 'Lead Generation', 'Client Delivery'],
        isOnboarded: true,
        lastActiveAt: nowStr,
        lastLoginAt: nowStr,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUserId(newUserId);
      setAttendanceSession({
        isActive: true,
        startTime: nowStr,
        secondsElapsed: 0,
      });

      try {
        await setDoc(doc(db, 'users', newUserId), newUser);
        const auditLogDoc = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          action: 'New Member Registered',
          actorId: newUserId,
          actorName: name,
          actorRole: newUser.role,
          userName: name,
          target: name,
          targetType: 'user',
          details: `Registered email: ${cleanEmail}, Role: ${newUser.role}, Dept: ${newUser.department}`,
          severity: 'info',
          timestamp: nowStr,
        };
        await setDoc(doc(db, 'auditLogs', auditLogDoc.id), auditLogDoc);
      } catch (err) {
        console.warn('Firestore user save warning:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;

      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();
        const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
        const nowStr = new Date().toISOString();

        if (existing) {
          setCurrentUserId(existing.id);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === existing.id
                ? {
                    ...u,
                    onlineStatus: 'online',
                    lastLoginAt: nowStr,
                    lastActiveAt: nowStr,
                    avatarUrl: fbUser.photoURL || u.avatarUrl,
                  }
                : u
            )
          );

          try {
            await updateDoc(doc(db, 'users', existing.id), {
              onlineStatus: 'online',
              lastLoginAt: nowStr,
              lastActiveAt: nowStr,
            });
          } catch {
            // fallback
          }
        } else {
          const isAdminUser = cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase();
          const newUserId = `user_${Date.now()}`;
          const newUser: UserProfile = {
            id: newUserId,
            uid: fbUser.uid,
            email: cleanEmail,
            fullName: fbUser.displayName || cleanEmail.split('@')[0],
            displayName: fbUser.displayName || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            role: isAdminUser ? 'admin' : 'member',
            status: 'active',
            onlineStatus: 'online',
            authProvider: 'google',
            avatarUrl: fbUser.photoURL || undefined,
            jobTitle: isAdminUser ? 'Managing Director & Agency Lead' : 'Campaign Specialist',
            department: isAdminUser ? 'Management' : 'Lead Generation',
            skills: ['Outbound', 'Research', 'Communication'],
            isOnboarded: true,
            lastActiveAt: nowStr,
            lastLoginAt: nowStr,
            createdAt: nowStr,
            updatedAt: nowStr,
          };

          setUsers((prev) => [newUser, ...prev]);
          setCurrentUserId(newUserId);
          setAttendanceSession({
            isActive: true,
            startTime: nowStr,
            secondsElapsed: 0,
          });

          try {
            await setDoc(doc(db, 'users', newUserId), newUser);
          } catch (err) {
            console.warn('Failed to save Google user:', err);
          }
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      const nowStr = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                onlineStatus: 'online',
                lastLoginAt: nowStr,
                lastActiveAt: nowStr,
              }
            : u
        )
      );
      setAttendanceSession({
        isActive: true,
        startTime: nowStr,
        secondsElapsed: 0,
      });
    }
  };

  const logout = async () => {
    try {
      const nowStr = new Date().toISOString();
      if (currentUserId) {
        setUsers((prev) =>
          prev.map((u) => (u.id === currentUserId ? { ...u, onlineStatus: 'offline', lastActiveAt: nowStr } : u))
        );
        try {
          await updateDoc(doc(db, 'users', currentUserId), {
            onlineStatus: 'offline',
            lastActiveAt: nowStr,
          });
        } catch {
          // fallback
        }
      }
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
      setCurrentUserId(null);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, 'null');
      setAttendanceSession((prev) => ({ ...prev, isActive: false }));
    } catch (err) {
      console.error('Logout error:', err);
      setCurrentUserId(null);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, 'null');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const nowStr = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates, updatedAt: nowStr } : u))
    );
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        ...updates,
        updatedAt: nowStr,
      });
      const auditLogDoc = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action: 'Member Profile Updated',
        actorId: currentUser.id,
        actorName: currentUser.displayName || currentUser.fullName,
        actorRole: currentUser.role,
        userName: currentUser.displayName || currentUser.fullName,
        target: currentUser.displayName || currentUser.fullName,
        targetType: 'user',
        details: `Updated attributes: ${Object.keys(updates).join(', ')}`,
        severity: 'info',
        timestamp: nowStr,
      };
      await setDoc(doc(db, 'auditLogs', auditLogDoc.id), auditLogDoc).catch(() => {});
    } catch (err) {
      console.warn('Update profile firestore warning:', err);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const nowStr = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, updatedAt: nowStr } : u))
    );
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: nowStr,
      });
    } catch (err) {
      console.warn('Update role firestore error:', err);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const nowStr = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus, updatedAt: nowStr } : u))
    );
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: nowStr,
      });
    } catch (err) {
      console.warn('Toggle status firestore error:', err);
    }
  };

  const resetUserPassword = async (userId: string) => {
    console.log(`Password reset requested for user: ${userId}`);
  };

  const completeOnboarding = (profileData: Partial<UserProfile>) => {
    if (!currentUser) return;
    updateProfile({ ...profileData, isOnboarded: true });
  };

  const setOnlineStatus = async (status: OnlineStatus) => {
    if (!currentUser) return;
    const nowStr = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, onlineStatus: status, lastActiveAt: nowStr } : u))
    );
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        onlineStatus: status,
        lastActiveAt: nowStr,
      });
      const auditLogDoc = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action: `Status Changed: ${status.toUpperCase()}`,
        actorId: currentUser.id,
        actorName: currentUser.displayName || currentUser.fullName,
        actorRole: currentUser.role,
        userName: currentUser.displayName || currentUser.fullName,
        target: currentUser.displayName || currentUser.fullName,
        targetType: 'user',
        details: `Online status updated to ${status}`,
        severity: 'info',
        timestamp: nowStr,
      };
      await setDoc(doc(db, 'auditLogs', auditLogDoc.id), auditLogDoc).catch(() => {});
    } catch {
      // ignore
    }
  };

  const startAttendanceSession = async () => {
    const nowStr = new Date().toISOString();
    setAttendanceSession({
      isActive: true,
      startTime: nowStr,
      secondsElapsed: attendanceSession.secondsElapsed,
    });
    if (currentUser) {
      const auditLogDoc = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action: 'Shift Session Started',
        actorId: currentUser.id,
        actorName: currentUser.displayName || currentUser.fullName,
        actorRole: currentUser.role,
        userName: currentUser.displayName || currentUser.fullName,
        target: currentUser.displayName || currentUser.fullName,
        targetType: 'attendance',
        details: `Shift clocked in at ${new Date(nowStr).toLocaleTimeString()}`,
        severity: 'info',
        timestamp: nowStr,
      };
      await setDoc(doc(db, 'auditLogs', auditLogDoc.id), auditLogDoc).catch(() => {});
    }
  };

  const pauseAttendanceSession = async () => {
    const nowStr = new Date().toISOString();
    setAttendanceSession((prev) => ({
      ...prev,
      isActive: false,
    }));
    if (currentUser) {
      const auditLogDoc = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action: 'Shift Session Paused',
        actorId: currentUser.id,
        actorName: currentUser.displayName || currentUser.fullName,
        actorRole: currentUser.role,
        userName: currentUser.displayName || currentUser.fullName,
        target: currentUser.displayName || currentUser.fullName,
        targetType: 'attendance',
        details: `Shift timer paused at ${new Date(nowStr).toLocaleTimeString()}`,
        severity: 'info',
        timestamp: nowStr,
      };
      await setDoc(doc(db, 'auditLogs', auditLogDoc.id), auditLogDoc).catch(() => {});
    }
  };

  const stopAttendanceSession = () => {
    setAttendanceSession({
      isActive: false,
      startTime: null,
      secondsElapsed: 0,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin,
        isMember,
        attendanceSession,
        login,
        registerUser,
        signInWithGoogle,
        loginAsDemoUser,
        logout,
        updateProfile,
        updateUserRole,
        toggleUserStatus,
        resetUserPassword,
        completeOnboarding,
        setOnlineStatus,
        startAttendanceSession,
        pauseAttendanceSession,
        stopAttendanceSession,
        allUsers: users,
        setAllUsers: setUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
