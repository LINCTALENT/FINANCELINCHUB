export type PaymentStatus = 
  | 'Lunas'
  | 'Menunggu Pembayaran'
  | 'DP / Uang Muka'
  | 'Termin 2'
  | 'Dibatalkan';

export type ClusterType = 'Stages' | 'Fractional';
export type SourceType = 'INTERNAL' | 'EKSTERNAL' | 'MASSIVE';

export interface PendapatanRecord {
  id: string;
  namaClient: string;
  code: string; // Code project yang diisi sendiri
  cluster: ClusterType | string; // Stages | Fractional
  sources: SourceType | string; // INTERNAL | EKSTERNAL | MASSIVE
  
  // Rincian Komponen Pendapatan (Rp)
  feeInterview: number; // Fee Interview
  feeOjt: number; // Fee OJT
  feeSelesaiOjt: number; // Fee Selesai OJT
  feeManagement: number; // Fee Management Jika Ada
  feeGrossSalary: number; // Fee 45% Dari Gaji Bruto / Kotor
  jumlah: number; // Total Akumulasi Pendapatan

  tanggal: string; // YYYY-MM-DD
  statusPembayaran: PaymentStatus;
  noInvoice: string;

  // Informasi Bank Client & PIC
  bank: string; // Bank Client (BCA, Mandiri, BNI, dll)
  atasNamaRekening: string; // A.N PIC / Perusahaan Client
  bayarKemana: string; // Rekening Penerima Linchub

  catatan?: string;
  createdAt: string;
  updatedAt?: string;

  // Backward compatibility field
  jenisProject?: string;
}

export type ActiveTab = 'input' | 'analisa';

export interface DatabaseConfig {
  provider: 'local' | 'googlesheet' | 'airtable';
  googleSheetWebAppUrl?: string;
  googleSheetCsvUrl?: string;
  airtableApiKey?: string;
  airtableBaseId?: string;
  airtableTableName?: string;
  lastSynced?: string;
  autoSync: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin_finance';
}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
