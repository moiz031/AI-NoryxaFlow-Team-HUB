import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import {
  Megaphone,
  MessageSquare,
  GraduationCap,
  Brain,
  CheckSquare,
  Video,
  FileText,
  Send,
  Users,
  Sparkles,
  Link as LinkIcon,
  Pin,
} from 'lucide-react';

interface CentralPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: 'feed' | 'community' | 'academy' | 'intelligence' | 'announcements';
}

export const CentralPublishModal: React.FC<CentralPublishModalProps> = ({
  isOpen,
  onClose,
  defaultSection = 'feed',
}) => {
  const { allUsers } = useAuth();
  const { publishCentralContent } = useData();

  const [destinationSection, setDestinationSection] = useState<
    'feed' | 'community' | 'academy' | 'intelligence' | 'announcements'
  >(defaultSection);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [targetAudience, setTargetAudience] = useState<'all' | string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'file'>('image');
  const [isPinned, setIsPinned] = useState(false);
  const [keyTakeaways, setKeyTakeaways] = useState('');

  const sectionOptions = [
    { id: 'feed', label: 'Agency Feed', icon: <Megaphone className="w-4 h-4 text-cyan-400" />, desc: 'Internal company announcement feed' },
    { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4 text-indigo-400" />, desc: 'Interactive discussion & Q&A' },
    { id: 'academy', label: 'Academy Lesson', icon: <GraduationCap className="w-4 h-4 text-emerald-400" />, desc: 'Training guide or video SOP' },
    { id: 'intelligence', label: 'Intelligence Report', icon: <Brain className="w-4 h-4 text-purple-400" />, desc: 'AI research or market report' },
    { id: 'announcements', label: 'Important Notice', icon: <Sparkles className="w-4 h-4 text-amber-400" />, desc: 'High-priority team notice' },
  ];

  const handleUserSelectToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const recipients = targetAudience === 'all' ? 'all' : selectedUserIds;

    await publishCentralContent({
      title: title.trim(),
      content: content.trim(),
      section: destinationSection,
      category,
      targetAudience: recipients,
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType,
      isPinned,
      keyTakeaways: keyTakeaways
        ? keyTakeaways
            .split('\n')
            .map((k) => k.trim())
            .filter(Boolean)
        : undefined,
    });

    // Reset
    setTitle('');
    setContent('');
    setMediaUrl('');
    setKeyTakeaways('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Team Content & Send Notifications"
      subtitle="Central Admin Hub: Publish updates, lessons, or intel and alert members automatically"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination Section Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            1. Destination Section
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {sectionOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDestinationSection(opt.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                  destinationSection === opt.id
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'bg-[#11182c] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            2. Target Recipients
          </label>
          <div className="flex items-center gap-4 bg-[#11182c] p-3 rounded-xl border border-white/5 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="target"
                value="all"
                checked={targetAudience === 'all'}
                onChange={() => setTargetAudience('all')}
                className="text-indigo-500 focus:ring-0"
              />
              All Team Members
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="target"
                value="selected"
                checked={targetAudience === 'selected'}
                onChange={() => setTargetAudience('selected')}
                className="text-indigo-500 focus:ring-0"
              />
              Select Specific Member(s)
            </label>
          </div>

          {targetAudience === 'selected' && (
            <div className="mt-2.5 p-3 bg-[#11182c] rounded-xl border border-white/10 max-h-36 overflow-y-auto space-y-1.5">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Check Recipients:
              </p>
              {allUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                >
                  <span className="text-white font-semibold">{u.displayName} ({u.jobTitle})</span>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => handleUserSelectToggle(u.id)}
                    className="rounded text-indigo-500"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New Lead Scraping Workflow & Video Tutorial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Announcements, AI Tools"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Content Details / Message
          </label>
          <textarea
            required
            rows={4}
            placeholder="Write the full message, update description, or lesson steps..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Attach Media / Video URL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Attached Media or Video Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Media Type
            </label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="image">Image</option>
              <option value="video">Video Walkthrough</option>
              <option value="file">Document / Sheet</option>
            </select>
          </div>
        </div>

        {/* Key Takeaways if Intelligence */}
        {destinationSection === 'intelligence' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Key Actionable Takeaways (one per line)
            </label>
            <textarea
              rows={2}
              placeholder="• Insight 1&#10;• Insight 2"
              value={keyTakeaways}
              onChange={(e) => setKeyTakeaways(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        )}

        {/* Pin Post Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pin-post-check"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded text-indigo-500 focus:ring-0"
          />
          <label htmlFor="pin-post-check" className="text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1">
            <Pin className="w-3.5 h-3.5 text-indigo-400" /> Pin this item to the top of the feed
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Publish & Notify Recipients
          </button>
        </div>
      </form>
    </Modal>
  );
};
