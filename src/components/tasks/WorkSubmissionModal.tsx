import React, { useState } from 'react';
import { Task, AttachmentFile } from '../../types';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  UploadCloud,
  FileText,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  Table,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const WorkSubmissionModal: React.FC<WorkSubmissionModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { currentUser } = useAuth();
  const { submitWorkForReview, settings } = useData();

  const [summary, setSummary] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [notesForAdmin, setNotesForAdmin] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(task.googleSheetSyncUrl || '');

  // Metrics
  const [leadsFound, setLeadsFound] = useState<number>(0);
  const [leadsQualified, setLeadsQualified] = useState<number>(0);
  const [leadsContacted, setLeadsContacted] = useState<number>(0);
  const [repliesReceived, setRepliesReceived] = useState<number>(0);
  const [followupsSent, setFollowupsSent] = useState<number>(0);
  const [meetingsBooked, setMeetingsBooked] = useState<number>(0);
  const [successfulConversions, setSuccessfulConversions] = useState<number>(0);

  // Uploaded Proof Files
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle local file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setTimeout(() => {
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
      setUploading(false);
    }, 600);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide a brief summary of the work delivered.');
      return;
    }

    if (currentUser?.email !== 'michaelcarter893283@gmail.com') {
      setError('🔒 Read-Only Demo Mode: Work submission is disabled in Team UI Preview mode. Log in as Executive Admin to perform actions.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      submitWorkForReview(
        task.id,
        {
          summaryNotes: summary.trim(),
          googleSheetUrl: googleSheetUrl.trim(),
          leadsFound: Number(leadsFound) || 0,
          leadsQualified: Number(leadsQualified) || 0,
          leadsContacted: Number(leadsContacted) || 0,
          repliesReceived: Number(repliesReceived) || 0,
          followupsSent: Number(followupsSent) || 0,
          meetingsBooked: Number(meetingsBooked) || 0,
          successfulConversions: Number(successfulConversions) || 0,
          challengesFaced: challengesFaced.trim(),
          notesForAdmin: notesForAdmin.trim(),
          attachments,
        },
        'Submitted proof-of-work for administrative review.'
      );

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Proof-of-Work Deliverable"
      subtitle={`Task: ${task.title}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Deliverable Summary */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Delivery Summary & Output Description *
          </label>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarize what has been accomplished, verified lead list stats, target company niches..."
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Live Sheet Proof URL */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Google Sheets Proof Link / Deliverable URL
          </label>
          <div className="relative">
            <Table className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quantitative Lead Output Metrics */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 font-display">
            Quantitative Output Counters (Verified Stats)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#11182c]/60 p-4 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Leads Found
              </span>
              <input
                type="number"
                min={0}
                value={leadsFound}
                onChange={(e) => setLeadsFound(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#11182c] border border-white/10 rounded-lg text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Qualified ICP
              </span>
              <input
                type="number"
                min={0}
                value={leadsQualified}
                onChange={(e) => setLeadsQualified(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#11182c] border border-white/10 rounded-lg text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
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
                className="w-full px-2.5 py-1.5 bg-[#11182c] border border-white/10 rounded-lg text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
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
                className="w-full px-2.5 py-1.5 bg-[#11182c] border border-white/10 rounded-lg text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Upload Proof Files */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Upload Proof Files (Screenshots, CSVs, Exports)
          </label>
          <div className="p-4 bg-[#11182c]/40 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-indigo-500/40 transition-colors">
            <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
            <p className="text-xs text-slate-300 font-semibold">Drop files here or click to select</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Supports CSV, XLSX, PNG, JPG, PDF (Max 25MB)</p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="proof-file-input"
            />
            <label
              htmlFor="proof-file-input"
              className="inline-block mt-2 px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Select Local Files
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-[#11182c] border border-white/5 rounded-xl text-xs text-slate-200">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenges & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Challenges or Blockers Encountered
            </label>
            <textarea
              rows={2}
              value={challengesFaced}
              onChange={(e) => setChallengesFaced(e.target.value)}
              placeholder="e.g. Apollo export limit reached, had to use manual search..."
              className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Private Note for Agency Admin
            </label>
            <textarea
              rows={2}
              value={notesForAdmin}
              onChange={(e) => setNotesForAdmin(e.target.value)}
              placeholder="Questions or comments for the reviewer..."
              className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting Deliverable...' : 'Submit for Admin Audit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
