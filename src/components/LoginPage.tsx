import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  FolderKanban, 
  Users, 
  Eye, 
  Database, 
  ShieldCheck, 
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AuthUser } from '../types';
import { loginAdmin, DEMO_ADMIN, initFirebase } from '../services/firebase';
import { formatRupiah } from '../utils/formatters';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  totalPendapatan: number;
  totalBulanIni: number;
  totalClientAktif: number;
  monthlyData: Array<{ month: string; total: number; count: number }>;
  onOpenDbModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  totalPendapatan,
  totalBulanIni,
  totalClientAktif,
  monthlyData,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const isFirebaseLive = Boolean(initFirebase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Silakan masukkan alamat email admin.');
      }
      if (!password) {
        throw new Error('Silakan masukkan password akun admin.');
      }

      const user = await loginAdmin(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setHasFailed(true);
      setErrorMessage(err?.message || 'Gagal masuk. Silakan periksa kembali email & password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToLogin = () => {
    setErrorMessage(null);
    setHasFailed(false);
    setPassword('');
  };

  const handleUseDemo = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setErrorMessage(null);
    setHasFailed(false);
  };

  // 6 month preview for login page
  const previewChartData = monthlyData.slice(-6);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E2925] flex flex-col justify-between selection:bg-[#E2D5C3]">
      {/* Top Navigation Bar - Linchub Style */}
      <header className="w-full border-b border-[#E8DFD3] bg-[#FAF7F2]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="font-['Cinzel'] tracking-[0.3em] text-2xl font-bold text-[#182622]">
                LINCHUB
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#8C7D6B] font-semibold uppercase">
                Finance Portal
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.18em] font-medium text-[#4D453C] uppercase">
            <span className="border-b-2 border-[#182622] pb-1 text-[#182622] cursor-pointer">Login</span>
            <span className="hover:text-[#182622] transition-colors cursor-pointer">Pencatatan</span>
            <span className="hover:text-[#182622] transition-colors cursor-pointer">Analisa</span>
            <span className="hover:text-[#182622] transition-colors cursor-pointer">SOP Finance</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUseDemo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#182622] hover:bg-[#253A34] text-[#FAF7F2] text-xs font-semibold tracking-wider transition-all duration-200 shadow-sm"
              title="Gunakan akun demo admin finance"
            >
              <span>DEMO LOGIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Headline & Login Box */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#8C7D6B] uppercase inline-block">
                BOUTIQUE RECRUITMENT FINANCE ECOSYSTEM
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#182622] leading-tight mb-4">
              Pencatatan Pendapatan &amp; Analisa Client.
            </h1>

            <p className="text-sm sm:text-base text-[#5C5248] leading-relaxed mb-8 max-w-lg">
              Portal internal admin finance Linchub untuk mencatat invoice client, memantau mutasi rekening bank, dan menganalisa pendapatan bulanan secara akurat.
            </p>

            {/* Login Card */}
            <div id="login-form-container" className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F0E9DF]">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#182622]">Masuk Admin Finance</h2>
                  <p className="text-xs text-[#8C7D6B] mt-0.5">Autentikasi aman terintegrasi Firebase Auth</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5EFE6] text-[#5C5248] text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>{isFirebaseLive ? 'Firebase Active' : 'Single Role Admin'}</span>
                </div>
              </div>

              {/* Error Message with Safe Return Flow */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-[#FDF0EE] border border-[#F4C6C1] text-[#8C281F] flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#C62828]" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">Gagal Autentikasi</h4>
                      <p className="text-xs mt-1 text-[#661D1D] leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F4C6C1]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#8C281F]">Arahkan kembali ke halaman masuk?</span>
                    <button
                      type="button"
                      onClick={handleResetToLogin}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#8C281F] hover:bg-[#661D1D] text-white text-xs font-medium transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      <span>Kembali ke Halaman Masuk</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4D453C] uppercase tracking-wider mb-1.5">
                    Email Admin
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7D6B]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: admin@linchub.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#4D453C] uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-[#8C7D6B]">Min. 6 Karakter</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7D6B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-sm text-[#182622] placeholder-[#A69B8D] focus:outline-none focus:ring-2 focus:ring-[#182622]/20 focus:border-[#182622] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-xl bg-[#182622] hover:bg-[#233832] active:bg-[#111A18] text-[#FAF7F2] font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Memvalidasi Akses...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Finance</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick credential helper for instant seamless preview */}
              <div className="mt-5 pt-4 border-t border-[#F0E9DF] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A6F62]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A47C]" />
                  <span>Akun Demo: <strong>admin@linchub.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-xs font-semibold text-[#182622] hover:underline cursor-pointer"
                >
                  Gunakan Password Demo ({DEMO_ADMIN.password})
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Reference Style Arched Showcase Card + Live Ringkasan Data & Grafik Bulanan */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative bg-[#F4EFE6] border border-[#E2D8C9] rounded-3xl p-6 sm:p-8 overflow-hidden shadow-sm">
              
              {/* Decorative Subtle Background Arch Shape */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#EAE2D4]/60 pointer-events-none blur-xl" />
              
              {/* Header inside Showcase Card */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-[#8C7D6B] uppercase">
                    RINGKASAN PORTAL FINANCE
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#182622] mt-0.5">
                    Performa &amp; Pelaporan Bulanan
                  </h3>
                </div>
                <div className="p-2.5 rounded-full bg-[#FFFFFF] border border-[#E8DFD3] text-[#182622] shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* 3 Metric Cards matching the cream visual style */}
              <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-3.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-medium text-[#8C7D6B] uppercase tracking-wider">
                    Total Pendapatan
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#182622] mt-1 truncate" title={formatRupiah(totalPendapatan)}>
                    {formatRupiah(totalPendapatan)}
                  </p>
                  <span className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Akumulatif
                  </span>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-3.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-medium text-[#8C7D6B] uppercase tracking-wider">
                    Bulan Ini
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#182622] mt-1 truncate" title={formatRupiah(totalBulanIni)}>
                    {formatRupiah(totalBulanIni)}
                  </p>
                  <span className="text-[10px] text-[#8C7D6B] font-medium mt-1 block">
                    September 2026
                  </span>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-3.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-medium text-[#8C7D6B] uppercase tracking-wider">
                    Client Aktif
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#182622] mt-1">
                    {totalClientAktif} <span className="text-xs font-normal text-[#8C7D6B]">Perusahaan</span>
                  </p>
                  <span className="text-[10px] text-[#5C5248] font-medium mt-1 block truncate">
                    B2B Client Partner
                  </span>
                </div>
              </div>

              {/* Monthly Reporting Graph Preview (as specifically requested in prompt: grafik pelaporan bulanan di Login Page) */}
              <div className="relative z-10 bg-[#FFFFFF] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#182622]">
                      Tren Pendapatan 6 Bulan Terakhir
                    </h4>
                    <p className="text-[11px] text-[#8C7D6B]">Grafik ringkasan pelaporan bulanan</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#5C5248] border border-[#E8DFD3] font-medium">
                    Juta IDR
                  </span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={previewChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E9DF" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 11, fill: '#7A6F62' }} 
                        tickLine={false} 
                        axisLine={{ stroke: '#E8DFD3' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#7A6F62' }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(val: any) => [formatRupiah(Number(val)), 'Pendapatan']}
                        labelFormatter={(label) => `Bulan: ${label}`}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E8DFD3',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#182622',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      />
                      <Bar dataKey="total" fill="#182622" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3 Reference Feature Items (Matching the circular icon aesthetic from user's image) */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFFFF]/70 border border-[#E8DFD3]/80">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622] flex-shrink-0">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#182622]">Input Pendapatan</p>
                    <p className="text-[11px] text-[#7A6F62]">11 field detail invoice</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFFFF]/70 border border-[#E8DFD3]/80">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622] flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#182622]">Analisa Client</p>
                    <p className="text-[11px] text-[#7A6F62]">Top contributor chart</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFFFF]/70 border border-[#E8DFD3]/80">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#DDD2C1] flex items-center justify-center text-[#182622] flex-shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#182622]">Sheet / Airtable</p>
                    <p className="text-[11px] text-[#7A6F62]">Tanpa backend custom</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer - Exact Linchub reference style */}
      <footer className="w-full border-t border-[#E8DFD3] bg-[#FAF7F2] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6F62]">
          <div className="flex items-center gap-3">
            <span className="font-['Cinzel'] tracking-wider font-bold text-[#182622] text-sm">
              LINCHUB
            </span>
            <span className="hidden sm:inline text-[#DDD2C1]">|</span>
            <span className="font-medium">PT. LINCHUB NETWORK INDONESIA</span>
            <span className="hidden md:inline text-[#8C7D6B] italic">— Building Exceptional Talent. Empowering Exceptional Businesses.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="hover:text-[#182622] transition-colors">linchub.my.id</span>
            <span>•</span>
            <span>Finance Admin Portal v2.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
