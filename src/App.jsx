import React, { useState, useRef, useEffect } from 'react';
import Login from './Login';
import ChatView from './components/ChatView';
import MedExplain from './components/MedExplain';
import DietFilter from './components/DietFilter';
import MDReports from './components/MDReports';
import SettingsView from './components/SettingsView';
import SymptomChecker from './components/SymptomChecker';
import MedReminder from './components/MedReminder';
import HealthLog from './components/HealthLog';
import BMINutrition from './components/BMINutrition';
import {
  Activity, MessageSquare, Pill, Apple, FileText, Settings,
  Menu, X, Bell, Clock, Check, CheckCheck, AlertCircle, CalendarCheck, FlaskConical,
  Stethoscope, BellRing, HeartPulse, Calculator
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'chat', label: 'AI Companion', icon: MessageSquare },
  { id: 'symptoms', label: 'Symptom Checker', icon: Stethoscope },
  { id: 'med', label: 'Medications', icon: Pill },
  { id: 'reminders', label: 'Med Reminders', icon: BellRing },
  { id: 'healthlog', label: 'Health Log', icon: HeartPulse },
  { id: 'bmi', label: 'BMI & Nutrition', icon: Calculator },
  { id: 'diet', label: 'Diet Analysis', icon: Apple },
  { id: 'reports', label: 'Health Records', icon: FileText },
];

const PAGE_TITLES = {
  chat: 'AI Companion',
  symptoms: 'Symptom Checker',
  med: 'Medications',
  reminders: 'Med Reminders',
  healthlog: 'Health Log',
  bmi: 'BMI & Nutrition',
  diet: 'Diet Analysis',
  reports: 'Health Records',
  settings: 'Settings',
};

const PAGE_SUBTITLES = {
  chat: 'Ask questions about your health and medications',
  symptoms: 'AI-powered triage and urgency assessment',
  med: 'Track prescriptions and daily adherence',
  reminders: 'Set reminders and check drug interactions',
  healthlog: 'Track mood, sleep, and energy daily',
  bmi: 'BMI calculator and meal nutrition analysis',
  diet: 'AI-powered nutritional analysis',
  reports: 'Appointments, labs, and care timeline',
  settings: 'Account and preferences',
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'medication',
    icon: Pill,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    title: 'Medication Reminder',
    message: 'Time to take Metformin 500mg — morning dose.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'appointment',
    icon: CalendarCheck,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Upcoming Appointment',
    message: 'Dr. Patel — Cardiology check-up tomorrow at 10:30 AM.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 3,
    type: 'lab',
    icon: FlaskConical,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Lab Results Ready',
    message: 'Your HbA1c panel results are now available for review.',
    time: '3 hrs ago',
    read: false,
  },
  {
    id: 4,
    type: 'alert',
    icon: AlertCircle,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    title: 'Missed Dose Alert',
    message: 'You missed your evening Lisinopril dose yesterday.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'medication',
    icon: Pill,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    title: 'Refill Reminder',
    message: 'Atorvastatin supply is running low — 5 days remaining.',
    time: '2 days ago',
    read: true,
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('John Doe');
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  if (!isAuthenticated) {
    return <Login onLogin={(name) => { setUserName(name); setIsAuthenticated(true); }} />;
  }

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
    setNotifOpen(false);
  };

  const navigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">

      {/* ─── Sidebar (Desktop) ──────────────────────── */}
      <aside className="w-60 bg-white border-r border-slate-200 flex-col justify-between hidden lg:flex">
        <div>
          {/* Logo */}
          <div className="h-14 flex items-center gap-2.5 px-5 border-b border-slate-100">
            <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
              <Activity size={15} className="text-white" />
            </div>
            <span className="text-base font-display font-extrabold text-slate-800 tracking-tight">CareSync</span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === id
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={17} className={activeTab === id ? 'text-brand-600' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100">
          {/* Weekly progress */}
          <div className="px-3 py-3 mb-2 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-700 mb-1">Weekly Progress</p>
            <p className="text-[11px] text-slate-500 mb-2">0 of 10 doses on time</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: '0%' }} />
            </div>
          </div>

          <button
            onClick={() => navigate('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Settings size={17} className={activeTab === 'settings' ? 'text-brand-600' : 'text-slate-400'} />
            Settings
          </button>
        </div>
      </aside>

      {/* ─── Mobile Overlay ─────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex flex-col">
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
                  <Activity size={15} className="text-white" />
                </div>
                <span className="text-base font-display font-extrabold text-slate-800">CareSync</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <nav className="p-3 space-y-0.5 flex-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === id
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={17} className={activeTab === id ? 'text-brand-600' : 'text-slate-400'} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => navigate('settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={17} className="text-slate-400" /> Settings
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content ──────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-display font-bold text-slate-800 leading-tight">{PAGE_TITLES[activeTab]}</h2>
              <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">{PAGE_SUBTITLES[activeTab]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">

            {/* ─── Notification Bell + Dropdown ─── */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setNotifOpen(prev => !prev)}
                className={`p-2 rounded-lg transition-colors relative ${
                  notifOpen
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-[370px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  style={{ animation: 'notifSlideIn 0.18s ease-out' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display font-bold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck size={13} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[340px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                          <Bell size={18} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">All caught up!</p>
                        <p className="text-xs text-slate-400 mt-0.5">No new notifications right now.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const Icon = notif.icon;
                        return (
                          <button
                            key={notif.id}
                            onClick={() => markOneRead(notif.id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 last:border-b-0 ${
                              notif.read
                                ? 'bg-white hover:bg-slate-50'
                                : 'bg-brand-50/40 hover:bg-brand-50/70'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon size={15} className={notif.iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-[13px] leading-tight ${notif.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-800'}`}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {notif.time}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <button
                        onClick={clearAll}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => { navigate('settings'); setNotifOpen(false); }}
                        className="text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Notification settings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-[11px] font-bold">
                {userInitials}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'symptoms' && <SymptomChecker />}
          {activeTab === 'med' && <MedExplain />}
          {activeTab === 'reminders' && <MedReminder />}
          {activeTab === 'healthlog' && <HealthLog />}
          {activeTab === 'bmi' && <BMINutrition />}
          {activeTab === 'diet' && <DietFilter />}
          {activeTab === 'reports' && <MDReports />}
          {activeTab === 'settings' && <SettingsView userName={userName} userInitials={userInitials} onLogout={() => setIsAuthenticated(false)} />}
        </div>
      </main>
    </div>
  );
}
