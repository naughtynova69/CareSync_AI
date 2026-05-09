import React, { useState } from 'react';
import {
  Calculator, Utensils, Loader2, RotateCcw, Activity,
  TrendingDown, TrendingUp, Minus, Scale, Ruler, User,
  Calendar, Sparkles, ArrowRight
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const BMI_CATEGORIES = [
  { range: [0, 18.5], label: 'Underweight', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', barColor: 'bg-blue-400', icon: TrendingDown },
  { range: [18.5, 25], label: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-400', icon: Minus },
  { range: [25, 30], label: 'Overweight', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', barColor: 'bg-amber-400', icon: TrendingUp },
  { range: [30, 100], label: 'Obese', color: 'text-red-700', bg: 'bg-red-50 border-red-200', barColor: 'bg-red-400', icon: TrendingUp },
];

const SAMPLE_MEALS = [
  '2 eggs, 2 toast with butter, orange juice, and a banana for breakfast',
  'Grilled chicken salad with olive oil dressing, a roll, and iced tea for lunch',
  'Rice, dal, paneer butter masala, 2 rotis, and a glass of buttermilk',
  'Pasta with tomato sauce, garlic bread, caesar salad, and a coke',
];

export default function BMINutrition() {
  const [profile, setProfile] = useState({ age: '', weight: '', height: '', unit: 'metric' });
  const [meals, setMeals] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateBMI = () => {
    const w = parseFloat(profile.weight);
    const h = parseFloat(profile.height);
    if (!w || !h) return null;

    let bmiVal;
    if (profile.unit === 'metric') {
      const hm = h / 100;
      bmiVal = w / (hm * hm);
    } else {
      bmiVal = (w / (h * h)) * 703;
    }
    return Math.round(bmiVal * 10) / 10;
  };

  const handleAnalyze = async (overrideMeal) => {
    const mealText = overrideMeal || meals;
    if (!profile.age || !profile.weight || !profile.height) {
      setError('Please fill in age, weight, and height.');
      return;
    }
    if (!mealText.trim()) {
      setError('Please describe your meals.');
      return;
    }

    if (overrideMeal) setMeals(overrideMeal);
    setError('');
    setIsLoading(true);
    setAiResult(null);
    setStreamingText('');

    // Calculate BMI
    const bmiVal = calculateBMI();
    setBmi(bmiVal);
    const cat = BMI_CATEGORIES.find(c => bmiVal >= c.range[0] && bmiVal < c.range[1]);
    setBmiCategory(cat);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing.');

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const unitLabel = profile.unit === 'metric' ? 'kg/cm' : 'lbs/inches';

      const prompt = `You are a clinical nutritionist AI. A patient provides their profile and a day's meals:

**Profile:**
- Age: ${profile.age}
- Weight: ${profile.weight} ${profile.unit === 'metric' ? 'kg' : 'lbs'}
- Height: ${profile.height} ${profile.unit === 'metric' ? 'cm' : 'inches'}
- BMI: ${bmiVal} (${cat?.label || 'Unknown'})

**Today's Meals (plain text):**
${mealText}

Analyze and respond in markdown:

## Caloric Estimate
Estimated total calories for the day with a brief breakdown by meal.

## Macronutrient Breakdown
Provide estimated grams and percentages:
- Protein
- Carbohydrates
- Fats
- Fiber

Format as a clean table if possible.

## Assessment
- Is this intake appropriate for their BMI category and age?
- Any nutritional gaps or excesses?

## Diet Suggestions
3-4 specific, actionable suggestions to improve their diet. Be practical and culturally aware based on the foods listed.

## Daily Targets
Recommended daily caloric and macro targets based on their profile.

Be specific with numbers. Use encouraging language.`;

      const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash'];
      let accumulated = '';
      let streamed = false;

      for (const model of modelsToTry) {
        try {
          const stream = await ai.models.generateContentStream({ model, contents: prompt });
          accumulated = '';
          for await (const chunk of stream) {
            accumulated += chunk.text || '';
            setStreamingText(accumulated);
          }
          streamed = true;
          break;
        } catch (e) {
          if (model === modelsToTry[modelsToTry.length - 1]) throw e;
        }
      }

      setStreamingText('');
      setAiResult(accumulated || 'No response received.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfile({ age: '', weight: '', height: '', unit: 'metric' });
    setMeals('');
    setBmi(null);
    setBmiCategory(null);
    setAiResult(null);
    setStreamingText('');
    setError('');
  };

  const CatIcon = bmiCategory?.icon;

  // BMI gauge position (0-40 scale mapped to 0-100%)
  const gaugePosition = bmi ? Math.min(Math.max(((bmi - 10) / 35) * 100, 0), 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">BMI & Nutrition Snapshot</h2>
        <p className="text-sm text-slate-500 mt-0.5">Get your BMI, caloric estimate, and personalized diet suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left — Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User size={15} className="text-slate-500" /> Your Profile
            </h3>

            {/* Unit toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 mb-4">
              {[['metric', 'Metric (kg/cm)'], ['imperial', 'Imperial (lbs/in)']].map(([val, lbl]) => (
                <button key={val} onClick={() => setProfile({ ...profile, unit: val })}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${profile.unit === val ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {lbl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar size={10} /> Age</label>
                <input type="number" min="1" max="120" placeholder="25" value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-center" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1"><Scale size={10} /> Weight</label>
                <input type="number" min="1" placeholder={profile.unit === 'metric' ? '70' : '154'} value={profile.weight}
                  onChange={e => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-center" />
                <span className="text-[10px] text-slate-400 text-center block mt-0.5">{profile.unit === 'metric' ? 'kg' : 'lbs'}</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1"><Ruler size={10} /> Height</label>
                <input type="number" min="1" placeholder={profile.unit === 'metric' ? '175' : '69'} value={profile.height}
                  onChange={e => setProfile({ ...profile, height: e.target.value })}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-center" />
                <span className="text-[10px] text-slate-400 text-center block mt-0.5">{profile.unit === 'metric' ? 'cm' : 'inches'}</span>
              </div>
            </div>

            {/* BMI Result */}
            {bmi && bmiCategory && (
              <div className={`${bmiCategory.bg} border rounded-xl p-4 mb-4`} style={{ animation: 'notifSlideIn 0.2s ease-out' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-medium ${bmiCategory.color} uppercase tracking-wider`}>Your BMI</p>
                  <div className="flex items-center gap-1">
                    <CatIcon size={14} className={bmiCategory.color} />
                    <span className={`text-xs font-bold ${bmiCategory.color}`}>{bmiCategory.label}</span>
                  </div>
                </div>
                <p className={`text-3xl font-display font-bold ${bmiCategory.color}`}>{bmi}</p>
                {/* Gauge */}
                <div className="mt-3 relative h-2 bg-gradient-to-r from-blue-300 via-emerald-300 via-amber-300 to-red-300 rounded-full">
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-700 rounded-full shadow-sm transition-all duration-500"
                    style={{ left: `calc(${gaugePosition}% - 6px)` }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            )}
          </div>

          {/* Meals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Utensils size={15} className="text-slate-500" /> Today's Meals
            </h3>
            <textarea value={meals} onChange={e => setMeals(e.target.value)}
              placeholder="Describe all meals today, e.g.:&#10;Breakfast: 2 eggs, toast, coffee&#10;Lunch: chicken rice bowl with vegetables&#10;Dinner: pasta with tomato sauce, salad"
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none placeholder:text-slate-400" />

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">{error}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleAnalyze()}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40">
                {isLoading ? (
                  <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Calculator size={15} /> Analyze</>
                )}
              </button>
              {aiResult && (
                <button onClick={handleReset} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick meals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Sample Meals
            </h3>
            <div className="space-y-1.5">
              {SAMPLE_MEALS.map((s, i) => (
                <button key={i} onClick={() => handleAnalyze(s)} disabled={isLoading || !profile.age || !profile.weight || !profile.height}
                  className="w-full text-left text-sm text-slate-600 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-100 hover:border-brand-200 rounded-lg px-3.5 py-2.5 transition-colors flex items-center justify-between group disabled:opacity-50">
                  <span className="line-clamp-1">{s}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 shrink-0 ml-2 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Activity size={15} className="text-slate-500" /> Nutrition Analysis
            </h3>
            {isLoading && streamingText ? (
              <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 prose-a:text-brand-600 prose-table:text-sm"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(streamingText)) }} />
            ) : isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mt-4" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mt-4" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            ) : aiResult ? (
              <div className="prose prose-sm prose-slate max-w-none prose-p:my-1.5 prose-headings:font-semibold prose-headings:text-slate-800 prose-li:my-0.5 prose-a:text-brand-600 prose-table:text-sm"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(aiResult)) }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calculator size={22} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">No analysis yet</p>
                <p className="text-xs text-slate-400 max-w-[260px]">Fill in your profile, describe today's meals, and click "Analyze" for a detailed BMI and nutrition breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
