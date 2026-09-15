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
  AlertCircle,
  Layers,
  Share2,
  UserCheck,
  Tag,
  ChevronDown,
  ChevronUp,
  Coins
} from 'lucide-react';
import { PendapatanRecord, PaymentStatus, ClusterType, SourceType } from '../types';
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
  const [filterCluster, setFilterCluster] = useState<string>('all');
  const [filterSources, setFilterSources] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

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
          const matchCode = (r.code || r.jenisProject || '').toLowerCase().includes(q);
          const matchBank = (r.bank || '').toLowerCase().includes(q);
          const matchAn = (r.atasNamaRekening || '').toLowerCase().includes(q);
          if (!matchClient && !matchInvoice && !matchCode && !matchBank && !matchAn) {
            return false;
          }
        }

        // Client filter
        if (filterClient !== 'all' && r.namaClient !== filterClient) {
          return false;
        }

        // Cluster filter (Stages / Fractional)
        if (filterCluster !== 'all' && r.cluster !== filterCluster) {
          return false;
        }

        // Sources filter (INTERNAL / EKSTERNAL / MASSIVE)
        if (filterSources !== 'all' && r.sources !== filterSources) {
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
  }, [records, searchTerm, filterClient, filterCluster, filterSources, filterStatus, sortDirection]);

  // Calculations for filtered items
  const totalFilteredNominal = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [filteredRecords]);

  // Fee totals for filtered items
  const feeTotals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, curr) => {
        acc.interview += curr.feeInterview || 0;
        acc.ojt += curr.feeOjt || 0;
        acc.selesaiOjt += curr.feeSelesaiOjt || 0;
        acc.management += curr.feeManagement || 0;
        acc.grossSalary += curr.feeGrossSalary || 0;
        return acc;
      },
      { interview: 0, ojt: 0, selesaiOjt: 0, management: 0, grossSalary: 0 }
    );
  }, [filteredRecords]);

  const toggleDateSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterClient('all');
    setFilterCluster('all');
    setFilterSources('all');
    setFilterStatus('all');
    setSortDirection('desc');
  };

  const toggleExpandFee = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Metric Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#8C7D6B] uppercase flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#C4A47C]" />
            TABEL PENDAPATAN &amp; INVOICE LINCHUB
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#182622]">
              {formatRupiah(totalFilteredNominal)}
            </h1>
            <span className="text-xs text-[#7A6F62] font-medium">
              (Total {filteredRecords.length} invoice terfilter)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Export to CSV */}
          <button
            onClick={() => exportToCsv(filteredRecords)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DDD2C1] text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
            title="Download ke format CSV dengan rincian 5 komponen fee"
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
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* 1. Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7D6B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="input-search-pendapatan"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari client, code, invoice, bank, PIC..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
            />
          </div>

          {/* 2. Filter by Client */}
          <div className="relative">
            <select
              id="filter-client"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Client ({uniqueClients.length})</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* 3. Filter Cluster (Stages & Fractional) */}
          <div className="relative">
            <select
              id="filter-cluster"
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Cluster</option>
              <option value="Stages">Stages</option>
              <option value="Fractional">Fractional</option>
            </select>
          </div>

          {/* 4. Filter Sources (INTERNAL, EKSTERNAL, MASSIVE) */}
          <div className="relative">
            <select
              id="filter-sources"
              value={filterSources}
              onChange={(e) => setFilterSources(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Sources</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="EKSTERNAL">EKSTERNAL</option>
              <option value="MASSIVE">MASSIVE</option>
            </select>
          </div>

          {/* 5. Filter Status & Sort Date */}
          <div className="flex items-center gap-2">
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
              <option value="DP / Uang Muka">DP / Uang Muka</option>
              <option value="Termin 2">Termin 2</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>

            <button
              id="btn-sort-tanggal"
              onClick={toggleDateSort}
              className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#E8DFD3] text-xs font-semibold text-[#182622] transition-colors cursor-pointer flex-shrink-0"
              title={`Urutkan: ${sortDirection === 'desc' ? 'Terbaru' : 'Terlama'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7D6B]" />
            </button>

            {(searchTerm || filterClient !== 'all' || filterCluster !== 'all' || filterSources !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-2 py-1 text-xs text-[#8C281F] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                title="Hapus filter"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* Aggregate Fee Chips for Quick Inspection */}
        <div className="pt-2 border-t border-[#F0E9DF] flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-bold text-[#8C7D6B] uppercase tracking-wider">
            Total Komponen Terfilter:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] text-[#4D453C]">
            Interview: <strong>{formatRupiah(feeTotals.interview)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] text-[#4D453C]">
            OJT: <strong>{formatRupiah(feeTotals.ojt)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] text-[#4D453C]">
            Selesai OJT: <strong>{formatRupiah(feeTotals.selesaiOjt)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] text-[#4D453C]">
            Management: <strong>{formatRupiah(feeTotals.management)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] text-[#4D453C]">
            45% Gaji Bruto: <strong>{formatRupiah(feeTotals.grossSalary)}</strong>
          </span>
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
                <th className="py-3.5 px-4">No. Invoice &amp; Code</th>
                <th className="py-3.5 px-4">Nama Client &amp; PIC</th>
                <th className="py-3.5 px-4">Cluster &amp; Sources</th>
                <th className="py-3.5 px-4">Bank Client (A.N)</th>
                <th className="py-3.5 px-4 text-right">Pendapatan &amp; Rincian</th>
                <th className="py-3.5 px-4 text-center">Status</th>
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
                        Sesuaikan kata kunci pencarian, filter cluster, atau sources untuk menemukan invoice.
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
                  const isExpanded = expandedRecordId === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-[#FAF7F2]/60 transition-colors">
                        {/* Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#4D453C]">
                          {formatTanggalIndo(r.tanggal)}
                        </td>

                        {/* No. Invoice & Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-[11px] font-semibold text-[#182622]">
                            {r.noInvoice || '-'}
                          </div>
                          <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFD3] text-[10px] font-mono text-[#5C5248]">
                            <Tag className="w-2.5 h-2.5 text-[#C4A47C]" />
                            <span>{r.code || r.jenisProject || '-'}</span>
                          </div>
                        </td>

                        {/* Nama Client & PIC */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-sm text-[#182622]">
                            {r.namaClient}
                          </div>
                          <div className="text-[11px] text-[#8C7D6B] mt-0.5 truncate max-w-[200px]" title={r.atasNamaRekening}>
                            A.N: {r.atasNamaRekening || '-'}
                          </div>
                        </td>

                        {/* Cluster & Sources */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              r.cluster === 'Stages'
                                ? 'bg-[#EAEFEA] text-[#1E4334] border-[#C8DCBE]'
                                : 'bg-[#F2EDFF] text-[#4A3280] border-[#D7C7F7]'
                            }`}>
                              {r.cluster || 'Stages'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFD3] text-[#5C5248]">
                              {r.sources || 'INTERNAL'}
                            </span>
                          </div>
                        </td>

                        {/* Bank Client */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#182622] flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-[#8C7D6B]" />
                            <span>{r.bank || '-'}</span>
                          </div>
                          <div className="text-[10px] text-[#8C7D6B] mt-0.5">
                            Ke: {r.bayarKemana || 'Rekening Linchub'}
                          </div>
                        </td>

                        {/* Jumlah & Fee Breakdown Button */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="font-bold text-sm text-[#182622]">
                            {formatRupiah(r.jumlah)}
                          </div>
                          <button
                            onClick={() => toggleExpandFee(r.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8C7D6B] hover:text-[#182622] hover:underline cursor-pointer mt-0.5"
                          >
                            <span>Rincian Fee</span>
                            {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                          </button>
                        </td>

                        {/* Status Pembayaran */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{r.statusPembayaran}</span>
                          </span>
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
                                title="Edit data invoice"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                id={`btn-delete-${r.id}`}
                                onClick={() => setDeleteConfirmId(r.id)}
                                className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FDF0EE] border border-[#DDD2C1] text-[#5C5248] hover:text-[#8C281F] transition-colors cursor-pointer"
                                title="Hapus data invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Fee Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-[#FAF7F2]/90 border-b border-[#E8DFD3]">
                          <td colSpan={8} className="p-4">
                            <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-4 shadow-xs">
                              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0E9DF]">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7D6B] flex items-center gap-1.5">
                                  <Coins className="w-3.5 h-3.5 text-[#C4A47C]" />
                                  RINCIAN 5 KOMPONEN FEE INVOICE {r.noInvoice}
                                </span>
                                <span className="text-xs font-bold text-[#182622]">
                                  Total: {formatRupiah(r.jumlah)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs">
                                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                                  <span className="text-[10px] font-bold text-[#8C7D6B] uppercase block">Fee Interview</span>
                                  <span className="font-semibold text-[#182622] text-sm mt-0.5 block">
                                    {formatRupiah(r.feeInterview || 0)}
                                  </span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                                  <span className="text-[10px] font-bold text-[#8C7D6B] uppercase block">Fee OJT</span>
                                  <span className="font-semibold text-[#182622] text-sm mt-0.5 block">
                                    {formatRupiah(r.feeOjt || 0)}
                                  </span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                                  <span className="text-[10px] font-bold text-[#8C7D6B] uppercase block">Fee Selesai OJT</span>
                                  <span className="font-semibold text-[#182622] text-sm mt-0.5 block">
                                    {formatRupiah(r.feeSelesaiOjt || 0)}
                                  </span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3]">
                                  <span className="text-[10px] font-bold text-[#8C7D6B] uppercase block">Fee Management</span>
                                  <span className="font-semibold text-[#182622] text-sm mt-0.5 block">
                                    {formatRupiah(r.feeManagement || 0)}
                                  </span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] col-span-2 sm:col-span-1">
                                  <span className="text-[10px] font-bold text-[#8C7D6B] uppercase block">Fee 45% Gaji Bruto</span>
                                  <span className="font-semibold text-[#182622] text-sm mt-0.5 block">
                                    {formatRupiah(r.feeGrossSalary || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
