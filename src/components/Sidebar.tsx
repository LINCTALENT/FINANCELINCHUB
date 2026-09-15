import React from 'react';
import { 
  FolderKanban, 
  TrendingUp, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  ChevronRight,
  Sheet,
  HardDrive
} from 'lucide-react';
import { ActiveTab, AuthUser, DatabaseConfig } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: AuthUser;
  onLogout: () => void;
  totalRecords: number;
  dbConfig: DatabaseConfig;
  onOpenDbModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  totalRecords,
  dbConfig,
  onOpenDbModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const getDbLabel = () => {
    switch (dbConfig.provider) {
      case 'googlesheet':
        return { label: 'Google Sheets', icon: Sheet, color: 'text-[#2E7D32]' };
      case 'airtable':
        return { label: 'Airtable Base', icon: Database, color: 'text-[#1976D2]' };
      default:
        return { label: 'Mode Lokal', icon: HardDrive, color: 'text-[#5C5248]' };
    }
  };

  const dbInfo = getDbLabel();
  const DbIcon = dbInfo.icon;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#F7F3EC] border-r border-[#E8DFD3] p-5 sm:p-6 select-none">
      {/* Top Header / Branding */}
      <div>
        <div className="pb-6 mb-6 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#182622] text-[#FAF7F2] flex items-center justify-center shadow-xs font-bold text-base tracking-widest">
              L
            </div>
            <div>
              <span className="font-['Cinzel'] tracking-[0.25em] text-lg font-bold text-[#182622] block">
                LINCHUB
              </span>
              <span className="text-[10px] tracking-[0.18em] text-[#8C7D6B] font-semibold uppercase block">
                FINANCE &amp; REVENUE
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#7A6F62] leading-tight">
            PT Linchub Network Indonesia
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-[#8C7D6B] uppercase tracking-widest mb-2">
            Menu Utama
          </p>

          {/* Menu 1 — Input Pendapatan */}
          <button
            id="nav-input-pendapatan"
            onClick={() => {
              onSelectTab('input');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'input'
                ? 'bg-[#182622] text-[#FAF7F2] shadow-sm font-semibold'
                : 'bg-transparent text-[#4D453C] hover:bg-[#EAE2D4] hover:text-[#182622]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === 'input'
                    ? 'bg-[#253A34] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] border border-[#DDD2C1] text-[#182622]'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold tracking-wide block">Menu 1 — Input Pendapatan</span>
                <span className={`text-[10px] block ${activeTab === 'input' ? 'text-[#C5BAA8]' : 'text-[#8C7D6B]'}`}>
                  Tabel data &amp; form invoice
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'input'
                  ? 'bg-[#253A34] text-[#FAF7F2]'
                  : 'bg-[#FAF7F2] border border-[#DDD2C1] text-[#5C5248]'
              }`}
            >
              {totalRecords}
            </span>
          </button>

          {/* Menu 2 — Analisa */}
          <button
            id="nav-analisa"
            onClick={() => {
              onSelectTab('analisa');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'analisa'
                ? 'bg-[#182622] text-[#FAF7F2] shadow-sm font-semibold'
                : 'bg-transparent text-[#4D453C] hover:bg-[#EAE2D4] hover:text-[#182622]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === 'analisa'
                    ? 'bg-[#253A34] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] border border-[#DDD2C1] text-[#182622]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold tracking-wide block">Menu 2 — Analisa</span>
                <span className={`text-[10px] block ${activeTab === 'analisa' ? 'text-[#C5BAA8]' : 'text-[#8C7D6B]'}`}>
                  Grafik bulanan &amp; client
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeTab === 'analisa' ? 'text-[#FAF7F2]' : 'text-[#8C7D6B]'}`} />
          </button>
        </div>

        {/* Database Status Widget in Sidebar */}
        <div className="mt-8 pt-6 border-t border-[#E8DFD3]">
          <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#8C7D6B] uppercase tracking-wider">
                Database Aktif
              </span>
              <button
                onClick={onOpenDbModal}
                className="text-[10px] text-[#182622] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                title="Buka pengaturan database"
              >
                <Settings className="w-3 h-3" />
                <span>Ubah</span>
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center">
                <DbIcon className={`w-4 h-4 ${dbInfo.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#182622]">{dbInfo.label}</p>
                <p className="text-[10px] text-[#7A6F62]">Tanpa backend custom</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="pt-6 border-t border-[#E8DFD3]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#182622] text-[#FAF7F2] flex items-center justify-center text-xs font-bold flex-shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#182622] truncate">{user.displayName}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
                <span className="text-[10px] text-[#7A6F62] uppercase tracking-wider font-medium">Finance Admin</span>
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={onLogout}
            title="Keluar dari portal"
            className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#FDF0EE] hover:text-[#8C281F] border border-[#DDD2C1] flex items-center justify-center text-[#5C5248] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={onCloseMobile} 
          />
          <div className="relative w-72 max-w-[85vw] h-full z-50 animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
