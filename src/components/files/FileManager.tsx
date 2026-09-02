import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttachmentFile } from '../../types';
import {
  Folder,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  Table,
  Plus,
} from 'lucide-react';

export const FileManager: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { files, uploadFile, deleteFile } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const filteredFiles = files.filter((f) => {
    if (!searchTerm) return true;
    return (
      (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.uploadedByName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploading(true);
    setTimeout(() => {
      Array.from(uploadedFiles).forEach((f: File) => {
        uploadFile({
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          url: URL.createObjectURL(f),
          uploadedBy: currentUser?.id || 'user',
          uploadedByName: currentUser?.displayName || currentUser?.fullName || 'Specialist',
          uploadedAt: new Date().toISOString(),
        });
      });
      setUploading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Centralized Repository
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Agency Proof & Deliverable Files
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store scraped lead CSVs, client assets, audit screenshots, and campaign templates.
          </p>
        </div>

        <div>
          <input
            type="file"
            multiple
            id="file-upload-input"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="file-upload-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Agency File'}
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deliverables by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <Folder className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Deliverable Files Uploaded</h4>
          <p className="text-xs text-slate-400">
            Uploaded CSV exports, screenshots, and task proofs will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-2xl bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all space-y-3 shadow-xl shadow-black/30 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <a
                  href={file.url}
                  download={file.name}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>

                {(isAdmin || file.uploadedBy === currentUser?.id) && (
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
