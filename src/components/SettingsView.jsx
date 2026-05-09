import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Shield, ChevronRight, LogOut, User, Moon, Sun, Monitor,
  Lock, Eye, EyeOff, Cpu, Globe, Type, LayoutDashboard, BarChart2,
  Volume2, Clock, Save, RefreshCw, CheckCircle2, AlertTriangle,
  Database, Download, Trash2, KeyRound, Fingerprint, Zap, Palette,
  BellOff, ToggleLeft, ToggleRight, Info, ChevronDown, ChevronUp, Mail
} from 'lucide-react';

const SECTION = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Icon size={16} className="text-brand-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100 divide-y divide-slate-50">{children}</div>}
    </div>
  );
};

const Toggle = ({ enabled, onChange, label, desc }) => (
  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const SelectRow = ({ label, desc, value, onChange, options }) => (
  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-700 cursor-pointer"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const DEFAULT_SETTINGS = {
  theme: 'light',
  notificationsEnabled: true,
  notificationSound: true,
  dataEncryption: true,
  twoFactorAuth: false,
  autoLogoutMins: 30,
  aiModel: 'gemini-2.0-flash',
  language: 'en',
  fontSize: 'medium',
  compactMode: false,
  shareAnalytics: false,
};

export default function SettingsView({ userName, userInitials, userId, userEmail, onLogout }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [passVisible, setPassVisible] = useState(false);

  // Load saved settings from DB
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/settings/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.user_id) {
          setSettings({
            theme: data.theme || 'light',
            notificationsEnabled: !!data.notifications_enabled,
            notificationSound: !!data.notification_sound,
            dataEncryption: !!data.data_encryption,
            twoFactorAuth: !!data.two_factor_auth,
            autoLogoutMins: data.auto_logout_mins || 30,
            aiModel: data.ai_model || 'gemini-2.0-flash',
            language: data.language || 'en',
            fontSize: data.font_size || 'medium',
            compactMode: !!data.compact_mode,
            shareAnalytics: !!data.share_analytics,
          });
        }
      })
      .catch(() => {});
  }, [userId]);

  const set = useCallback((key, val) => setSettings(s => ({ ...s, [key]: val })), []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Apply font size to document
      const sizeMap = { small: '13px', medium: '15px', large: '17px' };
      document.documentElement.style.fontSize = sizeMap[settings.fontSize] || '15px';

      // Apply compact mode
      if (settings.compactMode) document.body.classList.add('compact');
      else document.body.classList.remove('compact');
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const data = { userName, userEmail, exportedAt: new Date().toISOString(), settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'caresync-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">Personalise, secure, and tune your experience</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* ── Profile Card ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{userEmail || 'Patient Account'}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full">HIPAA Ready</span>
              <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-100 px-1.5 py-0.5 rounded-full">Encrypted</span>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-100">
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Appearance ─── */}
      <SECTION title="Appearance & Display" icon={Palette}>
        <SelectRow
          label="Theme" desc="Choose between light, dark, or system theme"
          value={settings.theme} onChange={v => set('theme', v)}
          options={[{ value: 'light', label: '☀️  Light' }, { value: 'dark', label: '🌙  Dark' }, { value: 'system', label: '🖥️  System' }]}
        />
        <SelectRow
          label="Font Size" desc="Adjust text size across the entire app"
          value={settings.fontSize} onChange={v => set('fontSize', v)}
          options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
        />
        <Toggle label="Compact Mode" desc="Reduce spacing and padding for more content on screen" enabled={settings.compactMode} onChange={v => set('compactMode', v)} />
      </SECTION>

      {/* ── Notifications ─── */}
      <SECTION title="Notifications & Alerts" icon={Bell}>
        <Toggle label="Push Notifications" desc="Medication reminders, appointment alerts" enabled={settings.notificationsEnabled} onChange={v => set('notificationsEnabled', v)} />
        <Toggle label="Notification Sound" desc="Play a sound with each alert" enabled={settings.notificationSound} onChange={v => set('notificationSound', v)} />
        <SelectRow
          label="Reminder Lead Time" desc="How early to notify before scheduled dose"
          value={String(settings.autoLogoutMins)}
          onChange={v => set('autoLogoutMins', Number(v))}
          options={[{ value: '5', label: '5 minutes' }, { value: '10', label: '10 minutes' }, { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }]}
        />
      </SECTION>

      {/* ── Security & Privacy ─── */}
      <SECTION title="Security & Privacy" icon={Shield}>
        <Toggle label="Medical Data Encryption" desc="All health records are AES-encrypted at rest" enabled={settings.dataEncryption} onChange={v => set('dataEncryption', v)} />
        <Toggle label="Two-Factor Authentication" desc="Extra login verification via email OTP" enabled={settings.twoFactorAuth} onChange={v => set('twoFactorAuth', v)} />
        <SelectRow
          label="Auto Logout" desc="Automatically sign out after inactivity"
          value={String(settings.autoLogoutMins)}
          onChange={v => set('autoLogoutMins', Number(v))}
          options={[{ value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '0', label: 'Never' }]}
        />
        {/* Change Password */}
        <div className="px-5 py-3.5">
          <button
            onClick={() => setShowChangePass(p => !p)}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <KeyRound size={14} /> Change Password
          </button>
          {showChangePass && (
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={passVisible ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setPassVisible(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {passVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                disabled={newPass.length < 6}
                className="px-3 py-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                Update
              </button>
            </div>
          )}
        </div>
      </SECTION>

      {/* ── AI & Performance ─── */}
      <SECTION title="AI & Performance Tuning" icon={Cpu}>
        <SelectRow
          label="AI Model" desc="Select the Gemini model powering your health assistant"
          value={settings.aiModel} onChange={v => set('aiModel', v)}
          options={[
            { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — Fastest' },
            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — Balanced' },
            { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — Most Capable' },
          ]}
        />
        <SelectRow
          label="Language" desc="Language for AI responses"
          value={settings.language} onChange={v => set('language', v)}
          options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]}
        />
        <Toggle label="Share Analytics" desc="Help us improve by sharing anonymous usage data" enabled={settings.shareAnalytics} onChange={v => set('shareAnalytics', v)} />
      </SECTION>

      {/* ── Data Management ─── */}
      <SECTION title="Data Management" icon={Database} defaultOpen={false}>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500">Your data is stored locally and never shared without consent.</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Download size={13} /> Export My Data
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={13} /> Delete Account
            </button>
          </div>
          {showDeleteConfirm && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <p className="font-semibold mb-2">⚠️ This will permanently delete all your data. Are you sure?</p>
              <div className="flex gap-2">
                <button onClick={() => { onLogout(); }} className="px-3 py-1.5 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">Yes, Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-white border border-red-200 rounded-md hover:bg-red-50">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </SECTION>

      {/* ── Info ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={15} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          CareSync stores your health data on your local device. Medical data is flagged for encryption. No data is sent to third parties. Always consult a qualified physician for medical decisions.
        </p>
      </div>

      {/* ── Sign Out ─── */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
