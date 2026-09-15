import React from 'react';
import { Menu, Database, RefreshCw, Calendar, Sheet } from 'lucide-react';
import { ActiveTab, DatabaseConfig } from '../types';

interface HeaderBarProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenDbModal: () => void;
  dbConfig: DatabaseConfig;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenDbModal,
  dbConfig,
  onSyncNow,
  isSyncing,
}) => {
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const getTitle = () => {
    switch (activeTab) {
      case 'input':
        return {
          title: 'Input & Manajemen Pendapatan',
          subtitle: 'Daftar invoice, penerimaan dana client, dan pencatatan kas',
        };
      case 'analisa':
        return {
          title: 'Analisa & Grafik Keuangan',
          subtitle: 'Laporan pendapatan bulanan dan performa kontribusi client',
        };
      default:
        return {
          title: 'Dashboard Finance',
          subtitle: 'PT Linchub Network Indonesia',
        };
    }
  };

  const headerInfo = getTitle();

  return (
    <header className="sticky top-0 z-20 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#182622] hover:bg-[#EAE2D4] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#182622] tracking-tight">
            {headerInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-[#8C7D6B]">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E8DFD3] text-xs font-medium text-[#5C5248]">
          <Calendar className="w-3.5 h-3.5 text-[#8C7D6B]" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Database Config Button */}
        <button
          onClick={onOpenDbModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
          title="Pengaturan Database Google Sheet / Airtable"
        >
          <Database className="w-3.5 h-3.5 text-[#8C7D6B]" />
          <span className="hidden sm:inline">Database:</span>
          <span className="font-bold">
            {dbConfig.provider === 'googlesheet' ? 'G-Sheet' : dbConfig.provider === 'airtable' ? 'Airtable' : 'Lokal'}
          </span>
        </button>

        {/* Sync Trigger Button */}
        <button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
          title="Sinkronkan data sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
};
