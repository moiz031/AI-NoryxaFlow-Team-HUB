import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CalendarEvent } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const TeamCalendar: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { calendarEvents, tasks, createCalendarEvent } = useData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // New Event state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('meeting');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );

  // Merge calendar events with task deadlines
  const taskDeadlineEvents: CalendarEvent[] = tasks.map((t) => ({
    id: `task_cal_${t.id}`,
    title: `Task Due: ${t.title}`,
    description: `Deadline for ${t.category} task. Assigned to ${t.assignedUserNames?.join(', ')}`,
    type: 'deadline',
    startDate: t.deadline,
    endDate: t.deadline,
    allDay: false,
    taskId: t.id,
    createdBy: t.createdBy,
  }));

  const allEvents = [...calendarEvents, ...taskDeadlineEvents];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCalendarEvent({
      title: title.trim(),
      description: description.trim(),
      type: eventType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      allDay: false,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  // Build calendar grid days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-display">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Agency Deliverables & Deadlines Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track deliverable deadlines, review schedules, and client sync meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#11182c] border border-white/10 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white min-w-[130px] text-center font-display">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#090d18] text-center py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/5 bg-[#0d1322]">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[100px] sm:min-h-[120px] bg-black/20" />;
            }

            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = allEvents.filter((e) => e.startDate?.startsWith(dayDateStr));
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === day;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[100px] sm:min-h-[120px] p-2 transition-colors hover:bg-white/[0.02] flex flex-col justify-between ${
                  isToday ? 'bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                        : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                {/* Day events stack */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-20">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-all ${
                        event.type === 'deadline'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : event.type === 'meeting'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-400 block px-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Schedule Agency Event"
          subtitle="Add review meetings, campaign launch dates, or team syncs."
          maxWidth="xl"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Lead Audit & Review"
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="meeting">Team Meeting</option>
                  <option value="milestone">Campaign Milestone</option>
                  <option value="deadline">Deliverable Deadline</option>
                  <option value="reminder">Operational Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                Description / Agenda
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agenda notes, Google Meet link, or deliverable references..."
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                Schedule Event
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          subtitle={`Type: ${selectedEvent.type.toUpperCase()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/5 space-y-2">
              <p className="text-xs text-slate-200">{selectedEvent.description}</p>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-2 border-t border-white/5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(selectedEvent.startDate).toLocaleString()}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
