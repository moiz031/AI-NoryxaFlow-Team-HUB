import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings, Save, CheckCircle2, Table, Plus, Trash2, Shield, Bell, Palette, Sparkles, Check } from 'lucide-react';

export const AgencySettings: React.FC = () => {
  const { settings, updateSettings } = useData();
  const { theme, setTheme, allThemes, currentThemeConfig } = useTheme();

  const [agencyName, setAgencyName] = useState(settings.agencyName);
  const [defaultGoogleSheetUrl, setDefaultGoogleSheetUrl] = useState(settings.defaultGoogleSheetUrl);
  const [categories, setCategories] = useState<string[]>(settings.taskCategories);
  const [newCategory, setNewCategory] = useState('');
  const [allowMemberSelfAssign, setAllowMemberSelfAssign] = useState(settings.allowMemberSelfAssign);
  const [requireProofForReview, setRequireProofForReview] = useState(settings.requireProofForReview);
  const [enableDailyReminder, setEnableDailyReminder] = useState(settings.enableDailyReminder);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      agencyName,
      defaultGoogleSheetUrl,
      taskCategories: categories,
      allowMemberSelfAssign,
      requireProofForReview,
      enableDailyReminder,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl shadow-black/30">
        <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-display">
          <Settings className="w-5 h-5 text-indigo-400" />
          Agency Platform Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure workflow validation rules, category taxonomies, and default Google Sheet deliverables.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Agency platform settings updated successfully!
        </div>
      )}

      {/* 5-Theme Design Systems Selector */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-400" />
              Agency Dashboard UI Design Systems (5 Options)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any design preset to transform typography, colors, borders, and visual layout.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
            Active: {currentThemeConfig.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {allThemes.map((t) => {
            const isCurrent = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-teal-400 bg-teal-950/20 shadow-lg shadow-teal-500/10'
                    : 'border-white/10 hover:border-white/20 bg-[#11182c]/70 hover:bg-[#161f38]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: t.primaryAccent }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: t.secondaryAccent }}
                      />
                      <span className="text-xs font-bold text-white leading-tight">{t.name}</span>
                    </div>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Click to Apply</span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">{t.subtitle}</p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      {t.category}
                    </span>
                    {t.isLightMode && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Light Mode
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Headings: {t.fontHeading.replace(/,.*$/, '')}</span>
                  <span>Body: {t.fontBody.replace(/,.*$/, '')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Config */}
        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl shadow-black/30">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-display">
            General Agency Identity
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Agency / Organization Name</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Master Google Sheet URL</label>
            <input
              type="url"
              value={defaultGoogleSheetUrl}
              onChange={(e) => setDefaultGoogleSheetUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl shadow-black/30">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-display">
            Task Categories & Taxonomies
          </h3>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11182c] border border-white/10 text-xs font-semibold text-white"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-400 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New deliverable category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold"
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Validation Flags */}
        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl shadow-black/30">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-display">
            Operational Rules & Proof Validation
          </h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requireProofForReview}
              onChange={(e) => setRequireProofForReview(e.target.checked)}
              className="w-4 h-4 rounded bg-[#11182c] border-white/20 text-indigo-600 focus:ring-0"
            />
            <span className="text-xs text-slate-300">
              Require proof of work (Google Sheet URL or file upload) before task submission for review
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMemberSelfAssign}
              onChange={(e) => setAllowMemberSelfAssign(e.target.checked)}
              className="w-4 h-4 rounded bg-[#11182c] border-white/20 text-indigo-600 focus:ring-0"
            />
            <span className="text-xs text-slate-300">
              Allow specialists to self-claim unassigned deliverables from the board
            </span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};
