import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Tag, 
  Calculator, 
  Layers, 
  Share2, 
  UserCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { PendapatanRecord, PaymentStatus, ClusterType, SourceType } from '../types';
import { 
  CLUSTER_OPTIONS, 
  SOURCE_OPTIONS, 
  BANK_OPTIONS, 
  BAYAR_KEMANA_OPTIONS 
} from '../data/initialData';
import { formatRupiah } from '../utils/formatters';

interface PendapatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PendapatanRecord) => void;
  initialData?: PendapatanRecord | null;
  totalExistingRecords: number;
}

export const PendapatanModal: React.FC<PendapatanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalExistingRecords,
}) => {
  const isEditing = Boolean(initialData);

  // Client & Code
  const [namaClient, setNamaClient] = useState('');
  const [code, setCode] = useState('');
  const [noInvoice, setNoInvoice] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [statusPembayaran, setStatusPembayaran] = useState<PaymentStatus>('Lunas');

  // Dropdowns per specification
  const [cluster, setCluster] = useState<ClusterType>('Stages');
  const [sources, setSources] = useState<SourceType>('INTERNAL');

  // 5 Komponen Pendapatan (Rp)
  const [feeInterview, setFeeInterview] = useState<number>(0);
  const [feeOjt, setFeeOjt] = useState<number>(0);
  const [feeSelesaiOjt, setFeeSelesaiOjt] = useState<number>(0);
  const [feeManagement, setFeeManagement] = useState<number>(0);
  const [feeGrossSalary, setFeeGrossSalary] = useState<number>(0);

  // Display strings for clean typing
  const [strFeeInterview, setStrFeeInterview] = useState<string>('0');
  const [strFeeOjt, setStrFeeOjt] = useState<string>('0');
  const [strFeeSelesaiOjt, setStrFeeSelesaiOjt] = useState<string>('0');
  const [strFeeManagement, setStrFeeManagement] = useState<string>('0');
  const [strFeeGrossSalary, setStrFeeGrossSalary] = useState<string>('0');

  // Bank Client & PIC
  const [bank, setBank] = useState(BANK_OPTIONS[0]);
  const [atasNamaRekening, setAtasNamaRekening] = useState('');
  const [bayarKemana, setBayarKemana] = useState(BAYAR_KEMANA_OPTIONS[0]);

  const [catatan, setCatatan] = useState('');
  const [errorValidation, setErrorValidation] = useState<string | null>(null);

  // Total calculated from the 5 fee components
  const calculatedTotal = feeInterview + feeOjt + feeSelesaiOjt + feeManagement + feeGrossSalary;

  useEffect(() => {
    if (initialData) {
      setNamaClient(initialData.namaClient || '');
      setCode(initialData.code || initialData.jenisProject || '');
      setNoInvoice(initialData.noInvoice || '');
      setTanggal(initialData.tanggal || new Date().toISOString().split('T')[0]);
      setStatusPembayaran(initialData.statusPembayaran || 'Lunas');

      // Cluster: ensure valid or fallback to Stages
      const c = (initialData.cluster as ClusterType) || 'Stages';
      setCluster(c === 'Fractional' ? 'Fractional' : 'Stages');

      // Sources: ensure valid or fallback to INTERNAL
      const s = (initialData.sources as SourceType) || 'INTERNAL';
      if (s === 'EKSTERNAL' || s === 'MASSIVE') {
        setSources(s);
      } else {
        setSources('INTERNAL');
      }

      // Fees
      const fInterview = initialData.feeInterview || 0;
      const fOjt = initialData.feeOjt || 0;
      const fSelesai = initialData.feeSelesaiOjt || 0;
      const fMgmt = initialData.feeManagement || 0;
      const fGross = initialData.feeGrossSalary || 0;

      // If initial data is legacy without fee breakdown, assign jumlah to feeGrossSalary or feeSelesaiOjt
      if (initialData.jumlah > 0 && fInterview === 0 && fOjt === 0 && fSelesai === 0 && fMgmt === 0 && fGross === 0) {
        setFeeGrossSalary(initialData.jumlah);
        setStrFeeGrossSalary(initialData.jumlah.toString());
        setFeeInterview(0);
        setStrFeeInterview('0');
        setFeeOjt(0);
        setStrFeeOjt('0');
        setFeeSelesaiOjt(0);
        setStrFeeSelesaiOjt('0');
        setFeeManagement(0);
        setStrFeeManagement('0');
      } else {
        setFeeInterview(fInterview);
        setStrFeeInterview(fInterview.toString());
        setFeeOjt(fOjt);
        setStrFeeOjt(fOjt.toString());
        setFeeSelesaiOjt(fSelesai);
        setStrFeeSelesaiOjt(fSelesai.toString());
        setFeeManagement(fMgmt);
        setStrFeeManagement(fMgmt.toString());
        setFeeGrossSalary(fGross);
        setStrFeeGrossSalary(fGross.toString());
      }

      setBank(initialData.bank || BANK_OPTIONS[0]);
      setAtasNamaRekening(initialData.atasNamaRekening || '');
      setBayarKemana(initialData.bayarKemana || BAYAR_KEMANA_OPTIONS[0]);
      setCatatan(initialData.catatan || '');
    } else {
      // Defaults for brand new record
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const sequence = String(totalExistingRecords + 1).padStart(3, '0');

      setNamaClient('');
      setCode(`LNC-${currentYear}-${sequence}`);
      setNoInvoice(`INV/${currentYear}/${currentMonth}/${sequence}`);
      setTanggal(new Date().toISOString().split('T')[0]);
      setStatusPembayaran('Lunas');
      setCluster('Stages');
      setSources('INTERNAL');

      setFeeInterview(0);
      setStrFeeInterview('0');
      setFeeOjt(0);
      setStrFeeOjt('0');
      setFeeSelesaiOjt(0);
      setStrFeeSelesaiOjt('0');
      setFeeManagement(0);
      setStrFeeManagement('0');
      setFeeGrossSalary(0);
      setStrFeeGrossSalary('0');

      setBank(BANK_OPTIONS[0]);
      setAtasNamaRekening('');
      setBayarKemana(BAYAR_KEMANA_OPTIONS[0]);
      setCatatan('');
    }
    setErrorValidation(null);
  }, [initialData, isOpen, totalExistingRecords]);

  if (!isOpen) return null;

  // Generic fee input handler
  const handleFeeChange = (
    valStr: string,
    setNum: (n: number) => void,
    setStr: (s: string) => void
  ) => {
    const raw = valStr.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setNum(num);
    setStr(raw ? num.toString() : '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaClient.trim()) {
      setErrorValidation('Nama Client wajib diisi.');
      return;
    }
    if (!code.trim()) {
      setErrorValidation('Code project wajib diisi.');
      return;
    }
    if (calculatedTotal <= 0) {
      setErrorValidation('Total pendapatan harus lebih dari Rp 0. Masukkan minimal salah satu komponen fee.');
      return;
    }
    if (!tanggal) {
      setErrorValidation('Tanggal transaksi wajib dipilih.');
      return;
    }
    if (!noInvoice.trim()) {
      setErrorValidation('Nomor invoice wajib diisi.');
      return;
    }

    const record: PendapatanRecord = {
      id: initialData?.id || `inc-${Date.now()}`,
      namaClient: namaClient.trim(),
      code: code.trim(),
      cluster,
      sources,
      feeInterview,
      feeOjt,
      feeSelesaiOjt,
      feeManagement,
      feeGrossSalary,
      jumlah: calculatedTotal,
      tanggal,
      statusPembayaran,
      noInvoice: noInvoice.trim(),
      bank,
      atasNamaRekening: atasNamaRekening.trim() || namaClient.trim(),
      bayarKemana,
      catatan: catatan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jenisProject: code.trim(),
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#182622]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        id="modal-pendapatan-container" 
        className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#E8DFD3] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#182622] text-[#FAF7F2] flex items-center justify-center font-bold shadow-sm">
              {isEditing ? <FileText className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#182622]">
                {isEditing ? 'Edit Data Pendapatan' : 'Tambah Data Pendapatan Baru'}
              </h3>
              <p className="text-xs text-[#8C7D6B] mt-0.5">
                Input rincian 5 komponen fee, Code project, Cluster &amp; Bank Client
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorValidation && (
            <div className="p-3.5 rounded-xl bg-[#FDF0EE] border border-[#F4C6C1] text-[#8C281F] text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C281F]" />
              <span>{errorValidation}</span>
            </div>
          )}

          {/* Section 1: Client & Project Identity */}
          <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2.5">
              <span className="text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                IDENTITAS CLIENT &amp; INVOICE
              </span>
              <span className="text-[10px] text-[#A69B8D] font-medium">* Wajib diisi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Client */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  Nama Client <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="field-nama-client"
                    type="text"
                    required
                    value={namaClient}
                    onChange={(e) => setNamaClient(e.target.value)}
                    placeholder="e.g. PT Bank Central Digital"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                  />
                </div>
              </div>

              {/* Code (isi sendiri, pengganti jenis project) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#4D453C]">
                    Code Project <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-[#8C7D6B] uppercase tracking-wider">
                    (Isi Sendiri)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    id="field-code-project"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STG-001 / FRC-JKT-09"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm font-medium text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* No. Invoice */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  No. Invoice <span className="text-red-500">*</span>
                </label>
                <input
                  id="field-no-invoice"
                  type="text"
                  required
                  value={noInvoice}
                  onChange={(e) => setNoInvoice(e.target.value)}
                  placeholder="INV/2026/09/001"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs font-mono text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  Tanggal Transaksi <span className="text-red-500">*</span>
                </label>
                <input
                  id="field-tanggal"
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                />
              </div>

              {/* Status Pembayaran */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  Status Pembayaran
                </label>
                <select
                  id="field-status-pembayaran"
                  value={statusPembayaran}
                  onChange={(e) => setStatusPembayaran(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
                >
                  <option value="Lunas">Lunas (Paid)</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="DP / Uang Muka">DP / Uang Muka</option>
                  <option value="Termin 2">Termin 2</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Cluster (Stages / Fractional) & Sources (INTERNAL, EKSTERNAL, MASSIVE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8DFD3]">
              {/* Cluster Dropdown: Stages & Fractional */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5 flex items-center justify-between">
                  <span>Cluster</span>
                  <span className="text-[10px] text-[#8C7D6B] font-normal">Stages / Fractional</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    id="field-cluster"
                    value={cluster}
                    onChange={(e) => setCluster(e.target.value as ClusterType)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
                  >
                    {CLUSTER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sources Dropdown: INTERNAL, EKSTERNAL, MASSIVE */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5 flex items-center justify-between">
                  <span>Sources</span>
                  <span className="text-[10px] text-[#8C7D6B] font-normal">INTERNAL / EKSTERNAL / MASSIVE</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <select
                    id="field-sources"
                    value={sources}
                    onChange={(e) => setSources(e.target.value as SourceType)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
                  >
                    {SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Rincian 5 Komponen Pendapatan (Rp Angka) */}
          <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E9DF] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#C4A47C]" />
                  RINCIAN KOMPONEN PENDAPATAN (RP)
                </span>
                <p className="text-xs text-[#5C5248] mt-0.5">
                  Isi angka nominal untuk setiap fee. Jika salah satunya tidak ada, isi dengan angka <strong>0 (nol)</strong>.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7D6B] block">
                  Total Pendapatan
                </span>
                <span className="font-serif text-lg sm:text-xl font-bold text-[#182622]">
                  {formatRupiah(calculatedTotal)}
                </span>
              </div>
            </div>

            {/* 5 Fee Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Fee Interview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#182622]">
                    1. Fee Interview
                  </label>
                  <span className="text-[11px] text-[#7A6F62] font-medium">
                    {formatRupiah(feeInterview)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B] text-xs font-bold">
                    Rp
                  </span>
                  <input
                    id="field-fee-interview"
                    type="text"
                    value={strFeeInterview}
                    onChange={(e) => handleFeeChange(e.target.value, setFeeInterview, setStrFeeInterview)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>

              {/* 2. Fee OJT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#182622]">
                    2. Fee OJT
                  </label>
                  <span className="text-[11px] text-[#7A6F62] font-medium">
                    {formatRupiah(feeOjt)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B] text-xs font-bold">
                    Rp
                  </span>
                  <input
                    id="field-fee-ojt"
                    type="text"
                    value={strFeeOjt}
                    onChange={(e) => handleFeeChange(e.target.value, setFeeOjt, setStrFeeOjt)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>

              {/* 3. Fee Selesai OJT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#182622]">
                    3. Fee Selesai OJT
                  </label>
                  <span className="text-[11px] text-[#7A6F62] font-medium">
                    {formatRupiah(feeSelesaiOjt)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B] text-xs font-bold">
                    Rp
                  </span>
                  <input
                    id="field-fee-selesai-ojt"
                    type="text"
                    value={strFeeSelesaiOjt}
                    onChange={(e) => handleFeeChange(e.target.value, setFeeSelesaiOjt, setStrFeeSelesaiOjt)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>

              {/* 4. Fee Management Jika Ada */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#182622]">
                    4. Fee Management (Jika Ada)
                  </label>
                  <span className="text-[11px] text-[#7A6F62] font-medium">
                    {formatRupiah(feeManagement)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B] text-xs font-bold">
                    Rp
                  </span>
                  <input
                    id="field-fee-management"
                    type="text"
                    value={strFeeManagement}
                    onChange={(e) => handleFeeChange(e.target.value, setFeeManagement, setStrFeeManagement)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>

              {/* 5. Fee 45% Dari Gaji Bruto / Kotor */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#182622]">
                    5. Fee 45% Dari Gaji Bruto / Kotor
                  </label>
                  <span className="text-[11px] text-[#7A6F62] font-medium">
                    {formatRupiah(feeGrossSalary)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B] text-xs font-bold">
                    Rp
                  </span>
                  <input
                    id="field-fee-gross-salary"
                    type="text"
                    value={strFeeGrossSalary}
                    onChange={(e) => handleFeeChange(e.target.value, setFeeGrossSalary, setStrFeeGrossSalary)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs font-semibold text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>

            </div>

            {/* Live Calculation Summary Banner */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#5C5248]">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>
                  Penjumlahan 5 komponen fee di atas otomatis menjadi total nominal invoice.
                </span>
              </div>
              <div className="font-bold text-[#182622] text-sm">
                Total: {formatRupiah(calculatedTotal)}
              </div>
            </div>
          </div>

          {/* Section 3: Bank Client & PIC / Perusahaan */}
          <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="border-b border-[#E8DFD3] pb-2.5">
              <span className="text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                INFORMASI BANK &amp; PIC CLIENT
              </span>
              <p className="text-[11px] text-[#7A6F62] mt-0.5">
                Data bank yang digunakan oleh client dan nama PIC / perusahaan pengirim
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bank Client (Bank Apa) */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  Bank Client (Bank yang Digunakan)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <select
                    id="field-bank-client"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
                  >
                    {BANK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Atas Nama (A.N) Siapa / PIC / Perusahaan Client */}
              <div>
                <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                  A.N Siapa (Nama PIC / Perusahaan Client)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="field-atas-nama-rekening"
                    type="text"
                    value={atasNamaRekening}
                    onChange={(e) => setAtasNamaRekening(e.target.value)}
                    placeholder="e.g. PT Client / Bpk. David Handoko (PIC)"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
                  />
                </div>
              </div>
            </div>

            {/* Bayar Kemana (Rekening Penerima Linchub) */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] mb-1.5">
                Rekening Penerima Linchub (Bayar Kemana)
              </label>
              <select
                id="field-bayar-kemana"
                value={bayarKemana}
                onChange={(e) => setBayarKemana(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-xl text-xs sm:text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 cursor-pointer"
              >
                {BAYAR_KEMANA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#7A6F62]">
              Total: <strong className="text-[#182622]">{formatRupiah(calculatedTotal)}</strong>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#E8DFD3] hover:bg-[#FAF7F2] text-[#5C5248] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-save-pendapatan"
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Data Pendapatan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
