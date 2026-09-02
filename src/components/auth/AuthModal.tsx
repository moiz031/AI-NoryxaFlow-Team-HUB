import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Shield,
  Key,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Target,
  Palette
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, registerUser, signInWithGoogle } = useAuth();
  const { theme, setTheme, allThemes } = useTheme();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (isRegister) {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(cleanEmail, password, displayName, selectedRole);
      } else {
        await login(cleanEmail, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, pwd?: string) => {
    setError('');
    setLoading(true);
    try {
      await login(userEmail, pwd);
    } catch (err: any) {
      setError(err?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed or popup was closed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] text-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Quick Selector at Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 bg-[#0d1322]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl">
        <Palette className="w-4 h-4 text-indigo-400 ml-1.5" />
        <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">Theme:</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="bg-[#11182c] border border-white/10 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
        >
          {allThemes.map((t) => (
            <option key={t.id} value={t.id} className="bg-[#0b0f19] text-white">
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Branding & Hero Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 mb-1">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Zap className="w-7 h-7 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            NORYXA TEAM HUB
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
            High-Performance Lead Generation & Agency Operations Operating System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/80 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Switcher */}
          <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-Click Portal Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('michaelcarter893283@gmail.com', 'moiz@7222')}
                disabled={loading}
                className="p-3 bg-gradient-to-br from-[#161f38] to-[#0f1629] hover:from-indigo-900/40 hover:to-indigo-950/60 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-left transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
                    Executive Admin
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400">Full Access Control Center</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.khan@noryxa.internal', 'member123')}
                disabled={loading}
                className="p-3 bg-gradient-to-br from-[#161f38] to-[#0f1629] hover:from-cyan-900/40 hover:to-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-left transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    Team Specialist
                  </span>
                  <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    Team Member
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Operations & Daily Reports Portal</p>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                !isRegister
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                isRegister
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('member')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'member'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-[#11182c] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'admin'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-[#11182c] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Agency Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@noryxa.agency"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#11182c] border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#11182c] border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#11182c] border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating...' : isRegister ? 'Create Account & Enter Portal' : 'Enter Agency Portal'}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0d1322] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              Or Connect With
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-[#11182c] hover:bg-[#161f38] border border-white/10 hover:border-white/20 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign In with Google Account
          </button>
        </div>

        {/* Security & System Info Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            256-Bit Encrypted Portal
          </span>
          <span>NORYXA OS v6.2 Enterprise</span>
        </div>
      </div>
    </div>
  );
};
