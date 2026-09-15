import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Database, RefreshCw, Sparkles, Sheet, HardDrive } from 'lucide-react';
import { DatabaseConfig, PendapatanRecord } from '../types';
import { SAMPLE_APPS_SCRIPT_CODE, exportToCsv, syncToGoogleSheet, fetchFromGoogleSheet, fetchFromAirtable } from '../services/databaseSync';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DatabaseConfig;
  onSaveConfig: (newConfig: DatabaseConfig) => void;
  records: PendapatanRecord[];
  onSyncCompleted: (records: PendapatanRecord[]) => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  records,
  onSyncCompleted,
}) => {
  const [provider, setProvider] = useState<'local' | 'googlesheet' | 'airtable'>(config.provider);
  const [webAppUrl, setWebAppUrl] = useState(config.googleSheetWebAppUrl || '');
  const [airtableApiKey, setAirtableApiKey] = useState(config.airtableApiKey || '');
  const [airtableBaseId, setAirtableBaseId] = useState(config.airtableBaseId || '');
  const [airtableTableName, setAirtableTableName] = useState(config.airtableTableName || 'Pendapatan');
  const [autoSync, setAutoSync] = useState(config.autoSync ?? false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSave = () => {
    const updated: DatabaseConfig = {
      provider,
      googleSheetWebAppUrl: webAppUrl.trim(),
      airtableApiKey: airtableApiKey.trim(),
      airtableBaseId: airtableBaseId.trim(),
      airtableTableName: airtableTableName.trim(),
      autoSync,
      lastSynced: config.lastSynced,
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleManualSyncNow = async () => {
    setSyncStatus('syncing');
    setSyncMessage(null);

    try {
      if (provider === 'googlesheet') {
        if (!webAppUrl.trim()) {
          throw new Error('Masukkan URL Web App Google Sheets Anda terlebih dahulu.');
        }
        // Push current records to sheet
        await syncToGoogleSheet(webAppUrl.trim(), records);
        setSyncStatus('success');
        setSyncMessage(`Berhasil menyinkronkan ${records.length} data ke Google Sheets!`);
      } else if (provider === 'airtable') {
        if (!airtableApiKey.trim() || !airtableBaseId.trim()) {
          throw new Error('Lengkapi Personal Access Token dan Base ID Airtable Anda.');
        }
        const remoteRecords = await fetchFromAirtable(
          airtableApiKey.trim(),
          airtableBaseId.trim(),
          airtableTableName.trim() || 'Pendapatan'
        );
        if (remoteRecords && remoteRecords.length > 0) {
          onSyncCompleted(remoteRecords);
          setSyncStatus('success');
          setSyncMessage(`Berhasil menarik ${remoteRecords.length} data dari Airtable!`);
        } else {
          setSyncStatus('success');
          setSyncMessage('Tersambung ke Airtable (Tabel siap diisi).');
        }
      } else {
        setSyncStatus('success');
        setSyncMessage('Penyimpanan lokal browser aktif & aman.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'Gagal sinkronisasi data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#182622]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#E8DFD3] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#182622] text-[#FAF7F2] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#182622]">
                Konfigurasi Database
              </h3>
              <p className="text-xs text-[#8C7D6B] mt-0.5">
                Google Sheets atau Airtable sebagai database (tanpa custom backend)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#E8DFD3] flex items-center justify-center text-[#5C5248] hover:text-[#182622] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-2">
              Pilih Sumber Database
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setProvider('googlesheet')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  provider === 'googlesheet'
                    ? 'bg-[#F4EFE6] border-[#182622] text-[#182622] ring-1 ring-[#182622]'
                    : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#5C5248] hover:bg-[#F5ECE0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sheet className="w-5 h-5 text-[#2E7D32]" />
                  {provider === 'googlesheet' && <Check className="w-4 h-4 text-[#182622]" />}
                </div>
                <div>
                  <p className="text-xs font-bold">Google Sheets</p>
                  <p className="text-[10px] text-[#7A6F62] mt-0.5">Apps Script Web App</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('airtable')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  provider === 'airtable'
                    ? 'bg-[#F4EFE6] border-[#182622] text-[#182622] ring-1 ring-[#182622]'
                    : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#5C5248] hover:bg-[#F5ECE0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-5 h-5 text-[#1976D2]" />
                  {provider === 'airtable' && <Check className="w-4 h-4 text-[#182622]" />}
                </div>
                <div>
                  <p className="text-xs font-bold">Airtable</p>
                  <p className="text-[10px] text-[#7A6F62] mt-0.5">Direct REST API</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('local')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  provider === 'local'
                    ? 'bg-[#F4EFE6] border-[#182622] text-[#182622] ring-1 ring-[#182622]'
                    : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#5C5248] hover:bg-[#F5ECE0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <HardDrive className="w-5 h-5 text-[#5C5248]" />
                  {provider === 'local' && <Check className="w-4 h-4 text-[#182622]" />}
                </div>
                <div>
                  <p className="text-xs font-bold">Mode Lokal</p>
                  <p className="text-[10px] text-[#7A6F62] mt-0.5">Browser Offline</p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Provider Settings */}
          {provider === 'googlesheet' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#182622] flex items-center gap-1.5">
                  <Sheet className="w-4 h-4 text-[#2E7D32]" />
                  Koneksi Google Sheets (Apps Script)
                </h4>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="text-xs text-[#182622] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Kode Disalin!' : 'Salin Kode Apps Script'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5248] mb-1">
                  URL Web App Google Sheets
                </label>
                <input
                  id="input-gsheet-url"
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs font-mono text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                />
              </div>

              <div className="p-3 bg-white border border-[#E8DFD3] rounded-xl text-[11px] text-[#5C5248] space-y-1">
                <p className="font-bold text-[#182622]">Langkah Singkat (1 Menit):</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[#7A6F62]">
                  <li>Buka spreadsheet baru di Google Sheets.</li>
                  <li>Klik menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                  <li>Klik tombol <em>"Salin Kode Apps Script"</em> di atas lalu tempel di editor script.</li>
                  <li>Klik <strong>Deploy &gt; Deployment Baru &gt; Aplikasi Web</strong> (Akses: <em>Siapa saja / Anyone</em>).</li>
                  <li>Salin URL hasil deployment dan tempel ke kolom di atas.</li>
                </ol>
              </div>
            </div>
          )}

          {provider === 'airtable' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#182622] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#1976D2]" />
                Koneksi Airtable REST API
              </h4>

              <div>
                <label className="block text-xs font-medium text-[#5C5248] mb-1">
                  Personal Access Token (PAT) Airtable
                </label>
                <input
                  id="input-airtable-key"
                  type="password"
                  value={airtableApiKey}
                  onChange={(e) => setAirtableApiKey(e.target.value)}
                  placeholder="pat..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs font-mono text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C5248] mb-1">
                    Base ID (e.g. appXXXXXXXXX)
                  </label>
                  <input
                    id="input-airtable-base"
                    type="text"
                    value={airtableBaseId}
                    onChange={(e) => setAirtableBaseId(e.target.value)}
                    placeholder="appXXXXXXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs font-mono text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5248] mb-1">
                    Nama Tabel
                  </label>
                  <input
                    id="input-airtable-table"
                    type="text"
                    value={airtableTableName}
                    onChange={(e) => setAirtableTableName(e.target.value)}
                    placeholder="Pendapatan"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {provider === 'local' && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#5C5248] flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-[#8C7D6B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#182622]">Penyimpanan Lokal Aktif</p>
                <p className="mt-1 leading-relaxed text-[#7A6F62]">
                  Semua transaksi tersimpan aman di browser Anda. Kapan pun Anda siap, Anda bisa beralih ke Google Sheets atau Airtable tanpa kehilangan data saat ini.
                </p>
              </div>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              syncStatus === 'success' 
                ? 'bg-[#EAEFEA] text-[#1E4334] border border-[#C8DCBE]' 
                : 'bg-[#FDF0EE] text-[#8C281F] border border-[#F4C6C1]'
            }`}>
              {syncMessage}
            </div>
          )}

          {/* Quick Actions: Export CSV & Manual Sync */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => exportToCsv(records)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE2D4] border border-[#E8DFD3] text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
            >
              <Sheet className="w-4 h-4 text-[#2E7D32]" />
              <span>Download Format Google Sheet (.CSV)</span>
            </button>

            <button
              type="button"
              disabled={syncStatus === 'syncing'}
              onClick={handleManualSyncNow}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DDD2C1] text-xs font-semibold text-[#182622] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#E8DFD3] bg-[#FAF7F2] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8DFD3] hover:bg-white text-xs font-semibold text-[#5C5248] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            id="btn-save-db-config"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
          >
            Terapkan Konfigurasi
          </button>
        </div>

      </div>
    </div>
  );
};
