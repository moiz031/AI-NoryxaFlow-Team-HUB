import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Inbox,
  Play,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

interface TaskBoardProps {
  onOpenTaskDetail: (task: Task) => void;
  onOpenCreateTask?: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  onOpenTaskDetail,
  onOpenCreateTask,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { tasks, updateTaskStatus, settings } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Kanban Columns
  const columns: { id: TaskStatus; title: string; colorDot: string }[] = [
    {
      id: 'assigned',
      title: 'Assigned',
      colorDot: 'bg-cyan-400',
    },
    {
      id: 'accepted',
      title: 'Accepted',
      colorDot: 'bg-blue-400',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      colorDot: 'bg-indigo-400',
    },
    {
      id: 'waiting_for_review',
      title: 'Review Required',
      colorDot: 'bg-amber-400',
    },
    {
      id: 'revision_required',
      title: 'Revision',
      colorDot: 'bg-orange-400',
    },
    {
      id: 'approved',
      title: 'Completed',
      colorDot: 'bg-emerald-400',
    },
  ];

  // Filter tasks based on role and active filters
  const filteredTasks = tasks.filter((t) => {
    // If regular member, only see assigned tasks
    if (!isAdmin && currentUser && !t.assignedTo.includes(currentUser.id)) {
      return false;
    }

    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedMember !== 'all' && !t.assignedTo.includes(selectedMember)) return false;
    if (
      searchFilter &&
      !t.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !t.description.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Filter & Control Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deliverables..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Lead Generation">Lead Generation</option>
            <option value="Cold Outreach">Cold Outreach</option>
            <option value="Research & Sourcing">Research & Sourcing</option>
            <option value="CRM Updating">CRM Updating</option>
            <option value="Campaign Setup">Campaign Setup</option>
          </select>

          {/* Priority Selector */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Create Task Action */}
        {isAdmin && onOpenCreateTask && (
          <button
            id="create-task-kanban-btn"
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => {
            if (col.id === 'approved') {
              return t.status === 'approved' || t.status === 'completed';
            }
            return t.status === col.id;
          });

          return (
            <div
              key={col.id}
              className="bg-[#090d18] rounded-2xl border border-white/10 p-3.5 flex flex-col min-w-[260px] max-h-[calc(100vh-240px)] shadow-xl shadow-black/30"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.colorDot}`} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                    {col.title}
                  </h3>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Column Body */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-center p-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      No Tasks
                    </span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpenDetail={onOpenTaskDetail}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
