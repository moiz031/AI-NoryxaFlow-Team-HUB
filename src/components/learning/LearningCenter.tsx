import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LearningResource, QuizQuestion } from '../../types';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Plus,
  Play,
  Sparkles,
  Image as ImageIcon,
  HelpCircle,
  FileQuestion,
  Award,
  Upload,
  Link,
  Trash2,
  Check,
  RotateCcw,
} from 'lucide-react';

export const LearningCenter: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { learningResources, toggleResourceCompletion, createLearningResource } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Reader / Viewer modal state
  const [activeResource, setActiveResource] = useState<LearningResource | null>(null);

  // Add / Publish Resource Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LearningResource['category']>('Lead Generation');
  const [type, setType] = useState<LearningResource['type']>('video');
  const [content, setContent] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);

  // Media Link or Device File Upload
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Quiz / Test Builder State
  const [testInstructions, setTestInstructions] = useState('');
  const [passingScorePercent, setPassingScorePercent] = useState(80);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: `q_1`,
      question: 'What is the primary objective of this module?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      explanation: '',
    },
  ]);

  // Quiz Taking Engine state inside Viewer
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const categories = [
    'All',
    'AI Masterclass',
    'Lead Generation',
    'Outreach & Sales',
    'AI Tools & Automation',
    'SOPs & Workflows',
    'Productivity',
    'Client Communication',
    'Direct Lessons',
  ];

  const types = [
    { label: 'All Types', value: 'All' },
    { label: '🎥 Videos', value: 'video' },
    { label: '🖼️ Photos', value: 'image' },
    { label: '📝 Quizzes & Tests', value: 'quiz' },
    { label: '📖 Guides', value: 'guide' },
  ];

  const completedIds = currentUser?.completedResources || [];
  const totalCount = learningResources.length;
  const completedCount = learningResources.filter((r) => completedIds.includes(r.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // File Upload Handler (Converts file from local device to Data URL for instant play/view)
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        if (fileType === 'video') {
          setVideoUrl(result);
          setType('video');
        } else {
          setImageUrl(result);
          setType('image');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper for Quiz builder
  const handleAddQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: `Question ${prev.length + 1}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleQuestionChange = (index: number, key: keyof QuizQuestion, value: any) => {
    setQuizQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    setQuizQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[oIndex] = text;
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createLearningResource({
      title: title.trim(),
      category,
      type: type as any,
      content: content.trim(),
      description: content.substring(0, 120),
      estimatedMinutes: Number(estimatedMinutes) || 15,
      videoUrl: videoUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      testInstructions: type === 'quiz' || type === 'test' ? testInstructions.trim() : undefined,
      quizQuestions: type === 'quiz' || type === 'test' ? quizQuestions : undefined,
      passingScorePercent: type === 'quiz' || type === 'test' ? Number(passingScorePercent) : undefined,
      order: learningResources.length + 1,
    });

    // Reset Form
    setTitle('');
    setContent('');
    setVideoUrl('');
    setImageUrl('');
    setTestInstructions('');
    setShowAddModal(false);
  };

  // Quiz evaluation in viewer modal
  const handleEvaluateQuiz = () => {
    if (!activeResource?.quizQuestions) return;
    let correctCount = 0;
    const total = activeResource.quizQuestions.length;

    activeResource.quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / total) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    const requiredPct = activeResource.passingScorePercent || 70;
    if (scorePct >= requiredPct && !completedIds.includes(activeResource.id)) {
      toggleResourceCompletion(activeResource.id);
    }
  };

  // Embedded Video Player renderer
  const renderEmbedVideo = (url?: string) => {
    if (!url) return null;

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black my-4">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`}
            title="Embedded Youtube Video Lesson"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black my-4">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`}
            title="Embedded Vimeo Video Lesson"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black my-4">
        <video src={url} controls autoPlay className="w-full h-full object-contain" />
      </div>
    );
  };

  const filteredResources = learningResources.filter((res) => {
    if (selectedCategory !== 'All' && res.category !== selectedCategory) return false;
    if (selectedType !== 'All' && res.type !== selectedType) return false;
    if (searchTerm && !res.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Overall Progress Banner */}
      <div className="bg-[#0d1322]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-indigo-500 to-cyan-400" />
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Learning Academy & Training
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Daily Video Lessons, Photo Guides & Test Modules
          </h1>
          <p className="text-xs text-slate-400">
            Publish and master operational video lessons, image infographics, and interactive quiz tests.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Bar Badge */}
          <div className="bg-[#11182c] p-3 rounded-xl border border-white/10 text-right min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Progress</div>
            <div className="text-base font-extrabold text-white font-mono">{progressPercent}% Completed</div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish Lesson / Test
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter & Type Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lessons, videos, or tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === t.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 scrollbar-none border-t border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid of Training Modules & Video Cards */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1322]/60 rounded-2xl border border-white/5 space-y-2">
          <GraduationCap className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Lessons or Tests Found</h4>
          <p className="text-xs text-slate-400">
            {isAdmin ? 'Click "Publish Lesson / Test" to upload daily video tutorials, image guides, or quizzes.' : 'Check back later for newly published video lessons.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const isCompleted = completedIds.includes(res.id);
            const isVideo = res.type === 'video' || Boolean(res.videoUrl);
            const isImage = res.type === 'image' || Boolean(res.imageUrl);
            const isQuiz = res.type === 'quiz' || res.type === 'test';

            return (
              <div
                key={res.id}
                onClick={() => {
                  setActiveResource(res);
                  setUserAnswers({});
                  setQuizSubmitted(false);
                  setQuizScore(null);
                }}
                className={`p-5 rounded-2xl bg-[#0d1322]/90 backdrop-blur-xl border transition-all cursor-pointer space-y-4 shadow-xl group hover:border-indigo-500/50 relative overflow-hidden ${
                  isCompleted ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/10'
                }`}
              >
                {/* Media Thumbnail Preview if Video or Image */}
                {isVideo && res.videoUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono text-white px-2 py-0.5 rounded">
                      Video Lesson
                    </span>
                  </div>
                )}

                {isImage && res.imageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group-hover:scale-[1.02] transition-transform">
                    <img src={res.imageUrl} alt={res.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono text-white px-2 py-0.5 rounded">
                      Photo Guide
                    </span>
                  </div>
                )}

                {isQuiz && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <FileQuestion className="w-5 h-5 text-indigo-400" />
                    <span>Interactive Test Post ({res.quizQuestions?.length || 1} Questions)</span>
                  </div>
                )}

                {/* Card Info */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {res.category}
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {res.estimatedMinutes || 15}m
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white font-display line-clamp-2 group-hover:text-indigo-200 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {res.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-bold">
                  <span>{isVideo ? 'Watch Video' : isQuiz ? 'Take Test' : 'Read Guide'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Lesson & Video Viewer Modal */}
      {activeResource && (
        <Modal
          isOpen={Boolean(activeResource)}
          onClose={() => setActiveResource(null)}
          title={activeResource.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                {activeResource.category} • {activeResource.type.toUpperCase()}
              </span>

              <button
                onClick={() => toggleResourceCompletion(activeResource.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  completedIds.includes(activeResource.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedIds.includes(activeResource.id) ? 'Completed' : 'Mark as Completed'}</span>
              </button>
            </div>

            {/* Video Player if present */}
            {(activeResource.type === 'video' || activeResource.videoUrl) &&
              renderEmbedVideo(activeResource.videoUrl)}

            {/* Image Preview if present */}
            {(activeResource.type === 'image' || activeResource.imageUrl) && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black my-4 max-h-[450px] flex items-center justify-center">
                <img src={activeResource.imageUrl} alt="Lesson Image" className="w-full h-auto max-h-[450px] object-contain" />
              </div>
            )}

            {/* Test / Quiz Engine */}
            {(activeResource.type === 'quiz' || activeResource.type === 'test') && activeResource.quizQuestions && (
              <div className="p-5 bg-[#11182c] rounded-2xl border border-white/10 space-y-4 my-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                    <FileQuestion className="w-5 h-5 text-indigo-400" />
                    Knowledge Test & Assessment
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Passing Score: {activeResource.passingScorePercent || 70}%
                  </span>
                </div>

                {activeResource.testInstructions && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0d1322] p-3 rounded-xl border border-white/5">
                    {activeResource.testInstructions}
                  </p>
                )}

                <div className="space-y-4">
                  {activeResource.quizQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="p-4 bg-[#0d1322] rounded-xl border border-white/5 space-y-2 text-xs">
                      <div className="font-bold text-white text-sm">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctAnswerIndex === oIdx;

                          let btnStyle = 'bg-[#11182c] border-white/10 text-slate-300 hover:border-indigo-500';
                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-md';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                              className={`p-3 rounded-xl border text-left transition-all ${btnStyle}`}
                            >
                              <span className="font-mono text-[10px] mr-2 opacity-70">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score & Submit */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleEvaluateQuiz}
                      disabled={Object.keys(userAnswers).length < activeResource.quizQuestions.length}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                    >
                      Submit Test Answers
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="text-xs font-bold">
                        {quizScore! >= (activeResource.passingScorePercent || 70) ? (
                          <span className="text-emerald-400 flex items-center gap-1.5 text-sm font-mono">
                            <Award className="w-5 h-5 text-amber-400" /> PASSED! Your Score: {quizScore}%
                          </span>
                        ) : (
                          <span className="text-rose-400 text-sm font-mono">
                            FAILED. Score: {quizScore}%. (Passing is {activeResource.passingScorePercent || 70}%)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setUserAnswers({});
                          setQuizScore(null);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Test
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Lesson Content */}
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-2">
              {activeResource.content}
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Publish Lesson / Test Modal (For Admin & Instructors) */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Publish Lesson, Video or Test Module"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lesson Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Lead Scraping Masterclass or Client ICP Verification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lesson Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="video">🎥 Video Lesson</option>
                  <option value="image">🖼️ Photo Guide</option>
                  <option value="quiz">📝 Quiz / Test Post</option>
                  <option value="guide">📖 Text Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="AI Masterclass">AI Masterclass</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Outreach & Sales">Outreach & Sales</option>
                  <option value="AI Tools & Automation">AI Tools & Automation</option>
                  <option value="SOPs & Workflows">SOPs & Workflows</option>
                  <option value="Direct Lessons">Direct Lessons</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Time (Mins)</label>
                <input
                  type="number"
                  min={1}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Video Copy & Paste link or File Uploader */}
            {type === 'video' && (
              <div className="p-3 bg-[#11182c] rounded-xl border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Video URL (YouTube, Vimeo, or MP4 link) OR Upload File
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Copy & paste YouTube / Vimeo link here..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0d1322] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleDeviceFileUpload(e, 'video')}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Photo / Image URL or Device File uploader */}
            {type === 'image' && (
              <div className="p-3 bg-[#11182c] rounded-xl border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Image URL OR Upload Device Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste image URL here..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0d1322] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleDeviceFileUpload(e, 'image')}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Test / Quiz Builder */}
            {(type === 'quiz' || type === 'test') && (
              <div className="p-4 bg-[#11182c] rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">BUILD QUIZ / TEST QUESTIONS</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="p-3 bg-[#0d1322] rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                          placeholder={`Question ${qIdx + 1}`}
                          className="flex-1 px-2.5 py-1.5 bg-[#11182c] border border-white/10 rounded-lg text-xs text-white font-bold"
                        />
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswerIndex === oIdx}
                              onChange={() => handleQuestionChange(qIdx, 'correctAnswerIndex', oIdx)}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                              className="flex-1 px-2 py-1 bg-[#11182c] border border-white/10 rounded text-[11px] text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lesson Content & Instructions *</label>
              <textarea
                required
                rows={4}
                placeholder="Detailed lesson breakdown, key takeaways, SOP steps, or instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                Publish Lesson
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
