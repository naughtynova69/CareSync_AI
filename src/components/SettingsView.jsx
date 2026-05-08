import React from 'react';
import { Bell, Shield, ChevronRight, LogOut, User } from 'lucide-react';

export default function SettingsView({ userName, userInitials, onLogout }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {/* Profile */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {userInitials}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{userName}</h4>
              <p className="text-xs text-slate-500">Patient Account</p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors border border-brand-100">
            Edit
          </button>
        </div>

        {/* Notifications */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
              <Bell size={16} className="text-slate-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
              <p className="text-xs text-slate-500">Medication and appointment reminders</p>
            </div>
          </div>
          <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
          </div>
        </div>

        {/* Privacy */}
        <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
              <Shield size={16} className="text-slate-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Privacy & Data</h4>
              <p className="text-xs text-slate-500">Data sharing and storage preferences</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
