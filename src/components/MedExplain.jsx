import React, { useState } from 'react';
import {
  Pill, Plus, X, CheckCircle, Clock, ChevronLeft, ChevronRight,
  AlertTriangle, Bot, Activity
} from 'lucide-react';

const INITIAL_MEDS = [];

export default function MedExplain() {
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('caresync_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDS;
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const [takenHistory, setTakenHistory] = useState(() => {
    const saved = localStorage.getItem('caresync_taken_history');
    return saved ? JSON.parse(saved) : {};
  });
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', timeOfDay: 'morning', timing: 'Before Breakfast', instruction: '', frequency: 'Daily' });

  // Persist medications to localStorage
  React.useEffect(() => {
    localStorage.setItem('caresync_meds', JSON.stringify(medications));
  }, [medications]);

  // Persist history to localStorage
  React.useEffect(() => {
    localStorage.setItem('caresync_taken_history', JSON.stringify(takenHistory));
  }, [takenHistory]);

  const handleToggleTaken = (id) => {
    setTakenHistory(prev => {
      const todayTaken = prev[selectedDateStr] || [];
      return { ...prev, [selectedDateStr]: todayTaken.includes(id) ? todayTaken.filter(m => m !== id) : [...todayTaken, id] };
    });
  };

  const medsForToday = medications.filter(med => {
    const day = currentDate.getDay();
    if (med.frequency === 'Weekdays' && (day === 0 || day === 6)) return false;
    if (med.frequency === 'Weekends' && day > 0 && day < 6) return false;
    return true;
  });

  const morningMeds = medsForToday.filter(m => m.timeOfDay === 'morning');
  const eveningMeds = medsForToday.filter(m => m.timeOfDay === 'evening');
  const totalMeds = medsForToday.length;
  const takenMeds = medsForToday.filter(m => (takenHistory[selectedDateStr] || []).includes(m.id)).length;
  const progressPercent = totalMeds === 0 ? 0 : (takenMeds / totalMeds) * 100;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;
    setMedications(prev => [...prev, {
      id: Date.now().toString(), name: `${newMed.name} ${newMed.dosage}`,
      timeOfDay: newMed.timeOfDay, time: newMed.timing,
      instruction: newMed.instruction || `Take ${newMed.timing.toLowerCase()}.`,
      aiReason: "Scheduled based on standard pharmacological guidelines. Consult your physician for personalized adjustments.",
      frequency: newMed.frequency
    }]);
    setNewMed({ name: '', dosage: '', timeOfDay: 'morning', timing: 'Before Breakfast', instruction: '', frequency: 'Daily' });
    setShowAddMed(false);
  };

  const today = new Date();
  const isToday = currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Prescription Schedule</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track medications and daily adherence</p>
        </div>
        <button onClick={() => setShowAddMed(!showAddMed)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
          {showAddMed ? <X size={16} /> : <Plus size={16} />}
          {showAddMed ? 'Cancel' : 'Add Medicine'}
        </button>
      </div>

      {/* Add Med Form */}
      {showAddMed && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Medication</h3>
          <form onSubmit={handleAddMed} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Name" required placeholder="e.g. Amoxicillin" value={newMed.name} onChange={v => setNewMed({...newMed, name: v})} />
            <InputField label="Dosage" required placeholder="e.g. 500mg" value={newMed.dosage} onChange={v => setNewMed({...newMed, dosage: v})} />
            <SelectField label="Time of Day" value={newMed.timeOfDay} onChange={v => setNewMed({...newMed, timeOfDay: v})} options={[['morning','Morning'],['evening','Evening']]} />
            <SelectField label="Meal Timing" value={newMed.timing} onChange={v => setNewMed({...newMed, timing: v})} options={[['Before Breakfast','Before Breakfast'],['After Breakfast','After Breakfast'],['Before Lunch','Before Lunch'],['After Lunch','After Lunch'],['Before Dinner','Before Dinner'],['After Dinner','After Dinner'],['Before Bed','Before Bed']]} />
            <SelectField label="Frequency" value={newMed.frequency} onChange={v => setNewMed({...newMed, frequency: v})} options={[['Daily','Daily'],['Weekdays','Weekdays Only'],['Weekends','Weekends Only']]} />
            <InputField label="Instructions (optional)" placeholder="e.g. Take with water" value={newMed.instruction} onChange={v => setNewMed({...newMed, instruction: v})} />
            <div className="md:col-span-3 flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column — calendar + stats */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <div className="flex gap-1">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded transition-colors"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[11px] font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === currentDate.getDate();
                const isTodayDate = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                return (
                  <button
                    key={day}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`h-8 w-full rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                      isSelected ? 'bg-brand-600 text-white' : isTodayDate ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adherence */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-xs font-medium text-slate-500 mb-3">
              {isToday ? "Today's" : `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`} Adherence
            </p>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#0d9488" strokeWidth="3" fill="none"
                  strokeDasharray={`${progressPercent}, 100`} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{takenMeds}/{totalMeds}</span>
                <span className="text-[11px] text-slate-500">taken</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {totalMeds === 0 ? "No meds scheduled" : takenMeds === totalMeds ? "All done! ✓" : `${totalMeds - takenMeds} remaining`}
            </p>
          </div>

          {/* Drug interaction */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Drug Interaction Alert
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Avoid grapefruit juice while taking <strong>Atorvastatin</strong> — it can increase drug levels to unsafe concentrations.
            </p>
          </div>
        </div>

        {/* Right column — schedules */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          <ScheduleBlock title="Morning" emoji="☀️" color="amber" meds={morningMeds} taken={takenHistory[selectedDateStr] || []} onToggle={handleToggleTaken} />
          <ScheduleBlock title="Evening" emoji="🌙" color="blue" meds={eveningMeds} taken={takenHistory[selectedDateStr] || []} onToggle={handleToggleTaken} />
          {morningMeds.length === 0 && eveningMeds.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <Pill size={28} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 mb-1">No Medications</h3>
              <p className="text-sm text-slate-500">Nothing scheduled for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleBlock({ title, emoji, color, meds, taken, onToggle }) {
  if (meds.length === 0) return null;
  const colors = { amber: 'bg-amber-50 border-amber-100 text-amber-800', blue: 'bg-sky-50 border-sky-100 text-sky-800' };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b ${colors[color]} flex items-center gap-2`}>
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-semibold">{title} Schedule</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {meds.map(med => {
          const isTaken = taken.includes(med.id);
          return (
            <div key={med.id} className={`p-5 ${isTaken ? 'bg-emerald-50/40' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    {isTaken ? <CheckCircle size={16} className="text-emerald-500" /> : <Clock size={16} className="text-slate-400" />}
                    {med.name}
                  </h4>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-600">{med.time}</span>
                </div>
                {isTaken ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">Taken</span>
                    <button onClick={() => onToggle(med.id)} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">Undo</button>
                  </div>
                ) : (
                  <button onClick={() => onToggle(med.id)} className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-1.5 rounded-md transition-colors">Mark Taken</button>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3 sm:pl-6">{med.instruction}</p>
              <div className="sm:ml-6 bg-slate-50 border border-slate-100 rounded-lg p-3 relative">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-brand-400 rounded-full" />
                <p className="text-[11px] font-semibold text-brand-700 mb-1 flex items-center gap-1 pl-2">
                  <Bot size={12} /> Why this schedule?
                </p>
                <p className="text-xs text-slate-600 leading-relaxed pl-2">{med.aiReason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InputField({ label, required, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input required={required} type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white cursor-pointer">
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  );
}
