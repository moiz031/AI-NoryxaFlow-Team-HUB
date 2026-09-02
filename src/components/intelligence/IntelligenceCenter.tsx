import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { IntelligenceItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  Brain,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  Plus,
  Play,
  Sparkles,
  Zap,
  Tag,
  BookOpen,
  Calendar,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface IntelligenceCenterProps {
  highlightId?: string;
}

export const IntelligenceCenter: React.FC<IntelligenceCenterProps> = ({ highlightId }) => {
  const { currentUser, isAdmin } = useAuth();
  const { intelligenceItems, createIntelligenceItem, deleteIntelligenceItem } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState<IntelligenceItem | null>(() => {
    if (highlightId) {
      return intelligenceItems.find((i) => i.id === highlightId) || null;
    }
    return null;
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<IntelligenceItem['category']>('AI Insights');
  const [tagsInput, setTagsInput] = useState('');
  const [keyTakeawaysInput, setKeyTakeawaysInput] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const categories = [
    'All',
    'AI Insights',
    'Market Intelligence',
    'Industry Trends',
    'Strategy & Reports',
    'AI Tools & Workflows',
    'Research',
  ];

  const filteredItems = intelligenceItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (
      searchTerm &&
      !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateIntelligence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const keyTakeaways = keyTakeawaysInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    await createIntelligenceItem({
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      tags: tags.length > 0 ? tags : ['AI', 'Intelligence'],
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : undefined,
      reportUrl: reportUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });

    setTitle('');
    setSummary('');
    setContent('');
    setTagsInput('');
    setKeyTakeawaysInput('');
    setReportUrl('');
    setVideoUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-500" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Intelligence & Market Research
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Agency Intelligence & AI Trend Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Curated market intelligence, AI workflow breakdowns, competitive research, and strategic insights.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publish Intel Update
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search intelligence reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Intelligence Items */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <Brain className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Intelligence Reports Found</h4>
          <p className="text-xs text-slate-400">
            {isAdmin ? 'Publish a new research report or AI insight for the team.' : 'Check back later for new intelligence updates.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isHighlighted = item.id === highlightId;

            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`p-5 rounded-2xl bg-[#0d1322]/85 backdrop-blur-xl border transition-all cursor-pointer space-y-4 shadow-xl shadow-black/30 group relative flex flex-col justify-between ${
                  isHighlighted ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-950/20' : 'border-white/10 hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white font-display line-clamp-2 group-hover:text-purple-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 mt-1.5 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                    <div className="p-2.5 bg-[#11182c] rounded-xl border border-white/5 text-[11px] space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 block">
                        Key Takeaway
                      </span>
                      <p className="text-slate-300 line-clamp-2 font-mono">
                        • {item.keyTakeaways[0]}
                      </p>
                    </div>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    Read Report <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIntelligenceItem(item.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Intel Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeItem && (
        <Modal
          isOpen={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          title={activeItem.title}
          subtitle={`Category: ${activeItem.category} • Published by ${activeItem.authorName || 'Admin'}`}
          maxWidth="3xl"
        >
          <div className="space-y-5">
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Executive Summary
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                {activeItem.summary}
              </p>
            </div>

            {activeItem.keyTakeaways && activeItem.keyTakeaways.length > 0 && (
              <div className="p-4 bg-[#11182c] border border-white/10 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Key Actionable Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {activeItem.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/5 whitespace-pre-line text-xs text-slate-200 leading-relaxed">
              {activeItem.content}
            </div>

            {activeItem.videoUrl && (
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                <span className="flex items-center gap-2 font-bold">
                  <Play className="w-4 h-4 text-indigo-400" /> Video Breakdown Available
                </span>
                <a
                  href={activeItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] transition-all"
                >
                  Watch Video
                </a>
              </div>
            )}

            {activeItem.reportUrl && (
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-cyan-300">
                <span className="flex items-center gap-2 font-bold">
                  <FileText className="w-4 h-4 text-cyan-400" /> Full Document / Deck Attachment
                </span>
                <a
                  href={activeItem.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[11px] transition-all"
                >
                  View Attachment
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Intelligence Modal for Admin */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Publish Intelligence Report"
          subtitle="Share research, AI tools, or strategic insights with the team"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateIntelligence} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Cold Email Personalization Benchmark Q3 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IntelligenceItem['category'])}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="AI Insights">AI Insights</option>
                  <option value="Market Intelligence">Market Intelligence</option>
                  <option value="Industry Trends">Industry Trends</option>
                  <option value="Strategy & Reports">Strategy & Reports</option>
                  <option value="AI Tools & Workflows">AI Tools & Workflows</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="AI, Outreach, Prospecting"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Executive Summary
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brief high-level overview of findings..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Key Actionable Takeaways (one per line)
              </label>
              <textarea
                rows={3}
                placeholder="• Use Clay + Apollo for multi-source verification&#10;• Warm up domains for 21 days minimum"
                value={keyTakeawaysInput}
                onChange={(e) => setKeyTakeawaysInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Body Content & Detailed Insights
              </label>
              <textarea
                required
                rows={4}
                placeholder="Elaborate on methodology, data points, and strategic execution steps..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  External Video URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Document / Report Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/..."
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30"
              >
                Publish & Notify Team
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
