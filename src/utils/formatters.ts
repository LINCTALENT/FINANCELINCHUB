import { PaymentStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeStyle(status: PaymentStatus): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'Lunas':
      return {
        bg: 'bg-[#EAEFEA]',
        text: 'text-[#1E4334]',
        border: 'border-[#C8DCBE]',
        dot: 'bg-[#2E7D32]',
      };
    case 'Menunggu Pembayaran':
      return {
        bg: 'bg-[#FFF6E6]',
        text: 'text-[#8A5000]',
        border: 'border-[#F1D7A4]',
        dot: 'bg-[#E69500]',
      };
    case 'DP / Uang Muka':
    case 'Termin 2':
      return {
        bg: 'bg-[#F2EDFF]',
        text: 'text-[#4A3280]',
        border: 'border-[#D7C7F7]',
        dot: 'bg-[#673AB7]',
      };
    case 'Dibatalkan':
      return {
        bg: 'bg-[#FDF0EE]',
        text: 'text-[#8C281F]',
        border: 'border-[#F4C6C1]',
        dot: 'bg-[#D32F2F]',
      };
    default:
      return {
        bg: 'bg-[#F5EFE6]',
        text: 'text-[#5C5248]',
        border: 'border-[#E2D8C9]',
        dot: 'bg-[#8C7D6B]',
      };
  }
}
