import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import {
  CalendarDays,
  Clock,
  User,
  MapPin
} from 'lucide-react';

export const StudentTimetable = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const res = await StudentPortalService.getTimetable();
      setTimetableData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading || !timetableData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const entries = timetableData.entries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Weekly Academic Timetable</h2>
        <p className="text-sm text-slate-500">
          Official lecture, tutorial, and lab schedules for Section {timetableData.section}.
        </p>
      </div>

      {/* Daily Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayEntries = entries.filter((e) => e.day_of_week === day);
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{day}</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {dayEntries.length} Periods
                </span>
              </div>

              <div className="mt-3 space-y-3 flex-1">
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No classes scheduled</p>
                ) : (
                  dayEntries.map((period) => (
                    <div
                      key={period.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 font-bold mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{period.start_time} - {period.end_time}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{period.subject_name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" /> {period.lecturer_name}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white border border-slate-200 text-slate-600 mt-2">
                        {period.room_number}
                      </span>
                    </div>
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

