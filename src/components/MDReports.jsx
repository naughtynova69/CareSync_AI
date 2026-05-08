import React, { useState } from 'react';
import {
  Calendar, FileText, CheckCircle, Clock, ChevronRight,
  User, Activity, Pill, HeartPulse, Download, X
} from 'lucide-react';

const YEAR_SCHEDULE = [
  {
    month: "January 2026", status: "past",
    events: [
      { type: "checkup", title: "Annual Physical Exam", date: "Jan 15", doctor: "Dr. Smith", details: "All vitals normal. Blood pressure 120/80. Heart rate 72 bpm.", icon: "User" },
      { type: "test", title: "Comprehensive Metabolic Panel", date: "Jan 16", details: "Fasting blood sugar slightly elevated. Advised diet change.", icon: "Activity" }
    ]
  },
  {
    month: "February 2026", status: "past",
    events: [
      { type: "prescription", title: "Metformin Refill", date: "Feb 10", details: "90-day supply. Take twice daily with meals.", icon: "Pill" }
    ]
  },
  {
    month: "May 2026", status: "current",
    events: [
      { type: "followup", title: "Cardiology Follow-up", date: "May 20", doctor: "Dr. Adams", details: "Discuss recent ECG results and adjust medication if necessary.", icon: "HeartPulse" },
      { type: "test", title: "Lipid Panel & HbA1c", date: "May 18", details: "Lab requested by Dr. Adams before follow-up.", icon: "Activity" }
    ]
  },
  {
    month: "August 2026", status: "upcoming",
    events: [
      { type: "checkup", title: "Dental Cleaning", date: "Aug 05", doctor: "Dr. White", details: "Routine 6-month cleaning and X-rays.", icon: "User" }
    ]
  },
  {
    month: "November 2026", status: "upcoming",
    events: [
      { type: "vaccine", title: "Flu Shot", date: "Nov 12", details: "Available at CareSync Pharmacy walk-in clinic.", icon: "Activity" },
      { type: "prescription", title: "Lisinopril Renewal", date: "Nov 15", details: "Requires blood pressure check prior to renewal.", icon: "Pill" }
    ]
  }
];

const TEST_RESULTS = [
  { 
    title: "Lipid Panel", 
    date: "May 18, 2026", 
    result: "LDL: 110 mg/dL", 
    status: "warning", 
    ref: "Ref: < 100 mg/dL", 
    icon: "Activity",
    details: "Your LDL (bad cholesterol) is slightly elevated. Total Cholesterol: 210 mg/dL, HDL: 45 mg/dL. We recommend reducing saturated fat intake and increasing physical activity."
  },
  { 
    title: "HbA1c Test", 
    date: "May 18, 2026", 
    result: "6.2%", 
    status: "warning", 
    ref: "Ref: < 5.7%", 
    icon: "Activity",
    details: "This result is in the pre-diabetic range (5.7% - 6.4%). It indicates a higher risk for developing Type 2 diabetes. Monitoring carbohydrate intake and regular exercise is advised."
  },
  { 
    title: "Blood Pressure", 
    date: "Jan 15, 2026", 
    result: "120/80", 
    status: "normal", 
    ref: "Ref: < 120/80", 
    icon: "HeartPulse",
    details: "Your blood pressure is at the ideal level. Keep up the healthy habits!"
  },
  { 
    title: "Heart Rate", 
    date: "Jan 15, 2026", 
    result: "72 bpm", 
    status: "normal", 
    ref: "Ref: 60-100 bpm", 
    icon: "Activity",
    details: "Your resting heart rate is healthy and within the normal range for an adult."
  }
];

const HEALTH_HISTORY = [
  { year: "2026", title: "Pre-Diabetes Diagnosis", details: "Elevated HbA1c detected during routine screening." },
  { year: "2025", title: "Hypertension Management", details: "Started daily Lisinopril. BP stable." },
  { year: "2023", title: "Left Knee Surgery", details: "Successful ACL reconstruction. Full recovery." }
];

const ICON_MAP = { User, Activity, Pill, HeartPulse };

export default function MDReports() {
  const [activeView, setActiveView] = useState('records'); // 'records' or 'schedule'
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const activeItem = selectedTest || selectedEvent;

  return (
    <div id="md-report-container" className="max-w-4xl mx-auto space-y-5 pb-8">
      {/* Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            onClick={() => { setSelectedTest(null); setSelectedEvent(null); }} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    {(() => {
                      const IconComp = ICON_MAP[activeItem.icon] || Activity;
                      return <IconComp size={24} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{activeItem.title}</h3>
                    <p className="text-sm text-slate-500">{activeItem.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedTest(null); setSelectedEvent(null); }} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              {activeItem.result && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Result</p>
                    <p className={`text-xl font-bold ${activeItem.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {activeItem.result}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reference Range</p>
                    <p className="text-sm font-semibold text-slate-700">{activeItem.ref}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" /> 
                  {selectedTest ? 'Clinical Interpretation' : 'Appointment Details'}
                </h4>
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {activeItem.details}
                  {activeItem.doctor && (
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60 italic font-medium">
                      Healthcare Provider: {activeItem.doctor}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => { setSelectedTest(null); setSelectedEvent(null); }}
                className="px-6 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            {activeView === 'records' ? 'Health Records' : '2026 Care Schedule'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeView === 'records' ? 'Test results and medical history' : 'Health timeline and visit records'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView(activeView === 'records' ? 'schedule' : 'records')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            {activeView === 'records' ? (
              <><Calendar size={15} /> View Schedule</>
            ) : (
              <><FileText size={15} /> View Records</>
            )}
          </button>
          <button
            id="download-pdf-btn"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Download size={15} /> Export PDF
          </button>
        </div>
      </div>

      {activeView === 'records' ? (
        <div className="space-y-6">
          {/* Test Results */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEST_RESULTS.map((test, i) => {
                const IconComp = ICON_MAP[test.icon] || Activity;
                return (
                  <button 
                    key={i} 
                    onClick={() => setSelectedTest(test)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-left hover:border-brand-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-brand-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                        <IconComp size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">{test.title}</p>
                        <p className="text-[11px] text-slate-400">{test.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${test.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {test.result}
                      </p>
                      <p className="text-[10px] text-slate-400">{test.ref}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* History */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Medical History</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {HEALTH_HISTORY.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded shrink-0">{item.year}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Timeline / Schedule */
        <div className="space-y-4">
          {YEAR_SCHEDULE.map((monthData, idx) => (
            <div key={idx} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              monthData.status === 'current' ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-200'
            }`}>
              <div className={`px-5 py-3 border-b flex items-center justify-between ${
                monthData.status === 'current' ? 'bg-brand-50 border-brand-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2.5">
                  <Calendar size={14} className="text-slate-400" />
                  {monthData.month}
                  {monthData.status === 'current' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700">Current</span>
                  )}
                </h3>
                {monthData.status === 'past' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> Done</span>
                )}
                {monthData.status === 'upcoming' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600"><Clock size={12} /> Scheduled</span>
                )}
              </div>

              <div className="divide-y divide-slate-50">
                {monthData.events.map((evt, eIdx) => {
                  const IconComp = ICON_MAP[evt.icon] || Activity;
                  const typeColors = {
                    checkup: 'bg-sky-50 text-sky-600', followup: 'bg-sky-50 text-sky-600',
                    test: 'bg-violet-50 text-violet-600', prescription: 'bg-emerald-50 text-emerald-600',
                    vaccine: 'bg-amber-50 text-amber-600'
                  };
                  
                  const dateParts = evt.date.split(' ');
                  const monthName = dateParts[0];
                  const dayNum = dateParts[1];

                  return (
                    <button 
                      key={eIdx} 
                      onClick={() => setSelectedEvent(evt)}
                      className="w-full flex gap-4 p-4 hover:bg-slate-50/80 transition-all group text-left border-b border-slate-50 last:border-0"
                    >
                      {/* Bolder, larger date on the left */}
                      <div className="w-16 flex flex-col items-center justify-center shrink-0 border-r border-slate-100 pr-4">
                        <span className="text-2xl font-black text-slate-800 group-hover:text-brand-600 transition-colors leading-none">{dayNum}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{monthName}</span>
                      </div>

                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-1 ${typeColors[evt.type] || 'bg-slate-50 text-slate-600'}`}>
                        <IconComp size={18} />
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{evt.title}</h4>
                        </div>
                        {evt.doctor && <p className="text-xs text-slate-500 mt-0.5 font-medium">{evt.doctor}</p>}
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-1">{evt.details}</p>
                        
                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-brand-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronRight size={10} />
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-400 self-center shrink-0 transition-colors hidden sm:block" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
