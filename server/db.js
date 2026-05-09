/**
 * Database initialization and helper functions for CareSync.
 * Uses better-sqlite3 for a file-based SQL database — no external DB server needed.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store the database file in the server directory
const DB_PATH = path.join(__dirname, 'caresync.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// ──── Create Tables ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    dosage      TEXT,
    frequency   TEXT,
    time_of_day TEXT,
    reason      TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS dose_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    med_name    TEXT    NOT NULL,
    taken_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    week_key    TEXT    NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id               INTEGER NOT NULL UNIQUE,
    theme                 TEXT    DEFAULT 'light',
    notifications_enabled INTEGER DEFAULT 1,
    notification_sound    INTEGER DEFAULT 1,
    data_encryption       INTEGER DEFAULT 1,
    two_factor_auth       INTEGER DEFAULT 0,
    auto_logout_mins      INTEGER DEFAULT 30,
    ai_model              TEXT    DEFAULT 'gemini-2.0-flash',
    language              TEXT    DEFAULT 'en',
    font_size             TEXT    DEFAULT 'medium',
    compact_mode          INTEGER DEFAULT 0,
    share_analytics       INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS medical_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    category    TEXT    NOT NULL DEFAULT 'general',
    content     TEXT,
    file_name   TEXT,
    file_type   TEXT,
    file_data   BLOB,
    is_encrypted INTEGER DEFAULT 0,
    uploaded_at TEXT    NOT NULL DEFAULT (datetime('now')),
    notes       TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// ──── Prepared Statements (for performance) ────────────────────
const insertUser = db.prepare(`
  INSERT INTO users (full_name, email, password)
  VALUES (@fullName, @email, @password)
`);

const findUserByEmail = db.prepare(`
  SELECT id, full_name, email, password, created_at
  FROM users
  WHERE email = ?
`);

const getAllUsers = db.prepare(`
  SELECT id, full_name, email, created_at
  FROM users
  ORDER BY created_at DESC
`);

const insertMedication = db.prepare(`
  INSERT INTO medications (user_id, name, dosage, frequency, time_of_day, reason)
  VALUES (@userId, @name, @dosage, @frequency, @timeOfDay, @reason)
`);

const findMedicationsByUser = db.prepare(`
  SELECT * FROM medications WHERE user_id = ?
`);

// Dose log statements
const insertDoseLog = db.prepare(`
  INSERT INTO dose_logs (user_id, med_name, week_key) VALUES (?, ?, ?)
`);
const getDoseLogsByWeek = db.prepare(`
  SELECT * FROM dose_logs WHERE user_id = ? AND week_key = ? ORDER BY taken_at DESC
`);
const countDoseLogsByWeek = db.prepare(`
  SELECT COUNT(*) as count FROM dose_logs WHERE user_id = ? AND week_key = ?
`);

// Settings statements
const upsertSettings = db.prepare(`
  INSERT INTO user_settings (user_id, theme, notifications_enabled, notification_sound,
    data_encryption, two_factor_auth, auto_logout_mins, ai_model, language, font_size,
    compact_mode, share_analytics)
  VALUES (@userId, @theme, @notificationsEnabled, @notificationSound,
    @dataEncryption, @twoFactorAuth, @autoLogoutMins, @aiModel, @language, @fontSize,
    @compactMode, @shareAnalytics)
  ON CONFLICT(user_id) DO UPDATE SET
    theme = excluded.theme,
    notifications_enabled = excluded.notifications_enabled,
    notification_sound = excluded.notification_sound,
    data_encryption = excluded.data_encryption,
    two_factor_auth = excluded.two_factor_auth,
    auto_logout_mins = excluded.auto_logout_mins,
    ai_model = excluded.ai_model,
    language = excluded.language,
    font_size = excluded.font_size,
    compact_mode = excluded.compact_mode,
    share_analytics = excluded.share_analytics
`);
const getSettings = db.prepare(`SELECT * FROM user_settings WHERE user_id = ?`);

// Medical history statements
const insertMedHistory = db.prepare(`
  INSERT INTO medical_history (user_id, title, category, content, file_name, file_type, file_data, is_encrypted, notes)
  VALUES (@userId, @title, @category, @content, @fileName, @fileType, @fileData, @isEncrypted, @notes)
`);
const getMedHistoryByUser = db.prepare(`
  SELECT id, user_id, title, category, content, file_name, file_type, is_encrypted, uploaded_at, notes
  FROM medical_history WHERE user_id = ? ORDER BY uploaded_at DESC
`);
const getMedHistoryFile = db.prepare(`
  SELECT file_data, file_type, file_name FROM medical_history WHERE id = ? AND user_id = ?
`);
const deleteMedHistory = db.prepare(`DELETE FROM medical_history WHERE id = ? AND user_id = ?`);

// ──── Exported helpers ─────────────────────────────────────────
export function createUser({ fullName, email, password }) {
  return insertUser.run({ fullName, email, password });
}
export function getUserByEmail(email) {
  return findUserByEmail.get(email);
}
export function listUsers() {
  return getAllUsers.all();
}
export function addMedication(med) {
  return insertMedication.run(med);
}
export function getMedicationsByUser(userId) {
  return findMedicationsByUser.all(userId);
}

// Dose log
export function logDose(userId, medName, weekKey) {
  return insertDoseLog.run(userId, medName, weekKey);
}
export function getDoseLogs(userId, weekKey) {
  return getDoseLogsByWeek.all(userId, weekKey);
}
export function countDoses(userId, weekKey) {
  return countDoseLogsByWeek.get(userId, weekKey);
}

// Settings
export function saveSettings(settings) {
  return upsertSettings.run(settings);
}
export function loadSettings(userId) {
  return getSettings.get(userId);
}

// Medical history
export function addMedicalHistory(record) {
  return insertMedHistory.run(record);
}
export function getMedicalHistory(userId) {
  return getMedHistoryByUser.all(userId);
}
export function getMedicalHistoryFile(id, userId) {
  return getMedHistoryFile.get(id, userId);
}
export function deleteMedicalRecord(id, userId) {
  return deleteMedHistory.run(id, userId);
}

export default db;
