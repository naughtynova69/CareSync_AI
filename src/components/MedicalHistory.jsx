import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Image, BarChart2, Upload, Plus, Trash2, Download,
  Search, Filter, X, Eye, Lock, CheckCircle2, Clock, Tag,
  AlertCircle, Loader2, FileImage, FileBarChart, File, BookOpen,
  Stethoscope, PenLine, ChevronDown
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const CATEGORIES = [
  { value: 'general', label: 'General', icon: File, color: 'text-slate-600', bg: 'bg-slate-100' },
  { value: 'prescription', label: 'Prescription', icon: Stethoscope, color: 'text-brand-600', bg: 'bg-brand-50' },
  { value: 'lab_report', label: 'Lab Report', icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'scan', label: 'Scan / Imaging', icon: FileImage, color: 'text-violet-600', bg: 'bg-violet-50' },
  { value: 'doctor_note', label: "Doctor's Note", icon: PenLine, color: 'text-teal-600', bg: 'bg-teal-50' },
  { value: 'test_graph', label: 'Test Graph', icon: FileBarChart, color: 'text-rose-600', bg: 'bg-rose-50' },
  { value: 'other', label: 'Other', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const getCat = (val) => CATEGORIES.find(c => c.value === val) || CATEGORIES[0];

function RecordCard({ record, onDelete, onView }) {
  const cat = getCat(record.category);
  const Icon = cat.icon;
  const date = new Date(record.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={cat.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-800 leading-tight line-clamp-1">{record.title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              {record.is_encrypted ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                  <Lock size={9} /> Secured
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[11px] font-medium ${cat.color} ${cat.bg} px-1.5 py-0.5 rounded-md`}>{cat.label}</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={10} />{date}</span>
            {record.file_name && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1"><File size={10} />{record.file_name}</span>
            )}
          </div>
          {record.content && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{record.content.replace(/#{1,6}\s?|[*_]/g, '').trim()}</p>
          )}
          {record.notes && (
            <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">📝 {record.notes}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => onView(record)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Eye size={12} /> View
        </button>
        {record.file_name && (
          <a
            href={`/api/medical-history/${record.user_id}/file/${record.id}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download size={12} /> Download
          </a>
        )}
        <button
          onClick={() => onDelete(record.id)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

function ViewModal({ record, onClose }) {
  if (!record) return null;
  const cat = getCat(record.category);
  const Icon = cat.icon;
  const date = new Date(record.uploaded_at).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
              <Icon size={18} className={cat.color} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{record.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cat.label} · {date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {record.is_encrypted && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-medium text-emerald-700">
              <Lock size={12} /> This record is marked as secured/encrypted
            </div>
          )}

          {record.content && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Content</p>
              <div className="prose prose-sm prose-slate max-w-none bg-slate-50 rounded-lg p-4 border border-slate-100"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(record.content)) }} />
            </div>
          )}

          {record.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Doctor's Notes</p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-lg p-3 leading-relaxed">{record.notes}</p>
            </div>
          )}

          {record.file_name && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attached File</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <File size={16} className="text-slate-500" />
                <span className="text-sm text-slate-700 flex-1">{record.file_name}</span>
                <a
                  href={`/api/medical-history/${record.user_id}/file/${record.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MedicalHistory({ userId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [viewRecord, setViewRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '', category: 'general', content: '', notes: '',
    fileName: '', fileType: '', fileData: '',
    inputMode: 'text', // 'text' | 'file'
  });

  const loadRecords = () => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/medical-history/${userId}`)
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRecords(); }, [userId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert('File too large (max 20 MB)'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setForm(f => ({ ...f, fileName: file.name, fileType: file.type, fileData: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Please enter a title.'); return; }
    if (!form.content.trim() && !form.fileData) { alert('Please add content or attach a file.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/medical-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: form.title.trim(),
          category: form.category,
          content: form.content || null,
          notes: form.notes || null,
          fileName: form.fileName || null,
          fileType: form.fileType || null,
          fileData: form.fileData || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedMsg('Record saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
      setForm({ title: '', category: 'general', content: '', notes: '', fileName: '', fileType: '', fileData: '', inputMode: 'text' });
      setShowAdd(false);
      loadRecords();
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medical record?')) return;
    await fetch(`/api/medical-history/${userId}/${id}`, { method: 'DELETE' });
    loadRecords();
  };

  const filtered = records.filter(r => {
    const matchCat = filterCat === 'all' || r.category === filterCat;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || (r.content && r.content.toLowerCase().includes(q)) || (r.notes && r.notes.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Medical History</h2>
          <p className="text-sm text-slate-500 mt-0.5">Store, organise, and review your complete health records securely</p>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-700">
          <CheckCircle2 size={15} /> {savedMsg}
        </div>
      )}

      {/* ── Add Record Form ── */}
      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4" style={{ animation: 'notifSlideIn 0.2s ease-out' }}>
          <h3 className="text-base font-bold text-slate-800">New Medical Record</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title <span className="text-red-400">*</span></label>
              <input
                type="text" placeholder="e.g. Blood Test Report – Jan 2025"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
              <select
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 bg-white cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Input mode toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Input Method</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setForm(f => ({ ...f, inputMode: 'text' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${form.inputMode === 'text' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <PenLine size={13} /> Type Text
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, inputMode: 'file' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${form.inputMode === 'file' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <Upload size={13} /> Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Text input */}
          {form.inputMode === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Content <span className="text-slate-400 font-normal">(supports Markdown for formatting)</span>
              </label>
              <textarea
                rows={8}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={`Type or paste the medical content here. You can use:
- **bold text** for important values
- ## Headings for sections
- - bullet points for lists

Example:
## CBC Report
- WBC: **7.2 × 10³/μL** (Normal)
- RBC: 5.1 × 10⁶/μL
- Haemoglobin: **14.8 g/dL** ✓`}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono resize-y leading-relaxed"
              />
            </div>
          )}

          {/* File upload */}
          {form.inputMode === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Upload File</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${form.fileName ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect}
                  accept="image/*,.pdf,.txt,.doc,.docx,.csv,.png,.jpg,.jpeg,.svg,.xls,.xlsx" />
                {form.fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 size={24} className="text-brand-500" />
                    <p className="text-sm font-semibold text-brand-700">{form.fileName}</p>
                    <p className="text-xs text-slate-500">{form.fileType}</p>
                    <button onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, fileName: '', fileType: '', fileData: '' })); }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <X size={11} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Images (JPG, PNG), Word, Excel, CSV, TXT — max 20 MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Doctor's notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Doctor's Notes / Additional Info</label>
            <input
              type="text" placeholder="e.g. Dr. Patel recommends follow-up in 3 months"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Encryption notice */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <Lock size={13} className="text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700">This record will be flagged as <strong>secured</strong> in the database. Medical data protection is active.</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search records…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
          />
        </div>
        <select
          value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-brand-500 cursor-pointer text-slate-700"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Records', value: records.length, color: 'text-brand-600' },
          { label: 'Secured', value: records.filter(r => r.is_encrypted).length, color: 'text-emerald-600' },
          { label: 'With Files', value: records.filter(r => r.file_name).length, color: 'text-violet-600' },
          { label: 'Text Notes', value: records.filter(r => r.content && !r.file_name).length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Records Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <FileText size={36} className="text-slate-200 mx-auto mb-4" />
          <p className="text-base font-semibold text-slate-500 mb-1">
            {records.length === 0 ? 'No medical records yet' : 'No records match your search'}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {records.length === 0
              ? 'Upload lab reports, scans, prescriptions, or type in doctor notes.'
              : 'Try a different search term or category filter.'}
          </p>
          {records.length === 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus size={15} /> Add Your First Record
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <RecordCard key={r.id} record={{ ...r, user_id: userId }} onDelete={handleDelete} onView={setViewRecord} />
          ))}
        </div>
      )}

      {/* View modal */}
      {viewRecord && <ViewModal record={{ ...viewRecord, user_id: userId }} onClose={() => setViewRecord(null)} />}
    </div>
  );
}
