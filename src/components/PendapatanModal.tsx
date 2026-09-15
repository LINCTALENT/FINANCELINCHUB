import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Calendar, CreditCard, DollarSign, Tag, Check, Layers, Share2, FileText } from 'lucide-react';
import { PendapatanRecord, PaymentStatus } from '../types';
import { 
  CLUSTER_OPTIONS, 
  PROJECT_TYPE_OPTIONS, 
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

  const [namaClient, setNamaClient] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [jumlahDisplay, setJumlahDisplay] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [statusPembayaran, setStatusPembayaran] = useState<PaymentStatus>('Lunas');
  const [jenisProject, setJenisProject] = useState(PROJECT_TYPE_OPTIONS[0]);
  const [cluster, setCluster] = useState(CLUSTER_OPTIONS[0]);
  const [sources, setSources] = useState(SOURCE_OPTIONS[0]);
  const [noInvoice, setNoInvoice] = useState('');
  const [bayarKemana, setBayarKemana] = useState(BAYAR_KEMANA_OPTIONS[0]);
  const [atasNamaRekening, setAtasNamaRekening] = useState('PT Linchub Network Indonesia');
  const [bank, setBank] = useState(BANK_OPTIONS[0]);
  const [catatan, setCatatan] = useState('');
  const [errorValidation, setErrorValidation] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNamaClient(initialData.namaClient);
      setJumlah(initialData.jumlah);
      setJumlahDisplay(initialData.jumlah ? initialData.jumlah.toString() : '');
      setTanggal(initialData.tanggal);
      setStatusPembayaran(initialData.statusPembayaran);
      setJenisProject(initialData.jenisProject);
      setCluster(initialData.cluster);
      setSources(initialData.sources);
      setNoInvoice(initialData.noInvoice);
      setBayarKemana(initialData.bayarKemana);
      setAtasNamaRekening(initialData.atasNamaRekening);
      setBank(initialData.bank);
      setCatatan(initialData.catatan || '');
    } else {
      // Default new record with auto invoice format
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const sequence = String(totalExistingRecords + 1).padStart(3, '0');
      
      setNamaClient('');
      setJumlah(0);
      setJumlahDisplay('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setStatusPembayaran('Lunas');
      setJenisProject(PROJECT_TYPE_OPTIONS[0]);
      setCluster(CLUSTER_OPTIONS[0]);
      setSources(SOURCE_OPTIONS[0]);
      setNoInvoice(`INV/${currentYear}/${currentMonth}/${sequence}`);
      setBayarKemana(BAYAR_KEMANA_OPTIONS[0]);
      setAtasNamaRekening('PT Linchub Network Indonesia');
      setBank(BANK_OPTIONS[0]);
      setCatatan('');
    }
    setErrorValidation(null);
  }, [initialData, isOpen, totalExistingRecords]);

  if (!isOpen) return null;

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    setJumlah(num);
    setJumlahDisplay(rawVal);
  };

  const handleQuickAmount = (val: number) => {
    setJumlah(val);
    setJumlahDisplay(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaClient.trim()) {
      setErrorValidation('Nama Client wajib diisi.');
      return;
    }
    if (jumlah <= 0) {
      setErrorValidation('Jumlah pendapatan harus lebih dari 0.');
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
      jumlah,
      tanggal,
      statusPembayaran,
      jenisProject,
      cluster,
      sources,
      noInvoice: noInvoice.trim(),
      bayarKemana,
      atasNamaRekening: atasNamaRekening.trim(),
      bank,
      catatan: catatan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#182622]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        id="modal-pendapatan-container" 
        className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#E8DFD3] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#182622] text-[#FAF7F2] flex items-center justify-center font-bold">
              {isEditing ? <FileText className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#182622]">
                {isEditing ? 'Edit Data Pendapatan' : 'Tambah Data Pendapatan Client'}
              </h3>
              <p className="text-xs text-[#8C7D6B] mt-0.5">
                Isi lengkap 11 field administrasi invoice &amp; pembayaran
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorValidation && (
            <div className="p-3.5 rounded-xl bg-[#FDF0EE] border border-[#F4C6C1] text-[#8C281F] text-xs font-medium">
              {errorValidation}
            </div>
          )}

          {/* Section 1: Client & Invoice Core */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 1: Nama Client */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                1. Nama Client <span className="text-red-500">*</span>
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
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                />
              </div>
            </div>

            {/* Field 8: No. Invoice */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                8. No. Invoice <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  id="field-no-invoice"
                  type="text"
                  required
                  value={noInvoice}
                  onChange={(e) => setNoInvoice(e.target.value)}
                  placeholder="INV/2026/09/001"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] font-mono placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Jumlah & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 2: Jumlah */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider">
                  2. Jumlah Pendapatan (IDR) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-bold text-[#182622]">
                  {formatRupiah(jumlah)}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7D6B] font-bold text-xs">
                  Rp
                </div>
                <input
                  id="field-jumlah"
                  type="text"
                  required
                  value={jumlahDisplay}
                  onChange={handleJumlahChange}
                  placeholder="0"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm font-semibold text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                />
              </div>
              {/* Quick Nominal Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[15000000, 25000000, 35000000, 50000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-2 py-0.5 rounded-md bg-[#FAF7F2] hover:bg-[#EAE2D4] border border-[#E8DFD3] text-[11px] font-medium text-[#5C5248] cursor-pointer"
                  >
                    +{val / 1000000}jt
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Tanggal */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                3. Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="field-tanggal"
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Project Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 4: Status Pembayaran (dropdown) */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                4. Status Pembayaran
              </label>
              <select
                id="field-status-pembayaran"
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm font-medium text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
              >
                <option value="Lunas">Lunas (Paid)</option>
                <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                <option value="DP / Uang Muka">DP / Uang Muka (50%)</option>
                <option value="Termin 2">Termin 2</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Field 5: Jenis Project */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                5. Jenis Project
              </label>
              <select
                id="field-jenis-project"
                value={jenisProject}
                onChange={(e) => setJenisProject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
              >
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Field 6: Cluster */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                6. Cluster Industri
              </label>
              <select
                id="field-cluster"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
              >
                {CLUSTER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Sources, Bayar Kemana, Bank & Rekening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 7: Sources */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                7. Sources (Sumber Client)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                  <Share2 className="w-4 h-4" />
                </div>
                <select
                  id="field-sources"
                  value={sources}
                  onChange={(e) => setSources(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 9: Bayar Kemana */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                9. Bayar Kemana
              </label>
              <select
                id="field-bayar-kemana"
                value={bayarKemana}
                onChange={(e) => setBayarKemana(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
              >
                {BAYAR_KEMANA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Atas Nama Rekening & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 10: Atas Nama Rekening */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                10. Atas Nama Rekening
              </label>
              <input
                id="field-atas-nama-rekening"
                type="text"
                value={atasNamaRekening}
                onChange={(e) => setAtasNamaRekening(e.target.value)}
                placeholder="PT Linchub Network Indonesia"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
              />
            </div>

            {/* Field 11: Bank */}
            <div>
              <label className="block text-xs font-bold text-[#4D453C] uppercase tracking-wider mb-1.5">
                11. Bank Rekening Tujuan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7D6B]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <select
                  id="field-bank"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622]"
                >
                  {BANK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E8DFD3] hover:bg-[#FAF7F2] text-[#5C5248] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-pendapatan"
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Data Pendapatan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
