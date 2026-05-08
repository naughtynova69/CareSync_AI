import React, { useState } from 'react';
import {
  Search, AlertTriangle, ShieldCheck, Siren, ArrowRight,
  Thermometer, Clock, Sparkles, RotateCcw, Loader2
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const QUICK_SYMPTOMS = [
  'Persistent headache for 3 days',
  'Chest tightness and shortness of breath',
  'Mild sore throat with runny nose',
  'Sharp abdominal pain after eating',
  'Skin rash with itching on arms',
  'Feeling dizzy and lightheaded',
];

const TRIAGE_STYLES = {
  'self-care': {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800',
    icon: ShieldCheck, iconColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700',
    label: 'Self-Care', description: 'Manageable at home with rest and OTC remedies',
    ring: 'ring-emerald-200',
  },
  'see-doctor': {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800',
    icon: Clock, iconColor: 'text-amber-600', badge: 'bg-amber-100 text-amber-700',
    label: 'See a Doctor', description: 'Schedule an appointment within 24–48 hours',
    ring: 'ring-amber-200',
  },
  'emergency': {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800',
    icon: Siren, iconColor: 'text-red-600', badge: 'bg-red-100 text-red-700',
    label: 'Emergency', description: 'Seek immediate medical attention — call 911',
    ring: 'ring-red-200',
  },
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);       // { triage, analysis }
  const [error, setError] = useState('');

  const handleCheck = async (overrideText) => {
    const text = overrideText || symptoms;
    if (!text.trim()) return;

    setSymptoms(text);
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing. Add VITE_GEMINI_API_KEY to .env');

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a medical triage assistant (not a doctor). A patient describes their symptoms: "${text}"

Analyze the symptoms and respond with:
1. A triage level — one of: self-care, see-doctor, emergency
2. A detailed but concise assessment

IMPORTANT: Start your response with a JSON block enclosed in \`\`\`json and \`\`\` with this exact format:
{
  "triage": "self-care"
}

Then provide your markdown assessment with these sections:
## Assessment
Brief summary of what the symptoms might indicate (avoid definitive diagnoses — use "may suggest", "could indicate").

## Recommended Actions
- Bullet list of steps the patient should take

## Warning Signs
- Signs that would escalate urgency (e.g., "Seek emergency care if...")

## Disclaimer
Brief reminder this is not a medical diagnosis.`;

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

      if (!aiText) throw new Error('No response from AI.');

      // Extract triage level
      let triage = 'see-doctor'; // default
      const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (['self-care', 'see-doctor', 'emergency'].includes(parsed.triage)) {
            triage = parsed.triage;
          }
        } catch (_) {}
        aiText = aiText.replace(/```json\n[\s\S]*?\n```/, '').trim();
      }

      setResult({ triage, analysis: aiText });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
    setError('');
  };

  const triageInfo = result ? TRIAGE_STYLES[result.triage] : null;
  const TriageIcon = triageInfo?.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Symptom Checker</h2>
        <p className="text-sm text-slate-500 mt-0.5">Describe your symptoms for an AI-powered urgency assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — Input */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Thermometer size={15} className="text-slate-500" /> Describe Symptoms
            </h3>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I've had a persistent headache for 3 days, along with mild fever and neck stiffness..."
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none placeholder:text-slate-400"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleCheck()}
                disabled={!symptoms.trim() || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Search size={15} /> Check Symptoms</>
                )}
              </button>
              {result && (
                <button
                  onClick={handleReset}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick picks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Common Symptoms
            </h3>
            <div className="space-y-1.5">
              {QUICK_SYMPTOMS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleCheck(s)}
                  disabled={isLoading}
                  className="w-full text-left text-sm text-slate-600 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-100 hover:border-brand-200 rounded-lg px-3.5 py-2.5 transition-colors flex items-center justify-between group disabled:opacity-50"
                >
                  {s}
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Result */}
        <div className="lg:col-span-3 space-y-5">
          {/* Triage Badge */}
          {result && triageInfo && (
            <div className={`${triageInfo.bg} border ${triageInfo.border} rounded-xl p-5 ring-1 ${triageInfo.ring}`}
              style={{ animation: 'notifSlideIn 0.25s ease-out' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${triageInfo.badge} flex items-center justify-center`}>
                  <TriageIcon size={20} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${triageInfo.text} uppercase tracking-wider`}>Triage Level</p>
                  <p className={`text-lg font-display font-bold ${triageInfo.text}`}>{triageInfo.label}</p>
                </div>
              </div>
              <p className={`text-sm ${triageInfo.text} opacity-80`}>{triageInfo.description}</p>
            </div>
          )}

          {/* Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">AI Assessment</h3>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mt-4" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            ) : result ? (
              <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 prose-a:text-brand-600"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(result.analysis)) }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={22} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">No assessment yet</p>
                <p className="text-xs text-slate-400 max-w-[240px]">Describe your symptoms or pick a common one to receive an AI-powered triage assessment.</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Medical Disclaimer</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This tool is for informational purposes only and does not provide medical diagnoses. Always consult a qualified healthcare professional for medical advice. In emergencies, call your local emergency number immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
