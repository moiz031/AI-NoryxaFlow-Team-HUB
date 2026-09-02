import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CommunityPost } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import {
  MessageSquare,
  Pin,
  Share2,
  Send,
  Search,
  Image as ImageIcon,
  Video,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Flame,
  Clock,
  UserCheck,
  GraduationCap,
  X,
  Link,
  CheckCircle2,
} from 'lucide-react';

export const CommunityFeed: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const {
    communityPosts,
    createCommunityPost,
    togglePostUpvote,
    togglePostDownvote,
    addPostComment,
    togglePinPost,
  } = useData();

  // Search, filter, and tab states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'newest' | 'top' | 'creator' | 'instructors'>('newest');

  // Inline top create post states
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('General');
  const [isPinned, setIsPinned] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Per-post inline comment state: { [postId]: string }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Handle media file upload from local device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert local file to Data URL for instant preview & persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
        setMediaType(type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);

    createCommunityPost({
      title: postTitle.trim() || postContent.substring(0, 40) + '...',
      content: postContent.trim(),
      category: postCategory,
      isPinned: isAdmin ? isPinned : false,
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType: mediaType,
      tags: [],
    });

    // Reset post box
    setPostTitle('');
    setPostContent('');
    setMediaUrl('');
    setMediaType(undefined);
    setShowMediaInput(false);
    setIsPinned(false);
    setIsPosting(false);
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    addPostComment(postId, text.trim());
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/community#post-${postId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Helper to detect and embed YouTube/Vimeo/Direct Video
  const renderEmbedOrMedia = (url?: string, type?: 'image' | 'video') => {
    if (!url) return null;

    // YouTube check
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 my-3 shadow-lg bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            title="Embedded Video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo check
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 my-3 shadow-lg bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            title="Embedded Vimeo"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Direct Video file or Image
    if (type === 'video' || url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('data:video')) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 my-3 bg-black">
          <video src={url} controls className="w-full h-full object-contain" />
        </div>
      );
    }

    return (
      <div className="rounded-xl overflow-hidden border border-white/10 my-3 bg-[#11182c]/60 max-h-96 flex items-center justify-center">
        <img src={url} alt="Post attachment" className="w-full h-auto max-h-96 object-cover" />
      </div>
    );
  };

  // Filtering & Sorting Posts
  let processedPosts = communityPosts.filter((post) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.authorName.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term)
    );
  });

  if (activeTab === 'creator') {
    processedPosts = processedPosts.filter((p) => p.authorId === currentUser?.id);
  } else if (activeTab === 'instructors') {
    processedPosts = processedPosts.filter((p) => p.authorRole === 'admin');
  } else if (activeTab === 'top') {
    processedPosts.sort((a, b) => {
      const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0) + (a.comments?.length || 0);
      const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0) + (b.comments?.length || 0);
      return scoreB - scoreA;
    });
  } else {
    // Newest
    processedPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Pagination Math
  const totalPages = Math.ceil(processedPosts.length / postsPerPage) || 1;
  const paginatedPosts = processedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Top Community Header Banner */}
      <div className="bg-[#0b101d] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500" />
        <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          Agency Community
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Connect, share insights, discuss campaign strategy, and implement AI together across the agency.
        </p>
      </div>

      {/* 2. Top Inline Create Post Box (Exact Competitor Style from Image 2) */}
      <div className="bg-[#0d1322]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl space-y-3">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-start gap-3">
            <UserAvatar name={currentUser?.displayName || 'User'} size="md" />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Post title (optional)..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-4 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <textarea
                placeholder="Share your thoughts... Paste YouTube, Vimeo, Instagram, or image links to embed them!"
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full px-4 py-3 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Media Input Drawer if toggled */}
          {showMediaInput && (
            <div className="p-3 bg-[#11182c] rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-bold text-[11px]">
                <span>ATTACH MEDIA / VIDEO LINK</span>
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste YouTube video link or image URL..."
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.includes('youtube') || e.target.value.includes('vimeo') || e.target.value.endsWith('.mp4')) {
                      setMediaType('video');
                    } else {
                      setMediaType('image');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#0d1322] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-lg cursor-pointer font-bold text-[11px]">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                </label>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-lg cursor-pointer font-bold text-[11px]">
                  <Video className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                </label>
              </div>

              {mediaUrl && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Media attached successfully
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#11182c] hover:bg-[#18223c] border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Media & Links</span>
              </button>

              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as any)}
                className="px-3 py-1.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="General">General</option>
                <option value="AI Masterclass">AI Masterclass</option>
                <option value="Work">Work & Deliverables</option>
                <option value="Questions">Questions & Help</option>
                <option value="Wins & Achievements">Wins & Achievements</option>
                <option value="Learning">Learning & SOPs</option>
                <option value="Announcements">Announcements</option>
              </select>

              {isAdmin && (
                <label className="inline-flex items-center gap-1.5 text-xs text-indigo-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded bg-[#11182c] border-white/20 text-indigo-600 focus:ring-0"
                  />
                  <span>Pin Post</span>
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(postContent || postTitle || mediaUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setPostTitle('');
                    setPostContent('');
                    setMediaUrl('');
                    setShowMediaInput(false);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={!postContent.trim() || isPosting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Search & Filter Bar (Matching Competitor Layout) */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search community posts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('top');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'top'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Top</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('newest');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'newest'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Newest</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('creator');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Posts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('instructors');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'instructors'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#11182c] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span>Instructors</span>
          </button>
        </div>
      </div>

      {/* 4. Posts List Cards */}
      <div className="space-y-4">
        {paginatedPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#0d1322]/70 rounded-2xl border border-white/5 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Community Posts Found</h4>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Try clearing your search terms.' : 'Be the first to share your thoughts, videos, or questions above!'}
            </p>
          </div>
        ) : (
          paginatedPosts.map((post) => {
            const upvotesCount = post.upvotes?.length || 0;
            const downvotesCount = post.downvotes?.length || 0;
            const netVotes = upvotesCount - downvotesCount;

            const hasUpvoted = currentUser ? post.upvotes?.includes(currentUser.id) : false;
            const hasDownvoted = currentUser ? post.downvotes?.includes(currentUser.id) : false;
            const commentsList = post.comments || [];

            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`p-5 rounded-2xl bg-[#0d1322]/90 backdrop-blur-xl border transition-all shadow-xl space-y-4 ${
                  post.isPinned ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/10'
                }`}
              >
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={post.authorName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{post.authorName}</span>
                        {post.authorRole === 'admin' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Admin / Instructor
                          </span>
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {post.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                {/* Content Body */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* Render Video / Photo embed if attached */}
                  {renderEmbedOrMedia(post.mediaUrl, post.mediaType)}
                </div>

                {/* Voting & Actions Row (Matching exact competitor layout from Image 2) */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                  <div className="flex items-center gap-4">
                    {/* Upvote / Downvote Pill */}
                    <div className="inline-flex items-center bg-[#11182c] border border-white/10 rounded-xl px-2 py-1 gap-1 text-xs font-bold">
                      <button
                        onClick={() => togglePostUpvote(post.id)}
                        className={`p-1 hover:text-emerald-400 transition-colors cursor-pointer ${
                          hasUpvoted ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                        title="Upvote"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className={`px-1 font-mono ${netVotes > 0 ? 'text-emerald-400' : netVotes < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {netVotes}
                      </span>
                      <button
                        onClick={() => togglePostDownvote(post.id)}
                        className={`p-1 hover:text-rose-400 transition-colors cursor-pointer ${
                          hasDownvoted ? 'text-rose-400' : 'text-slate-400'
                        }`}
                        title="Downvote"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments Counter */}
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>{commentsList.length} Comments</span>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer font-bold"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copiedPostId === post.id ? 'Copied Link!' : 'Share'}</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => togglePinPost(post.id)}
                      className="text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      {post.isPinned ? 'Unpin' : 'Pin Post'}
                    </button>
                  )}
                </div>

                {/* 5. Embedded Comments Section & Inline Input Box (Exact Competitor Layout from Image 2) */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  {/* Comments Container */}
                  {commentsList.length > 0 && (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {commentsList.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 bg-[#11182c]/90 rounded-xl border border-white/5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-[11px]">{comment.userName}</span>
                              {comment.userRole === 'admin' && (
                                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Comment Input Row at bottom of card */}
                  <div className="flex items-center gap-2 pt-1">
                    <UserAvatar name={currentUser?.displayName || 'User'} size="sm" />
                    <input
                      type="text"
                      placeholder="Join the conversation..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(post.id);
                      }}
                      className="flex-1 px-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                      title="Send Comment"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Pagination Bar at Bottom (Exact Competitor Layout) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-[#0d1322] border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#0d1322] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-[#0d1322] border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
