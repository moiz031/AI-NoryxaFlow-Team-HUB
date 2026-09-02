import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SOPDocument } from '../../types';
import { Modal } from '../common/Modal';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const SOPList: React.FC = () => {
  const { isAdmin } = useAuth();
  const { sops, createSOP } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSOP, setActiveSOP] = useState<SOPDocument | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New SOP state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lead Generation');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [dosText, setDosText] = useState('');
  const [dontsText, setDontsText] = useState('');

  const categories = ['All', 'Lead Generation', 'Outreach', 'Quality Assurance', 'Operations', 'General'];

  const filteredSOPs = sops.filter((sop) => {
    if (selectedCategory !== 'All' && sop.category !== selectedCategory) return false;
    if (
      searchTerm &&
      !sop.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sop.summary.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateSOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createSOP({
      title: title.trim(),
      category,
      version: '1.0',
      summary: summary.trim(),
      content: content.trim(),
      steps: [
        { stepNumber: 1, title: 'Preparation & Criteria', description: 'Review target requirements.' },
        { stepNumber: 2, title: 'Execution & Scraping', description: 'Execute verified search filters.' },
        { stepNumber: 3, title: 'Verification & Quality Check', description: 'Clean data and verify emails.' },
      ],
      dos: dosText ? dosText.split('\n').filter(Boolean) : ['Check bounce rates before exporting', 'Verify job titles match ICP'],
      donts: dontsText ? dontsText.split('\n').filter(Boolean) : ['Do not export unverified generic inboxes', 'Do not exceed daily export rates'],
    });

    setTitle('');
    setSummary('');
    setContent('');
    setDosText('');
    setDontsText('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
              Quality Assurance & Protocols
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Standard Operating Procedures (SOPs)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official agency workflow rules, deliverable requirements, and verification guidelines.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create SOP Document
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SOPs by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SOPs Grid */}
      {filteredSOPs.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No SOP Documents Found</h4>
          <p className="text-xs text-slate-400">
            {isAdmin ? 'Click "Create SOP Document" to add standardized agency protocols.' : 'No SOP documents published in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSOPs.map((sop) => (
            <div
              key={sop.id}
              onClick={() => setActiveSOP(sop)}
              className="p-5 rounded-2xl bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer space-y-4 shadow-xl shadow-black/30 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {sop.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v{sop.version}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display group-hover:text-cyan-200 transition-colors">
                  {sop.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed font-medium">
                  {sop.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-bold">
                <span>View Full Protocol</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {activeSOP && (
        <Modal
          isOpen={Boolean(activeSOP)}
          onClose={() => setActiveSOP(null)}
          title={activeSOP.title}
          subtitle={`Category: ${activeSOP.category} • Version ${activeSOP.version}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
              {activeSOP.summary}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2 font-display">
                Protocol Steps & Requirements
              </h4>
              <div className="p-4 bg-[#11182c]/60 rounded-xl border border-white/5 whitespace-pre-line text-xs text-slate-200 font-mono leading-relaxed">
                {activeSOP.content}
              </div>
            </div>

            {/* Dos & Donts */}
            {(activeSOP.dos?.length > 0 || activeSOP.donts?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSOP.dos && activeSOP.dos.length > 0 && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-display">
                      <CheckCircle2 className="w-4 h-4" /> Recommended (DOs)
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {activeSOP.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeSOP.donts && activeSOP.donts.length > 0 && (
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-display">
                      <XCircle className="w-4 h-4" /> Strictly Avoid (DON'Ts)
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {activeSOP.donts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Standard Operating Protocol"
          subtitle="Publish standardized instructions for lead extraction and campaign operations."
          maxWidth="3xl"
        >
          <form onSubmit={handleCreateSOP} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                Protocol Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. B2B Email Verification Protocol using NeverBounce"
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Summary / Scope
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short explanation of when to apply this protocol..."
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                Standard Protocol Steps & Details *
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Step 1: ... &#10;Step 2: ... &#10;Step 3: ..."
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Best Practices (DOs - one per line)
                </label>
                <textarea
                  rows={3}
                  value={dosText}
                  onChange={(e) => setDosText(e.target.value)}
                  placeholder="Check bounce rate below 2%..."
                  className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Strict Prohibitions (DON'Ts - one per line)
                </label>
                <textarea
                  rows={3}
                  value={dontsText}
                  onChange={(e) => setDontsText(e.target.value)}
                  placeholder="Never export unverified catch-alls..."
                  className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                Publish SOP
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
