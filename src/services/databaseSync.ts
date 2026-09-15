import { DatabaseConfig, PendapatanRecord } from '../types';
import { INITIAL_PENDAPATAN_DATA } from '../data/initialData';

const STORAGE_KEY_DATA = 'linchub_pendapatan_records';
const STORAGE_KEY_DB_CONFIG = 'linchub_database_config';

export function getDatabaseConfig(): DatabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading db config', e);
  }
  return {
    provider: 'local',
    autoSync: false,
  };
}

export function saveDatabaseConfig(config: DatabaseConfig) {
  localStorage.setItem(STORAGE_KEY_DB_CONFIG, JSON.stringify(config));
}

export function loadLocalRecords(): PendapatanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local records', e);
  }
  // Initialize with authentic seed data if empty
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(INITIAL_PENDAPATAN_DATA));
  return INITIAL_PENDAPATAN_DATA;
}

export function saveLocalRecords(records: PendapatanRecord[]) {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(records));
}

/**
 * Fetch records from remote Google Sheets Web App
 */
export async function fetchFromGoogleSheet(webAppUrl: string): Promise<PendapatanRecord[]> {
  const response = await fetch(webAppUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari Google Sheets (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (Array.isArray(result)) {
    return result;
  }
  if (result.records && Array.isArray(result.records)) {
    return result.records;
  }
  throw new Error('Format data dari Google Sheet tidak dikenali');
}

/**
 * Push all records to Google Sheets Web App
 */
export async function syncToGoogleSheet(webAppUrl: string, records: PendapatanRecord[]): Promise<void> {
  const response = await fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors', // Google Apps Script redirects require handling or no-cors
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'sync_all',
      records: records,
      updatedAt: new Date().toISOString(),
    }),
  });
  // Note: with no-cors mode, response.ok is opaque, but request is transmitted
}

/**
 * Fetch records from Airtable
 */
export async function fetchFromAirtable(apiKey: string, baseId: string, tableName: string): Promise<PendapatanRecord[]> {
  const cleanTable = encodeURIComponent(tableName || 'Pendapatan');
  const url = `https://api.airtable.com/v0/${baseId}/${cleanTable}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal terhubung ke Airtable (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.records) {
    return [];
  }

  return data.records.map((r: any) => ({
    id: r.id,
    namaClient: r.fields['Nama Client'] || r.fields['namaClient'] || 'Tanpa Nama',
    jumlah: Number(r.fields['Jumlah'] || r.fields['jumlah'] || 0),
    tanggal: r.fields['Tanggal'] || r.fields['tanggal'] || new Date().toISOString().split('T')[0],
    statusPembayaran: r.fields['Status Pembayaran'] || r.fields['statusPembayaran'] || 'Lunas',
    jenisProject: r.fields['Jenis Project'] || r.fields['jenisProject'] || '-',
    cluster: r.fields['Cluster'] || r.fields['cluster'] || '-',
    sources: r.fields['Sources'] || r.fields['sources'] || '-',
    noInvoice: r.fields['No. Invoice'] || r.fields['noInvoice'] || '-',
    bayarKemana: r.fields['Bayar Kemana'] || r.fields['bayarKemana'] || '-',
    atasNamaRekening: r.fields['Atas Nama Rekening'] || r.fields['atasNamaRekening'] || '-',
    bank: r.fields['Bank'] || r.fields['bank'] || '-',
    createdAt: r.createdTime || new Date().toISOString(),
  }));
}

/**
 * Helper to export records into Google Sheets CSV format
 */
export function exportToCsv(records: PendapatanRecord[]): void {
  const headers = [
    'No. Invoice',
    'Tanggal',
    'Nama Client',
    'Jumlah (IDR)',
    'Status Pembayaran',
    'Jenis Project',
    'Cluster',
    'Sources',
    'Bayar Kemana',
    'Atas Nama Rekening',
    'Bank',
  ];

  const rows = records.map((r) => [
    `"${(r.noInvoice || '').replace(/"/g, '""')}"`,
    `"${r.tanggal}"`,
    `"${(r.namaClient || '').replace(/"/g, '""')}"`,
    r.jumlah,
    `"${r.statusPembayaran}"`,
    `"${(r.jenisProject || '').replace(/"/g, '""')}"`,
    `"${(r.cluster || '').replace(/"/g, '""')}"`,
    `"${(r.sources || '').replace(/"/g, '""')}"`,
    `"${(r.bayarKemana || '').replace(/"/g, '""')}"`,
    `"${(r.atasNamaRekening || '').replace(/"/g, '""')}"`,
    `"${(r.bank || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Linchub_Pendapatan_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ready-to-copy Google Apps Script code for zero-backend Google Sheet setup
 */
export const SAMPLE_APPS_SCRIPT_CODE = `// ========================================================
// GOOGLE APPS SCRIPT UNTUK DATABASE LINCHUB FINANCE
// Cara Pakai:
// 1. Buat Google Sheet baru di sheet.new
// 2. Klik Menu: Ekstensi > Apps Script
// 3. Hapus semua kode, paste kode ini
// 4. Klik tombol "Deploy" (Terapkan) > "Deployment Baru"
// 5. Pilih jenis: "Aplikasi Web" (Web App)
// 6. Jalankan sebagai: "Saya" (Me)
// 7. Siapa yang memiliki akses: "Siapa saja" (Anyone)
// 8. Salin URL Web App dan tempel ke Aplikasi Linchub Finance!
// ========================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  var headers = data[0];
  var records = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    records.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify(records)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (body.action === 'sync_all' && body.records) {
      sheet.clear();
      var headers = [
        "id", "namaClient", "jumlah", "tanggal", "statusPembayaran",
        "jenisProject", "cluster", "sources", "noInvoice", "bayarKemana",
        "atasNamaRekening", "bank", "createdAt"
      ];
      sheet.appendRow(headers);
      for (var k = 0; k < body.records.length; k++) {
        var r = body.records[k];
        sheet.appendRow([
          r.id || "", r.namaClient || "", r.jumlah || 0, r.tanggal || "",
          r.statusPembayaran || "", r.jenisProject || "", r.cluster || "",
          r.sources || "", r.noInvoice || "", r.bayarKemana || "",
          r.atasNamaRekening || "", r.bank || "", r.createdAt || ""
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: body.records.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
