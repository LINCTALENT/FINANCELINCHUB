import { DatabaseConfig, PendapatanRecord } from '../types';
import { INITIAL_PENDAPATAN_DATA } from '../data/initialData';

const STORAGE_KEY_DATA = 'linchub_pendapatan_records_v2';
const LEGACY_STORAGE_KEY = 'linchub_pendapatan_records';
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

/**
 * Migration helper to ensure legacy records have code and fee components
 */
function normalizeRecord(r: any, idx: number): PendapatanRecord {
  const currentYear = new Date().getFullYear();
  const code = r.code || r.jenisProject || `LNC-${currentYear}-${String(idx + 1).padStart(3, '0')}`;
  
  // Cluster fallback
  let cluster = r.cluster;
  if (cluster !== 'Stages' && cluster !== 'Fractional') {
    cluster = idx % 2 === 0 ? 'Stages' : 'Fractional';
  }

  // Sources fallback
  let sources = r.sources;
  if (sources !== 'INTERNAL' && sources !== 'EKSTERNAL' && sources !== 'MASSIVE') {
    sources = idx % 3 === 0 ? 'INTERNAL' : idx % 3 === 1 ? 'EKSTERNAL' : 'MASSIVE';
  }

  const feeInterview = Number(r.feeInterview || 0);
  const feeOjt = Number(r.feeOjt || 0);
  const feeSelesaiOjt = Number(r.feeSelesaiOjt || 0);
  const feeManagement = Number(r.feeManagement || 0);
  const feeGrossSalary = Number(r.feeGrossSalary || 0);

  let totalJumlah = Number(r.jumlah || 0);
  const feeSum = feeInterview + feeOjt + feeSelesaiOjt + feeManagement + feeGrossSalary;

  // If fees are 0 but total jumlah > 0 (legacy record), assign to feeGrossSalary
  let finalGross = feeGrossSalary;
  if (feeSum === 0 && totalJumlah > 0) {
    finalGross = totalJumlah;
  } else if (feeSum > 0) {
    totalJumlah = feeSum;
  }

  return {
    id: r.id || `inc-${Date.now()}-${idx}`,
    namaClient: r.namaClient || 'Client Linchub',
    code,
    cluster,
    sources,
    feeInterview,
    feeOjt,
    feeSelesaiOjt,
    feeManagement,
    feeGrossSalary: finalGross,
    jumlah: totalJumlah,
    tanggal: r.tanggal || new Date().toISOString().split('T')[0],
    statusPembayaran: r.statusPembayaran || 'Lunas',
    noInvoice: r.noInvoice || `INV/${currentYear}/09/${String(idx + 1).padStart(3, '0')}`,
    bank: r.bank || 'BCA',
    atasNamaRekening: r.atasNamaRekening || r.namaClient || 'PT Client',
    bayarKemana: r.bayarKemana || 'Rekening Operasional PT Linchub',
    catatan: r.catatan,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt,
  };
}

export function loadLocalRecords(): PendapatanRecord[] {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_DATA);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r, i) => normalizeRecord(r, i));
      }
    }

    // Check if legacy storage exists
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const migrated = parsedLegacy.map((r, i) => normalizeRecord(r, i));
        saveLocalRecords(migrated);
        return migrated;
      }
    }
  } catch (e) {
    console.error('Failed to load local records', e);
  }

  // Initialize with authentic seed data if empty
  saveLocalRecords(INITIAL_PENDAPATAN_DATA);
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
    return result.map((r, i) => normalizeRecord(r, i));
  }
  if (result.records && Array.isArray(result.records)) {
    return result.records.map((r: any, i: number) => normalizeRecord(r, i));
  }
  throw new Error('Format data dari Google Sheet tidak dikenali');
}

/**
 * Push all records to Google Sheets Web App
 */
export async function syncToGoogleSheet(webAppUrl: string, records: PendapatanRecord[]): Promise<void> {
  await fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'sync_all',
      records: records,
      updatedAt: new Date().toISOString(),
    }),
  });
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

  return data.records.map((r: any, idx: number) => {
    const f = r.fields || {};
    return normalizeRecord({
      id: r.id,
      namaClient: f['Nama Client'] || f['namaClient'],
      code: f['Code'] || f['code'] || f['Jenis Project'],
      cluster: f['Cluster'] || f['cluster'],
      sources: f['Sources'] || f['sources'],
      feeInterview: f['Fee Interview'] || f['feeInterview'],
      feeOjt: f['Fee OJT'] || f['feeOjt'],
      feeSelesaiOjt: f['Fee Selesai OJT'] || f['feeSelesaiOjt'],
      feeManagement: f['Fee Management'] || f['feeManagement'],
      feeGrossSalary: f['Fee 45% Gaji Bruto'] || f['feeGrossSalary'],
      jumlah: f['Jumlah'] || f['jumlah'],
      tanggal: f['Tanggal'] || f['tanggal'],
      statusPembayaran: f['Status Pembayaran'] || f['statusPembayaran'],
      noInvoice: f['No. Invoice'] || f['noInvoice'],
      bank: f['Bank'] || f['bank'],
      atasNamaRekening: f['Atas Nama Rekening'] || f['atasNamaRekening'],
      bayarKemana: f['Bayar Kemana'] || f['bayarKemana'],
      createdAt: r.createdTime,
    }, idx);
  });
}

/**
 * Helper to export records into Google Sheets / Excel CSV format
 */
export function exportToCsv(records: PendapatanRecord[]): void {
  const headers = [
    'No. Invoice',
    'Code Project',
    'Tanggal',
    'Nama Client',
    'A.N Rekening (PIC / Perusahaan)',
    'Cluster (Stages/Fractional)',
    'Sources (INTERNAL/EKSTERNAL/MASSIVE)',
    'Bank Client',
    'Fee Interview',
    'Fee OJT',
    'Fee Selesai OJT',
    'Fee Management',
    'Fee 45% Gaji Bruto',
    'Total Pendapatan (IDR)',
    'Status Pembayaran',
    'Rekening Penerima (Bayar Kemana)',
  ];

  const rows = records.map((r) => [
    `"${(r.noInvoice || '').replace(/"/g, '""')}"`,
    `"${(r.code || r.jenisProject || '').replace(/"/g, '""')}"`,
    `"${r.tanggal}"`,
    `"${(r.namaClient || '').replace(/"/g, '""')}"`,
    `"${(r.atasNamaRekening || '').replace(/"/g, '""')}"`,
    `"${r.cluster || 'Stages'}"`,
    `"${r.sources || 'INTERNAL'}"`,
    `"${(r.bank || '').replace(/"/g, '""')}"`,
    r.feeInterview || 0,
    r.feeOjt || 0,
    r.feeSelesaiOjt || 0,
    r.feeManagement || 0,
    r.feeGrossSalary || 0,
    r.jumlah,
    `"${r.statusPembayaran}"`,
    `"${(r.bayarKemana || '').replace(/"/g, '""')}"`,
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
        "id", "namaClient", "code", "cluster", "sources",
        "feeInterview", "feeOjt", "feeSelesaiOjt", "feeManagement", "feeGrossSalary",
        "jumlah", "tanggal", "statusPembayaran", "noInvoice",
        "bank", "atasNamaRekening", "bayarKemana", "createdAt"
      ];
      sheet.appendRow(headers);
      for (var k = 0; k < body.records.length; k++) {
        var r = body.records[k];
        sheet.appendRow([
          r.id || "", r.namaClient || "", r.code || "", r.cluster || "Stages", r.sources || "INTERNAL",
          r.feeInterview || 0, r.feeOjt || 0, r.feeSelesaiOjt || 0, r.feeManagement || 0, r.feeGrossSalary || 0,
          r.jumlah || 0, r.tanggal || "", r.statusPembayaran || "Lunas", r.noInvoice || "",
          r.bank || "", r.atasNamaRekening || "", r.bayarKemana || "", r.createdAt || ""
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
