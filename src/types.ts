export type PaymentStatus = 
  | 'Lunas'
  | 'Menunggu Pembayaran'
  | 'DP / Uang Muka'
  | 'Termin 2'
  | 'Dibatalkan';

export interface PendapatanRecord {
  id: string;
  namaClient: string;
  jumlah: number;
  tanggal: string; // YYYY-MM-DD
  statusPembayaran: PaymentStatus;
  jenisProject: string;
  cluster: string;
  sources: string;
  noInvoice: string;
  bayarKemana: string;
  atasNamaRekening: string;
  bank: string;
  catatan?: string;
  createdAt: string;
  updatedAt?: string;
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
