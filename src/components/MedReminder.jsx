import React, { useState, useEffect } from 'react';
import {
  Pill, Plus, X, AlertTriangle, Shield, Clock, Trash2,
  Bell, BellOff, Loader2, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function MedReminder() {
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('caresync_med_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'daily', time: '08:00' });
  const [checkMeds, setCheckMeds] = useState([]);
  const [interactionResult, setInteractionResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState(true);
  const [activeReminders, setActiveReminders] = useState({});

  // Persist
  useEffect(() => {
    localStorage.setItem('caresync_med_reminders', JSON.stringify(medications));
  }, [medications]);

  // Timer-based reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hh}:${mm}`;

      medications.forEach(med => {
        if (med.reminderEnabled && med.time === currentTime && !activeReminders[med.id]) {
          setActiveReminders(prev => ({ ...prev, [med.id]: true }));
          if (Notification.permission === 'granted') {
            new Notification(`💊 Medication Reminder`, { body: `Time to take ${med.name} ${med.dosage}` });
          }
          // Auto-clear after 60s
          setTimeout(() => {
            setActiveReminders(prev => { const n = { ...prev }; delete n[med.id]; return n; });
          }, 60000);
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [medications, activeReminders]);

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;
    const med = {
      id: Date.now().toString(),
      name: newMed.name.trim(),
      dosage: newMed.dosage.trim(),
      frequency: newMed.frequency,
      time: newMed.time,
      reminderEnabled: true,
      addedAt: new Date().toISOString(),
    };
    setMedications(prev => [...prev, med]);
    setNewMed({ name: '', dosage: '', frequency: 'daily', time: '08:00' });
    setShowAdd(false);
  };

  const removeMed = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const toggleReminder = (id) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, reminderEnabled: !m.reminderEnabled } : m));
  };

  const toggleCheckMed = (id) => {
    setCheckMeds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const requestNotifPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const checkInteractions = async () => {
    const selected = medications.filter(m => checkMeds.includes(m.id));
    if (selected.length < 2) return;

    setIsChecking(true);
    setInteractionResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing.');

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const medList = selected.map(m => `${m.name} ${m.dosage} (${m.frequency})`).join(', ');

      const prompt = `You are a clinical pharmacologist AI assistant. A patient is taking these medications simultaneously: ${medList}

Analyze potential drug-drug interactions. Respond in markdown with these sections:

## Interaction Summary
A brief overview of whether significant interactions exist.

## Detailed Interactions
For each pair that interacts:
- **[Drug A] + [Drug B]**: Severity (Minor / Moderate / Major / Contraindicated), mechanism, and clinical effect.

## Risk Level
Overall risk assessment: Low Risk / Moderate Risk / High Risk / Critical

## Recommendations
- Actionable steps the patient should take
- Whether to consult their doctor

## Disclaimer
Brief note this is AI-generated and should be verified by a pharmacist.

If no significant interactions exist, clearly state that.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash'];
      let aiText = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({ model, contents: prompt });
          aiText = response.text;
          break;
        } catch (e) {
          if (model === modelsToTry[modelsToTry.length - 1]) throw e;
        }
      }

      setInteractionResult(aiText || 'No response received.');
    } catch (err) {
      setInteractionResult(`**Error:** ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const freqLabels = { daily: 'Daily', twice: 'Twice daily', weekly: 'Weekly', asneeded: 'As needed' };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Medication Reminders</h2>
          <p className="text-sm text-slate-500 mt-0.5">Set reminders and check drug interactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={requestNotifPermission}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Bell size={14} /> Enable Alerts
          </button>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
            {showAdd ? <X size={16} /> : <Plus size={16} />}
            {showAdd ? 'Cancel' : 'Add Med'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5" style={{ animation: 'notifSlideIn 0.2s ease-out' }}>
          <h3 className="text-base font-semibold text-slate-800 mb-4">New Medication</h3>
          <form onSubmit={handleAddMed} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input required type="text" placeholder="e.g. Metformin" value={newMed.name}
                onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dosage *</label>
              <input required type="text" placeholder="e.g. 500mg" value={newMed.dosage}
                onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
              <select value={newMed.frequency} onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white cursor-pointer">
                <option value="daily">Daily</option>
                <option value="twice">Twice daily</option>
                <option value="weekly">Weekly</option>
                <option value="asneeded">As needed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reminder Time</label>
              <input type="time" value={newMed.time} onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" />
            </div>
            <div className="md:col-span-4 flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
                Save Medication
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Reminder Alerts */}
      {Object.keys(activeReminders).length > 0 && (
        <div className="space-y-2">
          {Object.keys(activeReminders).map(id => {
            const med = medications.find(m => m.id === id);
            if (!med) return null;
            return (
              <div key={id} className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center gap-3 animate-pulse" >
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                  <Bell size={16} className="text-brand-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-800">💊 Time to take {med.name} {med.dosage}</p>
                  <p className="text-xs text-brand-600 mt-0.5">{freqLabels[med.frequency]} reminder</p>
                </div>
                <button onClick={() => setActiveReminders(prev => { const n = { ...prev }; delete n[id]; return n; })}
                  className="text-xs font-medium text-brand-600 hover:text-brand-800 px-3 py-1.5 bg-white border border-brand-200 rounded-lg">
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Medication List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Pill size={15} className="text-brand-600" /> Your Medications
            </h3>
            <span className="text-xs text-slate-400">{medications.length} meds</span>
          </div>
          {medications.length === 0 ? (
            <div className="p-10 text-center">
              <Pill size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">No medications added</p>
              <p className="text-xs text-slate-400">Add your prescriptions to get reminders and interaction checks.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {medications.map(med => (
                <div key={med.id} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={checkMeds.includes(med.id)} onChange={() => toggleCheckMed(med.id)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{med.name} <span className="font-normal text-slate-500">{med.dosage}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{freqLabels[med.frequency]}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {med.time}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleReminder(med.id)} title={med.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                    className={`p-1.5 rounded-md transition-colors ${med.reminderEnabled ? 'text-brand-600 bg-brand-50 hover:bg-brand-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                    {med.reminderEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                  </button>
                  <button onClick={() => removeMed(med.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {medications.length >= 2 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <button onClick={checkInteractions}
                disabled={checkMeds.length < 2 || isChecking}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isChecking ? (
                  <><Loader2 size={15} className="animate-spin" /> Checking...</>
                ) : (
                  <><Zap size={15} /> Check Interactions ({checkMeds.length} selected)</>
                )}
              </button>
              {checkMeds.length < 2 && medications.length >= 2 && (
                <p className="text-[11px] text-slate-400 text-center mt-2">Select at least 2 medications to check</p>
              )}
            </div>
          )}
        </div>

        {/* Interaction Results */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Shield size={15} className="text-slate-500" /> Interaction Analysis
            </h3>
            {interactionResult && (
              <button onClick={() => setExpandedInteraction(!expandedInteraction)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
                {expandedInteraction ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
          {isChecking ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mt-4" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          ) : interactionResult && expandedInteraction ? (
            <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 max-h-[400px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(interactionResult)) }} />
          ) : !interactionResult ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">No interaction check yet</p>
              <p className="text-xs text-slate-400 max-w-[240px]">Select 2 or more medications from your list and click "Check Interactions" to analyze.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
