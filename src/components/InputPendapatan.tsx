import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Download, 
  Building2, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { PendapatanRecord, PaymentStatus } from '../types';
import { formatRupiah, formatTanggalIndo, getStatusBadgeStyle } from '../utils/formatters';
import { exportToCsv } from '../services/databaseSync';

interface InputPendapatanProps {
  records: PendapatanRecord[];
  onAddClick: () => void;
  onEditClick: (record: PendapatanRecord) => void;
  onDeleteClick: (id: string) => void;
}

export const InputPendapatan: React.FC<InputPendapatanProps> = ({
  records,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(records.map((r) => r.namaClient))).filter(Boolean);
    return clients.sort();
  }, [records]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchClient = r.namaClient.toLowerCase().includes(q);
          const matchInvoice = r.noInvoice.toLowerCase().includes(q);
          const matchProject = (r.jenisProject || '').toLowerCase().includes(q);
          const matchBank = (r.bank || '').toLowerCase().includes(q);
          if (!matchClient && !matchInvoice && !matchProject && !matchBank) {
            return false;
          }
        }

        // Client filter
        if (filterClient !== 'all' && r.namaClient !== filterClient) {
          return false;
        }

        // Status filter
        if (filterStatus !== 'all' && r.statusPembayaran !== filterStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.tanggal).getTime();
        const timeB = new Date(b.tanggal).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [records, searchTerm, filterClient, filterStatus, sortDirection]);

  // Calculations for filtered items
  const totalFilteredNominal = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [filteredRecords]);

  const toggleDateSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterClient('all');
    setFilterStatus('all');
    setSortDirection('desc');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Metric Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#8C7D6B] uppercase">
            TABEL PENDAPATAN &amp; INVOICE
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#182622]">
              {formatRupiah(totalFilteredNominal)}
            </h1>
            <span className="text-xs text-[#7A6F62] font-medium">
              (Total {filteredRecords.length} transaksi terfilter)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Export to CSV */}
          <button
            onClick={() => exportToCsv(filteredRecords)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DDD2C1] text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
            title="Download ke Google Sheets / Excel format CSV"
          >
            <Download className="w-4 h-4 text-[#5C5248]" />
            <span>Export CSV</span>
          </button>

          {/* + Tambah Data Button */}
          <button
            id="btn-tambah-data"
            onClick={onAddClick}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Data</span>
          </button>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7D6B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="input-search-pendapatan"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari client, no. invoice, bank..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
            />
          </div>

          {/* Filter by Client */}
          <div className="relative">
            <select
              id="filter-client"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Client ({uniqueClients.length})</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status Pembayaran */}
          <div className="relative">
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Status Pembayaran</option>
              <option value="Lunas">Lunas</option>
              <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
              <option value="DP / Uang Muka">DP / Uang Muka</option>
              <option value="Termin 2">Termin 2</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Sort by Date Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-sort-tanggal"
              onClick={toggleDateSort}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#E8DFD3] text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
              title="Urutkan berdasarkan tanggal"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7D6B]" />
              <span>Tanggal: {sortDirection === 'desc' ? 'Terbaru' : 'Terlama'}</span>
              {sortDirection === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-[#182622]" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 text-[#182622]" />
              )}
            </button>

            {(searchTerm || filterClient !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-2 text-xs text-[#8C281F] hover:underline font-semibold cursor-pointer"
                title="Hapus semua filter"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFD3] bg-[#FAF7F2] text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider">
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#182622] transition-colors"
                  onClick={toggleDateSort}
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    {sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                  </div>
                </th>
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Nama Client</th>
                <th className="py-3.5 px-4">Project &amp; Cluster</th>
                <th className="py-3.5 px-4 text-right">Jumlah (IDR)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Bank / Rekening</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E9DF] text-xs text-[#182622]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7A6F62]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-center text-[#8C7D6B]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-[#182622]">Tidak Ada Data Pendapatan Ditemukan</p>
                      <p className="text-xs text-[#8C7D6B]">
                        Sesuaikan kata kunci pencarian atau filter status untuk menemukan invoice.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE2D4] border border-[#DDD2C1] text-xs font-semibold text-[#182622] cursor-pointer"
                      >
                        Reset Semua Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const badge = getStatusBadgeStyle(r.statusPembayaran);
                  const isConfirmingDelete = deleteConfirmId === r.id;

                  return (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#4D453C]">
                        {formatTanggalIndo(r.tanggal)}
                      </td>

                      {/* No. Invoice */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] font-semibold text-[#182622]">
                        {r.noInvoice || '-'}
                      </td>

                      {/* Nama Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sm text-[#182622]">
                          {r.namaClient}
                        </div>
                        <div className="text-[11px] text-[#8C7D6B] mt-0.5">
                          Source: {r.sources || '-'}
                        </div>
                      </td>

                      {/* Project & Cluster */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-[#182622] truncate" title={r.jenisProject}>
                          {r.jenisProject || '-'}
                        </div>
                        <div className="text-[10px] text-[#8C7D6B] tracking-wider uppercase mt-0.5">
                          {r.cluster || '-'}
                        </div>
                      </td>

                      {/* Jumlah */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-sm text-[#182622]">
                        {formatRupiah(r.jumlah)}
                      </td>

                      {/* Status Pembayaran */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{r.statusPembayaran}</span>
                        </span>
                      </td>

                      {/* Bank / Rekening */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#182622]">
                          {r.bank}
                        </div>
                        <div className="text-[11px] text-[#8C7D6B]">
                          {r.bayarKemana}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-center gap-1.5 bg-[#FDF0EE] p-1 rounded-xl border border-[#F4C6C1]">
                            <span className="text-[10px] text-[#8C281F] font-bold">Hapus?</span>
                            <button
                              onClick={() => {
                                onDeleteClick(r.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 bg-[#8C281F] text-white rounded text-[10px] font-bold hover:bg-[#661D1D] cursor-pointer"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 bg-white text-[#5C5248] rounded text-[10px] border border-[#DDD2C1] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`btn-edit-${r.id}`}
                              onClick={() => onEditClick(r)}
                              className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE2D4] border border-[#DDD2C1] text-[#5C5248] hover:text-[#182622] transition-colors cursor-pointer"
                              title="Edit data pendapatan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              id={`btn-delete-${r.id}`}
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FDF0EE] border border-[#DDD2C1] text-[#5C5248] hover:text-[#8C281F] transition-colors cursor-pointer"
                              title="Hapus data pendapatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
