import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Smile, Frown, Meh, Moon, Droplets, Zap,
  TrendingUp, Brain, Loader2, Calendar, ChevronLeft,
  ChevronRight, Trash2, Sparkles
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MOODS = [
  { value: 5, label: 'Great', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', activeBg: 'bg-emerald-500 text-white' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-teal-500', bg: 'bg-teal-50 border-teal-200', activeBg: 'bg-teal-500 text-white' },
  { value: 3, label: 'Okay', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', activeBg: 'bg-amber-500 text-white' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', activeBg: 'bg-orange-500 text-white' },
  { value: 1, label: 'Bad', icon: Frown, color: 'text-red-500', bg: 'bg-red-50 border-red-200', activeBg: 'bg-red-500 text-white' },
];

const ENERGY_LEVELS = [1, 2, 3, 4, 5];

export default function HealthLog() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('caresync_health_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [entry, setEntry] = useState({ mood: 3, sleep: 7, water: 8, energy: 3, notes: '' });
  const [aiInsight, setAiInsight] = useState(null);
  const [streamingInsight, setStreamingInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('caresync_health_logs', JSON.stringify(logs));
  }, [logs]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedToday = logs.some(l => l.date === todayStr);

  const handleSaveEntry = () => {
    const log = {
      id: Date.now().toString(),
      date: todayStr,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    // Replace if already logged today
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== todayStr);
      return [...filtered, log];
    });
    setShowAdd(false);
    setEntry({ mood: 3, sleep: 7, water: 8, energy: 3, notes: '' });
  };

  const deleteLog = (id) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const getAIInsights = async () => {
    if (logs.length < 3) return;
    setIsAnalyzing(true);
    setAiInsight(null);
    setStreamingInsight('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing.');

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const recentLogs = logs.slice(-14).map(l => ({
        date: l.date,
        mood: MOODS.find(m => m.value === l.mood)?.label,
        sleep_hours: l.sleep,
        water_glasses: l.water,
        energy: l.energy,
        notes: l.notes || 'none',
      }));

      const prompt = `You are a health analytics AI. Analyze these daily health logs from a patient:

${JSON.stringify(recentLogs, null, 2)}

Identify patterns and correlations. Respond in markdown with:

## Overall Trends
Brief summary of the patient's health trajectory over these entries.

## Key Patterns Detected
- List specific correlations you notice (e.g., "Your energy drops on days with less than 6 hours of sleep")
- Include mood vs sleep, hydration vs energy, etc.

## Recommendations
- 3-4 actionable, personalized suggestions based on the data

## Weekly Focus
One specific thing the patient should focus on this week based on their weakest metric.

Be warm, encouraging, and specific with data references.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash'];
      let accumulated = '';
      let streamed = false;

      for (const model of modelsToTry) {
        try {
          const stream = await ai.models.generateContentStream({ model, contents: prompt });
          accumulated = '';
          for await (const chunk of stream) {
            accumulated += chunk.text || '';
            setStreamingInsight(accumulated);
          }
          streamed = true;
          break;
        } catch (e) {
          if (model === modelsToTry[modelsToTry.length - 1]) throw e;
        }
      }

      setStreamingInsight('');
      setAiInsight(accumulated || 'No response received.');
    } catch (err) {
      setAiInsight(`**Error:** ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stats
  const last7 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const weekStart = d.toISOString().split('T')[0];
    return logs.filter(l => l.date >= weekStart);
  }, [logs]);

  const avgSleep = last7.length ? (last7.reduce((s, l) => s + l.sleep, 0) / last7.length).toFixed(1) : '--';
  const avgMood = last7.length ? (last7.reduce((s, l) => s + l.mood, 0) / last7.length).toFixed(1) : '--';
  const avgWater = last7.length ? (last7.reduce((s, l) => s + l.water, 0) / last7.length).toFixed(1) : '--';
  const avgEnergy = last7.length ? (last7.reduce((s, l) => s + l.energy, 0) / last7.length).toFixed(1) : '--';

  // Simple bar chart data (last 7 entries)
  const chartData = useMemo(() => logs.slice(-7), [logs]);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Daily Health Log</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track mood, sleep, hydration, and energy — get AI insights</p>
        </div>
        <div className="flex gap-2">
          {logs.length >= 3 && (
            <button onClick={getAIInsights} disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50">
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              AI Insights
            </button>
          )}
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
            {showAdd ? <></> : <Plus size={16} />}
            {showAdd ? 'Cancel' : hasLoggedToday ? 'Update Today' : 'Log Today'}
          </button>
        </div>
      </div>

      {/* Log Entry Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5" style={{ animation: 'notifSlideIn 0.2s ease-out' }}>
          <h3 className="text-base font-semibold text-slate-800 mb-5">How are you today?</h3>

          {/* Mood */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-2">Mood</label>
            <div className="flex gap-2">
              {MOODS.map(m => {
                const Icon = m.icon;
                const active = entry.mood === m.value;
                return (
                  <button key={m.value} onClick={() => setEntry({ ...entry, mood: m.value })}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-sm font-medium transition-all ${active ? m.activeBg + ' border-transparent shadow-sm' : m.bg + ' ' + m.color + ' hover:shadow-sm'}`}>
                    <Icon size={20} />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {/* Sleep */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <Moon size={13} className="text-indigo-500" /> Sleep (hours)
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="14" step="0.5" value={entry.sleep}
                  onChange={e => setEntry({ ...entry, sleep: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-500" />
                <span className="text-sm font-bold text-slate-800 w-8 text-center">{entry.sleep}</span>
              </div>
            </div>

            {/* Water */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <Droplets size={13} className="text-blue-500" /> Water (glasses)
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="16" step="1" value={entry.water}
                  onChange={e => setEntry({ ...entry, water: parseInt(e.target.value) })}
                  className="flex-1 accent-blue-500" />
                <span className="text-sm font-bold text-slate-800 w-8 text-center">{entry.water}</span>
              </div>
            </div>

            {/* Energy */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-500" /> Energy Level
              </label>
              <div className="flex gap-1.5">
                {ENERGY_LEVELS.map(lvl => (
                  <button key={lvl} onClick={() => setEntry({ ...entry, energy: lvl })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${entry.energy >= lvl ? 'bg-amber-400 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes (optional)</label>
            <textarea value={entry.notes} onChange={e => setEntry({ ...entry, notes: e.target.value })}
              placeholder="Anything notable? Exercise, stress, meals..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none placeholder:text-slate-400" />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveEntry} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Sleep', value: avgSleep, unit: 'hrs', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg Mood', value: avgMood, unit: '/5', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Water', value: avgWater, unit: 'cups', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Energy', value: avgEnergy, unit: '/5', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{label}</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">Last 7 days</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Mini Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-slate-500" /> Recent Trends
          </h3>
          {chartData.length === 0 ? (
            <div className="text-center py-10">
              <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Log entries to see trends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Sleep bars */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1"><Moon size={11} className="text-indigo-500" /> Sleep</p>
                <div className="flex items-end gap-1 h-16">
                  {chartData.map(l => (
                    <div key={l.id} className="flex-1 flex flex-col items-center gap-1" title={`${l.date}: ${l.sleep}h`}>
                      <div className="w-full bg-indigo-200 rounded-t-sm" style={{ height: `${Math.max((l.sleep / 14) * 100, 5)}%` }} />
                      <span className="text-[9px] text-slate-400">{l.sleep}h</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Energy bars */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1"><Zap size={11} className="text-amber-500" /> Energy</p>
                <div className="flex items-end gap-1 h-12">
                  {chartData.map(l => (
                    <div key={l.id} className="flex-1 flex flex-col items-center gap-1" title={`${l.date}: ${l.energy}/5`}>
                      <div className="w-full bg-amber-200 rounded-t-sm" style={{ height: `${Math.max((l.energy / 5) * 100, 10)}%` }} />
                      <span className="text-[9px] text-slate-400">{l.energy}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mood dots */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1"><Smile size={11} className="text-emerald-500" /> Mood</p>
                <div className="flex gap-1">
                  {chartData.map(l => {
                    const moodColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-teal-400', 'bg-emerald-400'];
                    return (
                      <div key={l.id} className="flex-1 flex flex-col items-center gap-1" title={`${l.date}: ${MOODS.find(m => m.value === l.mood)?.label}`}>
                        <div className={`w-6 h-6 rounded-full ${moodColors[l.mood]} mx-auto`} />
                        <span className="text-[9px] text-slate-400">{l.mood}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Sparkles size={15} className="text-purple-500" /> AI Health Insights
          </h3>
          {isAnalyzing && streamingInsight ? (
              <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 max-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(streamingInsight)) }} />
            ) : isAnalyzing ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mt-4" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
          ) : aiInsight ? (
            <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 max-h-[400px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(aiInsight)) }} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Brain size={22} className="text-purple-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">No insights yet</p>
              <p className="text-xs text-slate-400 max-w-[240px]">
                {logs.length < 3
                  ? `Log at least 3 days of data to unlock AI insights. (${logs.length}/3 entries)`
                  : 'Click "AI Insights" to analyze your health patterns.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Log History</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {[...logs].reverse().map(log => {
              const moodInfo = MOODS.find(m => m.value === log.mood);
              const MoodIcon = moodInfo?.icon || Meh;
              return (
                <div key={log.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${moodInfo?.bg || 'bg-slate-100'}`}>
                    <MoodIcon size={16} className={moodInfo?.color || 'text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{log.date}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Moon size={10} /> {log.sleep}h</span>
                      <span className="flex items-center gap-1"><Droplets size={10} /> {log.water} cups</span>
                      <span className="flex items-center gap-1"><Zap size={10} /> {log.energy}/5</span>
                    </div>
                  </div>
                  {log.notes && <p className="text-xs text-slate-400 max-w-[200px] truncate hidden sm:block">{log.notes}</p>}
                  <button onClick={() => deleteLog(log.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
