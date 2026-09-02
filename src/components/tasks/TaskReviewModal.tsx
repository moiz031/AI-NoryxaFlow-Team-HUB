import React, { useState } from 'react';
import { Task, WorkSubmission } from '../../types';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  Table,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  submission: WorkSubmission;
}

export const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  submission,
}) => {
  const { reviewSubmission } = useData();

  const [decision, setDecision] = useState<'approve' | 'revision' | 'reject'>('approve');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'revision' && !feedback.trim()) {
      setError('Please provide specific feedback explaining what needs revision.');
      return;
    }

    setSubmitting(true);
    try {
      reviewSubmission(task.id, submission.id, decision, feedback.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Work Review & Audit"
      subtitle={`Submission by ${submission.submittedByName || 'Specialist'} • Task: ${task.title}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleReviewSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Deliverable Review Details Card */}
        <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">
                {submission.submittedByName || 'Specialist'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Submitted: {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>

          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Deliverable Summary Notes
            </h5>
            <p className="text-xs text-slate-200 bg-black/25 p-3 rounded-lg border border-white/5 whitespace-pre-line font-medium">
              {submission.summaryNotes}
            </p>
          </div>

          {/* Quantitative Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 bg-black/30 rounded-lg text-center border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Leads Found</span>
              <p className="text-sm font-extrabold text-white">{submission.leadsFound || 0}</p>
            </div>
            <div className="p-2.5 bg-black/30 rounded-lg text-center border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Qualified ICP</span>
              <p className="text-sm font-extrabold text-white">{submission.leadsQualified || 0}</p>
            </div>
            <div className="p-2.5 bg-black/30 rounded-lg text-center border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Contacted</span>
              <p className="text-sm font-extrabold text-white">{submission.leadsContacted || 0}</p>
            </div>
            <div className="p-2.5 bg-black/30 rounded-lg text-center border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Calls Booked</span>
              <p className="text-sm font-extrabold text-white">{submission.meetingsBooked || 0}</p>
            </div>
          </div>

          {/* External Links */}
          {submission.googleSheetUrl && (
            <div className="pt-2">
              <a
                href={submission.googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                <Table className="w-3.5 h-3.5" />
                Open Verified Google Sheet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Audit Decision Selection */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 font-display">
            Audit Verdict & Status Update *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDecision('approve')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                decision === 'approve'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#11182c] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Complete
            </button>

            <button
              type="button"
              onClick={() => setDecision('revision')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                decision === 'revision'
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-[#11182c] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Request Revision
            </button>

            <button
              type="button"
              onClick={() => setDecision('reject')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                decision === 'reject'
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                  : 'bg-[#11182c] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Reject Output
            </button>
          </div>
        </div>

        {/* Feedback / Instructions */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Feedback & Audit Notes {decision === 'revision' && <span className="text-amber-400">*</span>}
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback for specialist, required corrections, or approval notes..."
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
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
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Commit Audit Verdict'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
