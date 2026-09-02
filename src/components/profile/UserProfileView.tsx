import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import { UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import {
  User as UserIcon,
  Search,
  Upload,
  Copy,
  Check,
  Save,
  CheckCircle2,
  Users,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  Award,
  Sparkles,
  Shield,
  FileText,
  Clock,
  ChevronRight,
  Camera,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { currentUser, updateProfile, allUsers } = useAuth();
  const { dailyReports, tasks } = useData();

  // Tab State: 'my-profile' | 'team-directory'
  const [activeTab, setActiveTab] = useState<'my-profile' | 'team-directory'>('my-profile');

  // Form State for Own Profile
  const [displayName, setDisplayName] = useState(currentUser?.displayName || currentUser?.fullName || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [country, setCountry] = useState(currentUser?.country || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skillsStr, setSkillsStr] = useState((currentUser?.skills || []).join(', '));
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || '');
  const [github, setGithub] = useState(currentUser?.github || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter State for Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');

  // Selected Member for Profile Visitor Modal
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  if (!currentUser) return null;

  // Stats for current user
  const myReports = dailyReports.filter((r) => r.userId === currentUser.id);
  const totalLeads = myReports.reduce((sum, r) => sum + (r.leadsGenerated || 0), 0);
  const myTasks = tasks.filter((t) => t.assignedTo.includes(currentUser.id));
  const completedTasks = myTasks.filter(
    (t) => t.status === 'completed' || t.status === 'approved'
  ).length;

  // Handle uploading avatar from local device
  const handleDeviceAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        setAvatarUrl(result);
        updateProfile({ avatarUrl: result });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Copy User ID
  const handleCopyId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateProfile({
      displayName,
      fullName: displayName,
      jobTitle,
      department,
      phone,
      city,
      country,
      bio,
      skills: skillsArray,
      linkedin,
      github,
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Filter team members in directory
  const filteredMembers = (allUsers || []).filter((user) => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    // Match exact User ID, Name, Email, Job Title, or Department
    return (
      user.id.toLowerCase().includes(q) ||
      (user.fullName && user.fullName.toLowerCase().includes(q)) ||
      (user.displayName && user.displayName.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.jobTitle && user.jobTitle.toLowerCase().includes(q)) ||
      (user.department && user.department.toLowerCase().includes(q))
    );
  });

  // Calculate stats for visited member
  const getMemberStats = (memberId: string) => {
    const reports = dailyReports.filter((r) => r.userId === memberId);
    const leads = reports.reduce((sum, r) => sum + (r.leadsGenerated || 0), 0);
    const meetings = reports.reduce((sum, r) => sum + (r.meetingsBooked || 0), 0);
    const memberTasks = tasks.filter((t) => t.assignedTo.includes(memberId));
    const completed = memberTasks.filter(
      (t) => t.status === 'completed' || t.status === 'approved'
    ).length;

    return { leads, meetings, completedTasks: completed, totalTasks: memberTasks.length };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-[#0d1322]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-indigo-400" />
            Profile & Team Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize your personal profile, upload device pictures, or search and visit team member profiles using User IDs.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#11182c] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('my-profile')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my-profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('team-directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'team-directory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Directory & Search</span>
            <span className="px-2 py-0.5 text-[10px] bg-white/10 rounded-full font-mono">
              {(allUsers || []).length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: MY PROFILE & CUSTOMIZATION */}
      {activeTab === 'my-profile' && (
        <div className="space-y-6">
          {/* Top Profile Card */}
          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />

            <div className="flex items-center gap-5">
              {/* Avatar with local file upload overlay */}
              <div className="relative group">
                <UserAvatar
                  name={currentUser.displayName || currentUser.fullName}
                  avatarUrl={avatarUrl || currentUser.avatarUrl}
                  onlineStatus={currentUser.onlineStatus || 'online'}
                  size="xl"
                />

                <label
                  htmlFor="device-avatar-input"
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                  title="Upload picture from your device"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    id="device-avatar-input"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDeviceAvatarUpload}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white font-display">
                    {currentUser.displayName || currentUser.fullName}
                  </h2>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentUser.role}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {jobTitle || currentUser.jobTitle || 'Team Specialist'} • {department || currentUser.department || 'Operations'}
                </p>

                {/* User ID Tag with Copy Button */}
                <div className="pt-1 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#11182c] border border-white/10 rounded-lg text-xs font-mono text-cyan-300">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">User ID:</span>
                    <span>{currentUser.id}</span>
                  </div>

                  <button
                    onClick={() => handleCopyId(currentUser.id)}
                    className="p-1.5 bg-[#11182c] hover:bg-[#18223c] border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedId === currentUser.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>

                  <label
                    htmlFor="device-avatar-input-2"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Device Photo</span>
                    <input
                      type="file"
                      id="device-avatar-input-2"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDeviceAvatarUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Performance Stats Badges */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#11182c] rounded-xl border border-white/5 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Deliverables</span>
                <span className="text-lg font-extrabold text-white">{completedTasks}</span>
              </div>

              <div className="p-3 bg-[#11182c] rounded-xl border border-white/5 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Leads</span>
                <span className="text-lg font-extrabold text-white">{totalLeads}</span>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Profile information and custom avatar saved successfully!
            </div>
          )}

          {/* Edit Profile Form */}
          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-display border-b border-white/10 pb-3">
              Personal Information & Role Customization
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Full Name / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 bg-[#11182c]/50 border border-white/5 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Gen Specialist / Media Buyer"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Operations / Outreach"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                  About Me / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio, experience level, or goals..."
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                  Skills & Expertise (Comma Separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Lead Scraping, AI Prompting, Sales Closing, React, Cold Email"
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                    GitHub / Website URL
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
                  Avatar Image Link (Alternative to Local Device Upload)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM DIRECTORY & USER ID SEARCH */}
      {activeTab === 'team-directory' && (
        <div className="space-y-6">
          {/* Search Bar & Role Filter */}
          <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter User ID (e.g. usr_102...) or Name, Email, Department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Admins
              </button>

              <button
                onClick={() => setRoleFilter('member')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'member'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Members
              </button>
            </div>
          </div>

          {/* Members Cards Grid */}
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center bg-[#0d1322]/70 rounded-2xl border border-white/5 space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Team Member Found</h4>
              <p className="text-xs text-slate-400">
                Try searching with a different User ID or name.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const isSelf = member.id === currentUser.id;

                return (
                  <div
                    key={member.id}
                    className={`p-5 rounded-2xl bg-[#0d1322]/90 backdrop-blur-xl border transition-all shadow-xl space-y-4 hover:border-indigo-500/50 ${
                      isSelf ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={member.displayName || member.fullName}
                          avatarUrl={member.avatarUrl}
                          onlineStatus={member.onlineStatus || 'offline'}
                          size="lg"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{member.displayName || member.fullName}</h3>
                            {isSelf && (
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mt-1 inline-block">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                      <p className="font-medium text-slate-200">
                        {member.jobTitle || 'Team Specialist'} • {member.department || 'Operations'}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span className="truncate max-w-[170px]">{member.email}</span>

                        {/* User ID Tag */}
                        <div className="inline-flex items-center gap-1 bg-[#11182c] px-2 py-0.5 rounded border border-white/10 text-cyan-300 text-[10px]">
                          <span>ID: {member.id.substring(0, 8)}...</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId(member.id);
                            }}
                            className="hover:text-white"
                            title="Copy Full ID"
                          >
                            {copiedId === member.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-cyan-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMember(member)}
                      className="w-full py-2 bg-[#11182c] hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10 hover:border-indigo-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Visit Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MEMBER PROFILE VISITOR MODAL */}
      {selectedMember && (
        <Modal
          isOpen={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
          title={`Member Profile: ${selectedMember.displayName || selectedMember.fullName}`}
          maxWidth="max-w-2xl"
        >
          {(() => {
            const stats = getMemberStats(selectedMember.id);

            return (
              <div className="space-y-5">
                {/* Header */}
                <div className="p-4 bg-[#11182c] rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={selectedMember.displayName || selectedMember.fullName}
                      avatarUrl={selectedMember.avatarUrl}
                      onlineStatus={selectedMember.onlineStatus || 'offline'}
                      size="xl"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white font-display">
                          {selectedMember.displayName || selectedMember.fullName}
                        </h2>

                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {selectedMember.role}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-0.5">
                        {selectedMember.jobTitle || 'Team Specialist'} • {selectedMember.department || 'Operations'}
                      </p>

                      {/* User ID badge */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0d1322] border border-white/10 rounded-lg text-xs font-mono text-cyan-300">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">User ID:</span>
                          <span>{selectedMember.id}</span>
                        </div>

                        <button
                          onClick={() => handleCopyId(selectedMember.id)}
                          className="p-1 bg-[#0d1322] hover:bg-[#18223c] border border-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                          title="Copy Full ID"
                        >
                          {copiedId === selectedMember.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                    <span
                      className={`font-bold capitalize ${
                        selectedMember.onlineStatus === 'online'
                          ? 'text-emerald-400'
                          : selectedMember.onlineStatus === 'away'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      ● {selectedMember.onlineStatus || 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#11182c] rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Deliverables Completed</span>
                    <span className="text-base font-extrabold text-white font-mono">{stats.completedTasks}</span>
                  </div>

                  <div className="p-3 bg-[#11182c] rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Leads Generated</span>
                    <span className="text-base font-extrabold text-white font-mono">{stats.leads}</span>
                  </div>

                  <div className="p-3 bg-[#11182c] rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Meetings Booked</span>
                    <span className="text-base font-extrabold text-white font-mono">{stats.meetings}</span>
                  </div>
                </div>

                {/* About & Bio */}
                {selectedMember.bio && (
                  <div className="p-4 bg-[#11182c] rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bio / Summary</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Skills & Expertise</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="p-4 bg-[#11182c] rounded-xl border border-white/5 space-y-2 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Contact Information</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedMember.email}</span>
                    </div>

                    {selectedMember.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedMember.phone}</span>
                      </div>
                    )}

                    {(selectedMember.city || selectedMember.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {selectedMember.city}
                          {selectedMember.city && selectedMember.country ? ', ' : ''}
                          {selectedMember.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(selectedMember.linkedin || selectedMember.github) && (
                  <div className="flex gap-2">
                    {selectedMember.linkedin && (
                      <a
                        href={selectedMember.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#11182c] hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-all"
                      >
                        <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {selectedMember.github && (
                      <a
                        href={selectedMember.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#11182c] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-all"
                      >
                        <Github className="w-3.5 h-3.5 text-purple-400" />
                        <span>GitHub / Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
