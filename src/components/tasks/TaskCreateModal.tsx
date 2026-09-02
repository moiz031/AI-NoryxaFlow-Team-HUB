import React, { useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Plus,
  Trash2,
  Table,
  Link as LinkIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  initialTask,
}) => {
  const { allUsers, currentUser } = useAuth();
  const { createTask, updateTask, settings } = useData();

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [detailedInstructions, setDetailedInstructions] = useState(initialTask?.detailedInstructions || '');
  const [category, setCategory] = useState(initialTask?.category || settings.taskCategories[0] || 'Lead Generation');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState<string[]>(initialTask?.assignedTo || []);
  
  // Format initial deadline for datetime-local input
  const defaultDeadline = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16);
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? new Date(initialTask.deadline).toISOString().slice(0, 16) : defaultDeadline
  );
  const [estimatedHours, setEstimatedHours] = useState<number>(initialTask?.estimatedHours || 4);
  const [googleSheetSyncUrl, setGoogleSheetSyncUrl] = useState(initialTask?.googleSheetSyncUrl || settings.defaultGoogleSheetUrl || '');

  // Dynamic checklist builder
  const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean }[]>(
    initialTask?.checklist || [
      { id: 'c1', text: 'Extract verified data matching ICP criteria', completed: false },
      { id: 'c2', text: 'Validate emails and eliminate bounces', completed: false },
    ]
  );
  const [newChecklistText, setNewChecklistText] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const members = allUsers.filter((u) => u.role === 'member');

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `c_${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleAssignee = (userId: string) => {
    if (assignedTo.includes(userId)) {
      setAssignedTo(assignedTo.filter((id) => id !== userId));
    } else {
      setAssignedTo([...assignedTo, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (assignedTo.length === 0) {
      setError('Please assign at least one team member.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const assignedNames = allUsers
        .filter((u) => assignedTo.includes(u.id))
        .map((u) => u.displayName || u.fullName);

      if (initialTask) {
        updateTask(initialTask.id, {
          title: title.trim(),
          description: description.trim(),
          detailedInstructions: detailedInstructions.trim(),
          category,
          priority,
          assignedTo,
          assignedUserNames: assignedNames,
          deadline: new Date(deadline).toISOString(),
          estimatedHours: Number(estimatedHours) || 2,
          googleSheetSyncUrl: googleSheetSyncUrl.trim(),
          checklist,
        });
      } else {
        createTask({
          title: title.trim(),
          description: description.trim(),
          detailedInstructions: detailedInstructions.trim(),
          category,
          priority,
          status: 'assigned',
          assignedTo,
          assignedUserNames: assignedNames,
          deadline: new Date(deadline).toISOString(),
          estimatedHours: Number(estimatedHours) || 2,
          googleSheetSyncUrl: googleSheetSyncUrl.trim(),
          checklist,
          referenceLinks: [],
          attachments: [],
          submissions: [],
          comments: [],
          statusHistory: [
            {
              status: 'assigned',
              timestamp: new Date().toISOString(),
              updatedBy: currentUser?.id || 'admin',
              updatedByName: currentUser?.displayName || 'Admin',
              note: 'Task initially created and assigned',
            },
          ],
        });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save deliverable task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Deliverable Task' : 'Assign New Client Deliverable'}
      subtitle="Define objectives, standard procedures, assignees, and target deadline."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Task / Deliverable Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scrape 500 Verified SaaS Founders in US/UK"
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Lead Generation">Lead Generation</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Research & Sourcing">Research & Sourcing</option>
              <option value="CRM Updating">CRM Updating</option>
              <option value="Campaign Setup">Campaign Setup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Assign To Team Specialists *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#11182c]/60 rounded-xl border border-white/10">
            {members.map((member) => {
              const isSelected = assignedTo.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleToggleAssignee(member.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-[#11182c] border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold">{member.displayName || member.fullName}</span>
                  <span className="text-[10px] text-slate-400">{member.jobTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description & Detailed Instructions */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Brief Overview
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High-level deliverable summary..."
            className="w-full px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Detailed SOP & Execution Instructions
          </label>
          <textarea
            rows={4}
            value={detailedInstructions}
            onChange={(e) => setDetailedInstructions(e.target.value)}
            placeholder="Step-by-step instructions, Apollo filters, qualification criteria..."
            className="w-full px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        </div>

        {/* Deadline & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Target Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Estimated Effort (Hours)
            </label>
            <input
              type="number"
              min={1}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Live Working Sheet Link */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Google Sheets Workspace URL
          </label>
          <input
            type="url"
            value={googleSheetSyncUrl}
            onChange={(e) => setGoogleSheetSyncUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Checklist */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Acceptance Checklist Items
          </label>
          <div className="space-y-2 mb-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-[#11182c] border border-white/5 rounded-xl text-xs text-slate-200">
                <span>{item.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add validation step (e.g. Verify LinkedIn profile links)..."
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              className="flex-1 px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : initialTask ? 'Update Task' : 'Assign Deliverable'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
