import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Filter, 
  RotateCcw,
  CheckCircle2,
  Building2,
  Award,
  Layers,
  Share2,
  Coins,
  Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { PendapatanRecord } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AnalisaProps {
  records: PendapatanRecord[];
}

const CLIENT_CHART_COLORS = [
  '#182622', // Deep forest pine
  '#C4A47C', // Warm gold
  '#3E5C52', // Olive slate
  '#8C7D6B', // Warm bronze
  '#E0D4C3', // Light linen
  '#5C5248', // Charcoal umber
  '#A68A64', // Sand tan
  '#2C423B', // Dark teal slate
];

export const Analisa: React.FC<AnalisaProps> = ({ records }) => {
  // Date range filter state (dari - sampai) that applies to both charts
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string>('all');

  // Filter records by the date range
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (startDate && r.tanggal < startDate) {
        return false;
      }
      if (endDate && r.tanggal > endDate) {
        return false;
      }
      return true;
    });
  }, [records, startDate, endDate]);

  // Card 1: Total Pendapatan (semua data yang masuk dalam filter)
  const totalPendapatanSemua = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [filteredRecords]);

  // Card 2: Total Bulan Ini
  const totalBulanIni = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return records
      .filter((r) => r.tanggal.startsWith(currentYearMonth))
      .reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [records]);

  // Card 3: Jumlah Client Aktif
  const jumlahClientAktif = useMemo(() => {
    const unique = new Set(filteredRecords.map((r) => r.namaClient).filter(Boolean));
    return unique.size;
  }, [filteredRecords]);

  // 5 Fee Components Analytics
  const feeBreakdown = useMemo(() => {
    const totals = filteredRecords.reduce(
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

    const total = totalPendapatanSemua || 1;
    return [
      { name: 'Fee Interview', amount: totals.interview, pct: (totals.interview / total) * 100 },
      { name: 'Fee OJT', amount: totals.ojt, pct: (totals.ojt / total) * 100 },
      { name: 'Fee Selesai OJT', amount: totals.selesaiOjt, pct: (totals.selesaiOjt / total) * 100 },
      { name: 'Fee Management', amount: totals.management, pct: (totals.management / total) * 100 },
      { name: 'Fee 45% Gaji Bruto', amount: totals.grossSalary, pct: (totals.grossSalary / total) * 100 },
    ];
  }, [filteredRecords, totalPendapatanSemua]);

  // Cluster & Sources breakdown
  const clusterBreakdown = useMemo(() => {
    const stagesTotal = filteredRecords.filter((r) => r.cluster === 'Stages').reduce((a, c) => a + c.jumlah, 0);
    const fractionalTotal = filteredRecords.filter((r) => r.cluster === 'Fractional').reduce((a, c) => a + c.jumlah, 0);
    return { stagesTotal, fractionalTotal };
  }, [filteredRecords]);

  const sourcesBreakdown = useMemo(() => {
    const internal = filteredRecords.filter((r) => r.sources === 'INTERNAL').reduce((a, c) => a + c.jumlah, 0);
    const eksternal = filteredRecords.filter((r) => r.sources === 'EKSTERNAL').reduce((a, c) => a + c.jumlah, 0);
    const massive = filteredRecords.filter((r) => r.sources === 'MASSIVE').reduce((a, c) => a + c.jumlah, 0);
    return { internal, eksternal, massive };
  }, [filteredRecords]);

  // Quick Date Preset Handlers
  const handlePreset = (preset: 'all' | 'this_year' | 'last_12' | 'last_30') => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_year') {
      const startOfYear = `${today.getFullYear()}-01-01`;
      setStartDate(startOfYear);
      setEndDate(todayStr);
    } else if (preset === 'last_12') {
      const d = new Date();
      d.setMonth(d.getMonth() - 11);
      d.setDate(1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'last_30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  const handleResetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset('all');
  };

  // Grafik 1: Bar chart total pendapatan per bulan (12 bulan terakhir)
  const monthlyBarData = useMemo(() => {
    const months: Array<{ key: string; label: string; total: number; count: number }> = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d);
      months.push({ key, label, total: 0, count: 0 });
    }

    filteredRecords.forEach((r) => {
      const recordYearMonth = r.tanggal.slice(0, 7);
      const match = months.find((m) => m.key === recordYearMonth);
      if (match) {
        match.total += r.jumlah;
        match.count += 1;
      }
    });

    return months;
  }, [filteredRecords]);

  // Grafik 2: Pie & Bar chart per client (top contributor)
  const clientBreakdownData = useMemo(() => {
    const clientMap: { [client: string]: { total: number; count: number } } = {};

    filteredRecords.forEach((r) => {
      const name = r.namaClient || 'Lainnya';
      if (!clientMap[name]) {
        clientMap[name] = { total: 0, count: 0 };
      }
      clientMap[name].total += r.jumlah;
      clientMap[name].count += 1;
    });

    const list = Object.keys(clientMap).map((name) => ({
      name,
      total: clientMap[name].total,
      count: clientMap[name].count,
      percentage: totalPendapatanSemua > 0 ? (clientMap[name].total / totalPendapatanSemua) * 100 : 0,
    }));

    list.sort((a, b) => b.total - a.total);

    if (list.length > 5) {
      const top5 = list.slice(0, 5);
      const others = list.slice(5);
      const othersTotal = others.reduce((sum, item) => sum + item.total, 0);
      const othersCount = others.reduce((sum, item) => sum + item.count, 0);
      return {
        allRanked: list,
        pieData: [
          ...top5,
          {
            name: 'Client Lainnya',
            total: othersTotal,
            count: othersCount,
            percentage: (othersTotal / totalPendapatanSemua) * 100,
          },
        ],
      };
    }

    return {
      allRanked: list,
      pieData: list,
    };
  }, [filteredRecords, totalPendapatanSemua]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Pendapatan (Semua) */}
        <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7D6B]">
              Total Pendapatan (Semua)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal text-[#182622] mt-1 tracking-tight">
            {formatRupiah(totalPendapatanSemua)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#2E7D32] font-semibold mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Akumulasi {filteredRecords.length} invoice terdata</span>
          </div>
        </div>

        {/* Card 2: Total Bulan Ini */}
        <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7D6B]">
              Total Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal text-[#182622] mt-1 tracking-tight">
            {formatRupiah(totalBulanIni)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#8C7D6B] font-medium mt-3">
            <span>Periode berjalan kalender aktif</span>
          </div>
        </div>

        {/* Card 3: Jumlah Client Aktif */}
        <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C7D6B]">
              Jumlah Client Aktif
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-normal text-[#182622] mt-1 tracking-tight">
            {jumlahClientAktif} <span className="text-sm font-normal text-[#7A6F62]">Perusahaan</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#5C5248] font-medium mt-3">
            <Building2 className="w-3.5 h-3.5 text-[#8C7D6B]" />
            <span>Mitra aktif terdaftar</span>
          </div>
        </div>

      </div>

      {/* Date Filter Bar (Dari - Sampai) */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#8C7D6B] uppercase flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              FILTER RENTANG TANGGAL ANALISA
            </span>
            <p className="text-xs text-[#5C5248] mt-0.5">
              Filter tanggal berlaku serentak untuk semua grafik dan rincian fee
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Semua Waktu' },
              { id: 'this_year', label: 'Tahun 2026' },
              { id: 'last_12', label: '12 Bulan Terakhir' },
              { id: 'last_30', label: '30 Hari Terakhir' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-[#182622] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] text-[#5C5248] hover:bg-[#EAE2D4] border border-[#E8DFD3]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Inputs (Dari - Sampai) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 pt-4 border-t border-[#F0E9DF] items-center">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-[#7A6F62] uppercase tracking-wider mb-1">
              Dari Tanggal
            </label>
            <input
              id="filter-analisa-start"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-[#7A6F62] uppercase tracking-wider mb-1">
              Sampai Tanggal
            </label>
            <input
              id="filter-analisa-end"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs text-[#182622] focus:outline-none focus:ring-2 focus:ring-[#182622]/20"
            />
          </div>

          <div className="sm:col-span-2 flex items-end pt-5 sm:pt-0">
            <button
              onClick={handleResetDateFilter}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#EAE2D4] border border-[#DDD2C1] rounded-xl text-xs font-semibold text-[#182622] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Required Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Grafik 1: Bar chart total pendapatan per bulan (12 bulan terakhir) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7D6B] block">
                  GRAFIK 1
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#182622] mt-0.5">
                  Pendapatan Bulanan (12 Bulan Terakhir)
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] font-semibold text-[#5C5248]">
                Juta Rupiah
              </div>
            </div>

            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E9DF" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: '#7A6F62' }} 
                    axisLine={{ stroke: '#E8DFD3' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#7A6F62' }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Total Pendapatan']}
                    labelFormatter={(label) => `Bulan: ${label}`}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E8DFD3',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#182622',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#182622" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0E9DF] flex items-center justify-between text-xs text-[#7A6F62]">
            <span>Menampilkan tren pendapatan bulanan</span>
            <span className="font-semibold text-[#182622]">
              Rata-rata: {formatRupiah(totalPendapatanSemua / 12)} / bln
            </span>
          </div>
        </div>

        {/* Grafik 2: Pie / Bar chart per client (top contributor) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7D6B] block">
                  GRAFIK 2
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#182622] mt-0.5">
                  Kontribusi Per Client (Top Contributor)
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622]">
                <PieChartIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-64 w-full mt-4 flex items-center justify-center">
              {clientBreakdownData.pieData.length === 0 ? (
                <p className="text-xs text-[#8C7D6B]">Tidak ada data client pada rentang ini.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientBreakdownData.pieData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {clientBreakdownData.pieData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CLIENT_CHART_COLORS[index % CLIENT_CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(Number(val)), 'Kontribusi']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E8DFD3',
                        borderRadius: '16px',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top 3 Quick Legend */}
          <div className="space-y-2 mt-2 pt-3 border-t border-[#F0E9DF]">
            {clientBreakdownData.pieData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: CLIENT_CHART_COLORS[idx % CLIENT_CHART_COLORS.length] }} 
                  />
                  <span className="font-semibold text-[#182622] truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[#7A6F62]">
                  <span>{item.percentage.toFixed(1)}%</span>
                  <span className="font-bold text-[#182622]">{formatRupiah(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Rincian Kontribusi 5 Komponen Fee & Distribusi Cluster/Source */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 5 Komponen Fee Contribution */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DF] mb-4">
            <div className="flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-[#C4A47C]" />
              <div>
                <h3 className="font-serif text-lg font-medium text-[#182622]">
                  Analisa 5 Komponen Fee Pendapatan
                </h3>
                <p className="text-xs text-[#8C7D6B]">
                  Perbandingan porsi Interview, OJT, Selesai OJT, Management, dan 45% Gaji Bruto
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {feeBreakdown.map((fee, idx) => (
              <div key={fee.name} className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#182622]">{fee.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8C7D6B] font-semibold">{fee.pct.toFixed(1)}%</span>
                    <span className="font-bold text-[#182622]">{formatRupiah(fee.amount)}</span>
                  </div>
                </div>
                <div className="w-full bg-[#E8DFD3] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#182622] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, fee.pct))}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster & Sources Breakdown */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DF] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C4A47C]" />
                <h3 className="font-serif text-lg font-medium text-[#182622]">
                  Cluster &amp; Sources
                </h3>
              </div>
            </div>

            {/* Cluster (Stages vs Fractional) */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider block mb-2">
                Distribusi Cluster
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#EAEFEA] border border-[#C8DCBE]">
                  <span className="text-[10px] font-bold text-[#1E4334] uppercase block">Stages</span>
                  <span className="font-serif text-base font-bold text-[#1E4334] mt-0.5 block">
                    {formatRupiah(clusterBreakdown.stagesTotal)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F2EDFF] border border-[#D7C7F7]">
                  <span className="text-[10px] font-bold text-[#4A3280] uppercase block">Fractional</span>
                  <span className="font-serif text-base font-bold text-[#4A3280] mt-0.5 block">
                    {formatRupiah(clusterBreakdown.fractionalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sources (INTERNAL, EKSTERNAL, MASSIVE) */}
            <div>
              <span className="text-[11px] font-bold text-[#8C7D6B] uppercase tracking-wider block mb-2">
                Distribusi Sources
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-center">
                  <span className="text-[10px] font-bold text-[#5C5248] uppercase block">Internal</span>
                  <span className="text-xs font-bold text-[#182622] mt-0.5 block truncate">
                    {formatRupiah(sourcesBreakdown.internal)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-center">
                  <span className="text-[10px] font-bold text-[#5C5248] uppercase block">Eksternal</span>
                  <span className="text-xs font-bold text-[#182622] mt-0.5 block truncate">
                    {formatRupiah(sourcesBreakdown.eksternal)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-center">
                  <span className="text-[10px] font-bold text-[#5C5248] uppercase block">Massive</span>
                  <span className="text-xs font-bold text-[#182622] mt-0.5 block truncate">
                    {formatRupiah(sourcesBreakdown.massive)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Client Ranking Table */}
      <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DF] mb-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#C4A47C]" />
            <div>
              <h3 className="font-serif text-lg font-medium text-[#182622]">
                Peringkat Kontribusi Finansial Client
              </h3>
              <p className="text-xs text-[#8C7D6B]">
                Urutan kontributor terbesar berdasarkan total akumulasi invoice terfilter
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] text-[#5C5248]">
            {clientBreakdownData.allRanked.length} Client Partner
          </span>
        </div>

        <div className="space-y-3">
          {clientBreakdownData.allRanked.map((client, idx) => (
            <div 
              key={client.name} 
              className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] hover:bg-[#F5ECE0] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-[#182622] text-[#FAF7F2] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#182622] truncate">{client.name}</p>
                  <p className="text-xs text-[#8C7D6B]">{client.count} Invoices Transaksi</p>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:justify-end">
                <div className="w-28 sm:w-36 bg-[#E8DFD3] h-2 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="bg-[#182622] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(5, client.percentage))}%` }} 
                  />
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#182622]">{formatRupiah(client.total)}</p>
                  <p className="text-[11px] font-semibold text-[#8C7D6B]">{client.percentage.toFixed(1)}% dari total</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
