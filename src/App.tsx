import React, { useState, useEffect, useMemo } from 'react';
import { 
  AuthUser, 
  PendapatanRecord, 
  ActiveTab, 
  DatabaseConfig 
} from './types';
import { 
  getSavedSessionUser, 
  logoutAdmin 
} from './services/firebase';
import { 
  loadLocalRecords, 
  saveLocalRecords, 
  getDatabaseConfig, 
  saveDatabaseConfig, 
  syncToGoogleSheet, 
  fetchFromAirtable 
} from './services/databaseSync';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { InputPendapatan } from './components/InputPendapatan';
import { Analisa } from './components/Analisa';
import { PendapatanModal } from './components/PendapatanModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => getSavedSessionUser());
  const [records, setRecords] = useState<PendapatanRecord[]>(() => loadLocalRecords());
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => getDatabaseConfig());
  
  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PendapatanRecord | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync to local storage whenever records change
  useEffect(() => {
    saveLocalRecords(records);
  }, [records]);

  // Handle Login
  const handleLoginSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    showToast(`Selamat datang, ${authenticatedUser.displayName}!`);
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin();
    setUser(null);
    showToast('Anda telah keluar dari portal finance.');
  };

  // Record CRUD Operations
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditModal = (record: PendapatanRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (record: PendapatanRecord) => {
    if (editingRecord) {
      setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
      showToast(`Data invoice ${record.noInvoice} berhasil diperbarui.`);
    } else {
      setRecords((prev) => [record, ...prev]);
      showToast(`Data pendapatan baru untuk ${record.namaClient} berhasil disimpan.`);
    }

    // Auto-sync if configured
    if (dbConfig.autoSync && dbConfig.provider === 'googlesheet' && dbConfig.googleSheetWebAppUrl) {
      syncToGoogleSheet(dbConfig.googleSheetWebAppUrl, [record, ...records]).catch((err) =>
        console.error('Auto sync error:', err)
      );
    }
  };

  const handleDeleteRecord = (id: string) => {
    const target = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast(`Data invoice ${target?.noInvoice || ''} telah dihapus.`);
  };

  // Database Config Save & Manual Sync
  const handleSaveDbConfig = (newConfig: DatabaseConfig) => {
    setDbConfig(newConfig);
    saveDatabaseConfig(newConfig);
    showToast('Konfigurasi database berhasil disimpan.');
  };

  const handleManualSync = async () => {
    if (dbConfig.provider === 'local') {
      showToast('Data tersimpan secara lokal di browser.');
      return;
    }

    setIsSyncing(true);
    try {
      if (dbConfig.provider === 'googlesheet' && dbConfig.googleSheetWebAppUrl) {
        await syncToGoogleSheet(dbConfig.googleSheetWebAppUrl, records);
        showToast('Sinkronisasi ke Google Sheets berhasil!');
      } else if (dbConfig.provider === 'airtable' && dbConfig.airtableApiKey && dbConfig.airtableBaseId) {
        const remote = await fetchFromAirtable(
          dbConfig.airtableApiKey,
          dbConfig.airtableBaseId,
          dbConfig.airtableTableName || 'Pendapatan'
        );
        if (remote.length > 0) {
          setRecords(remote);
          showToast(`Berhasil menarik ${remote.length} data dari Airtable!`);
        } else {
          showToast('Tersambung ke Airtable.');
        }
      } else {
        showToast('Kredensial database belum lengkap. Silakan buka Pengaturan Database.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal melakukan sinkronisasi database.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // High level aggregated stats for Login preview & Dashboard
  const totalPendapatan = useMemo(() => {
    return records.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [records]);

  const totalBulanIni = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return records
      .filter((r) => r.tanggal.startsWith(currentYearMonth))
      .reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [records]);

  const totalClientAktif = useMemo(() => {
    return new Set(records.map((r) => r.namaClient).filter(Boolean)).size;
  }, [records]);

  // Monthly summary for login page chart
  const monthlyData = useMemo(() => {
    const map: { [month: string]: number } = {};
    const now = new Date();
    const months: Array<{ month: string; total: number; count: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      months.push({ month: label, total: 0, count: 0 });
      map[key] = months.length - 1;
    }

    records.forEach((r) => {
      const ym = r.tanggal.slice(0, 7);
      if (map[ym] !== undefined) {
        months[map[ym]].total += r.jumlah;
        months[map[ym]].count += 1;
      }
    });

    return months;
  }, [records]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E2925] font-sans antialiased selection:bg-[#E2D5C3]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-[#182622] text-[#FAF7F2] border-[#253A34]'
                : 'bg-[#8C281F] text-[#FAF7F2] border-[#A83226]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#81C784]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#FF8A80]" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-0.5 hover:opacity-75 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Screen A: Login Page (when not authenticated) */}
      {!user ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          totalPendapatan={totalPendapatan}
          totalBulanIni={totalBulanIni}
          totalClientAktif={totalClientAktif}
          monthlyData={monthlyData}
          onOpenDbModal={() => setIsDbModalOpen(true)}
        />
      ) : (
        /* Screen B: Dashboard (after login) */
        <div className="flex min-h-screen">
          {/* Left Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            user={user}
            onLogout={handleLogout}
            totalRecords={records.length}
            dbConfig={dbConfig}
            onOpenDbModal={() => setIsDbModalOpen(true)}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <HeaderBar
              activeTab={activeTab}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onOpenDbModal={() => setIsDbModalOpen(true)}
              dbConfig={dbConfig}
              onSyncNow={handleManualSync}
              isSyncing={isSyncing}
            />

            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'input' ? (
                <InputPendapatan
                  records={records}
                  onAddClick={handleOpenAddModal}
                  onEditClick={handleOpenEditModal}
                  onDeleteClick={handleDeleteRecord}
                />
              ) : (
                <Analisa records={records} />
              )}
            </main>

            {/* Dashboard Sub Footer */}
            <footer className="border-t border-[#E8DFD3] bg-[#FAF7F2] py-4 px-4 sm:px-8 text-xs text-[#8C7D6B] flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                © 2026 PT Linchub Network Indonesia. Finance Management System.
              </p>
              <p className="text-[11px]">
                Database: {dbConfig.provider === 'googlesheet' ? 'Google Sheets' : dbConfig.provider === 'airtable' ? 'Airtable' : 'Penyimpanan Lokal'}
              </p>
            </footer>
          </div>
        </div>
      )}

      {/* Record Add/Edit Modal */}
      <PendapatanModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        totalExistingRecords={records.length}
      />

      {/* Zero-backend Google Sheets & Airtable Config Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        config={dbConfig}
        onSaveConfig={handleSaveDbConfig}
        records={records}
        onSyncCompleted={(newRecords) => {
          setRecords(newRecords);
          showToast(`Sinkronisasi selesai. ${newRecords.length} data dimuat.`);
        }}
      />
    </div>
  );
}
