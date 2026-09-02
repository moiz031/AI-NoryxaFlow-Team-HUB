import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DailyReport } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import {
  FileText,
  Calendar,
  User,
  Table,
  ExternalLink,
  Download,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';

export const DailyReportList: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { dailyReports, exportToCSV } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // Filter reports: if admin, see all; if member, see only own
  const filteredReports = dailyReports.filter((rep) => {
    if (!isAdmin && currentUser && rep.userId !== currentUser.id) {
      return false;
    }
    if (!searchTerm) return true;
    return (
      (rep.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.completedTasksSummary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.date || '').includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by specialist, date, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => exportToCSV('reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Reports (CSV)
          </button>
        )}
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Daily Reports Logged</h4>
          <p className="text-xs text-slate-400">
            {isAdmin ? 'No reports have been submitted by team members yet.' : 'You have not logged any daily work reports yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-5 rounded-2xl bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer space-y-4 shadow-xl shadow-black/30 group"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={report.userName} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {report.userName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      {report.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-3 gap-2 bg-[#11182c]/80 p-2.5 rounded-xl border border-white/5 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-semibold">Leads</span>
                  <span className="text-xs font-extrabold text-white">{report.leadsGenerated || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-semibold">Outreach</span>
                  <span className="text-xs font-extrabold text-white">{report.leadsContacted || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block font-semibold">Replies</span>
                  <span className="text-xs font-extrabold text-white">{report.repliesReceived || 0}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-medium">
                {report.completedTasksSummary}
              </p>

              {report.googleSheetUrl && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-indigo-400">
                  <span className="flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Spreadsheet Linked
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={`Daily Briefing: ${selectedReport.userName}`}
          subtitle={`Submitted on ${selectedReport.date}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Metric Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#11182c]/80 p-4 rounded-xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Leads Found</span>
                <span className="text-lg font-extrabold text-white">{selectedReport.leadsGenerated || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Outreach</span>
                <span className="text-lg font-extrabold text-white">{selectedReport.leadsContacted || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Replies</span>
                <span className="text-lg font-extrabold text-white">{selectedReport.repliesReceived || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Bookings</span>
                <span className="text-lg font-extrabold text-white">{selectedReport.meetingsBooked || 0}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Narrative & Deliverable Summary
              </h5>
              <div className="p-4 bg-[#11182c]/60 rounded-xl border border-white/5 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedReport.completedTasksSummary}
              </div>
            </div>

            {selectedReport.challenges && (
              <div>
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Blockers & Challenges
                </h5>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-200">
                  {selectedReport.challenges}
                </div>
              </div>
            )}

            {selectedReport.googleSheetUrl && (
              <a
                href={selectedReport.googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                <Table className="w-3.5 h-3.5" />
                Open Live Sheet Deliverable <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
