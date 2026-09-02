import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttachmentFile } from '../../types';
import {
  FileCheck,
  Table,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  Send,
  Trash2
} from 'lucide-react';

export const DailyReportForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const { tasks, createDailyReport, dailyReports } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  const userTasks = tasks.filter((t) => currentUser && t.assignedTo.includes(currentUser.id));
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    userTasks.map((t) => t.title).slice(0, 2)
  );

  // Metrics
  const [leadsGenerated, setLeadsGenerated] = useState<number>(0);
  const [leadsContacted, setLeadsContacted] = useState<number>(0);
  const [repliesReceived, setRepliesReceived] = useState<number>(0);
  const [followupsSent, setFollowupsSent] = useState<number>(0);
  const [meetingsBooked, setMeetingsBooked] = useState<number>(0);
  const [successfulConversions, setSuccessfulConversions] = useState<number>(0);

  const [completedTasksSummary, setCompletedTasksSummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleTaskSelection = (taskTitle: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskTitle) ? prev.filter((t) => t !== taskTitle) : [...prev, taskTitle]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachmentFile[] = Array.from(files).map((f: File) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      uploadedBy: currentUser?.id || 'member',
      uploadedByName: currentUser?.displayName || 'Specialist',
      uploadedAt: new Date().toISOString(),
    }));

    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedTasksSummary.trim()) {
      setError('Please provide a brief summary of tasks accomplished today.');
      return;
    }

    if (currentUser?.email !== 'michaelcarter893283@gmail.com') {
      setError('🔒 Read-Only Demo Mode: Form submissions are locked in Team UI Preview mode. Log in as Executive Admin to submit real reports.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      createDailyReport({
        date,
        tasksCompleted: selectedTasks,
        completedTasksSummary: completedTasksSummary.trim(),
        leadsGenerated: Number(leadsGenerated) || 0,
        leadsContacted: Number(leadsContacted) || 0,
        repliesReceived: Number(repliesReceived) || 0,
        followupsSent: Number(followupsSent) || 0,
        meetingsBooked: Number(meetingsBooked) || 0,
        successfulConversions: Number(successfulConversions) || 0,
        challenges: challenges.trim(),
        additionalNotes: additionalNotes.trim(),
        googleSheetUrl: googleSheetUrl.trim(),
        attachments,
      });

      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit daily report');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl border border-emerald-500/30 space-y-4 max-w-2xl mx-auto shadow-2xl shadow-black/50">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-display">
          Daily Work Report Logged
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Your daily metrics and verified deliverable stats have been synchronized with the Operations Command Center.
        </p>
        <button
          onClick={() => setSubmittedSuccess(false)}
          className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Submit Another Entry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/50 space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
            End of Day Briefing
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
          Submit Daily Performance & Work Report
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Log verified lead generation output, contacts reached, and deliverables completed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Date Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Reporting Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Google Sheet Verification Link
            </label>
            <input
              type="url"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quantitative Metrics Section */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 font-display">
            Daily Output Metrics
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-[#11182c]/70 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Leads Found
              </span>
              <input
                type="number"
                min={0}
                value={leadsGenerated}
                onChange={(e) => setLeadsGenerated(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Outreach Sent
              </span>
              <input
                type="number"
                min={0}
                value={leadsContacted}
                onChange={(e) => setLeadsContacted(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Replies In
              </span>
              <input
                type="number"
                min={0}
                value={repliesReceived}
                onChange={(e) => setRepliesReceived(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Follow-ups
              </span>
              <input
                type="number"
                min={0}
                value={followupsSent}
                onChange={(e) => setFollowupsSent(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Calls Booked
              </span>
              <input
                type="number"
                min={0}
                value={meetingsBooked}
                onChange={(e) => setMeetingsBooked(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Deals Closed
              </span>
              <input
                type="number"
                min={0}
                value={successfulConversions}
                onChange={(e) => setSuccessfulConversions(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Work Summary */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Detailed Summary of Tasks Executed Today *
          </label>
          <textarea
            required
            rows={4}
            value={completedTasksSummary}
            onChange={(e) => setCompletedTasksSummary(e.target.value)}
            placeholder="Detailed narrative of campaigns launched, lists verified, filters applied, and progress made..."
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Challenges & Blockers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Challenges or Blockers
            </label>
            <textarea
              rows={2}
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Any technical bugs or data quality issues..."
              className="w-full px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Plans for Tomorrow / Notes
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Target accounts or tasks to resume..."
              className="w-full px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Attach Proof Files (CSVs, Screenshots)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />

          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-2 bg-[#11182c] rounded-lg text-xs text-slate-300">
                  <span>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter((a) => a.id !== f.id))}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Report...' : 'Submit Official Daily Work Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
