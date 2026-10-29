import React, { useState } from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  ShieldCheck, 
  Database, 
  PlusCircle, 
  Zap, 
  Thermometer, 
  Gauge, 
  Droplet, 
  Wind, 
  Cpu,
  RefreshCw,
  Send
} from 'lucide-react';
import { Device, TelemetryReading, MssqlConnectionState } from '../types/iot';

interface LiveMonitoringViewProps {
  devices: Device[];
  readings: TelemetryReading[];
  onTriggerAnomaly: (readingId: string) => void;
  onInjectCustomReading: (reading: { deviceId: string; parameter: string; value: number; unit: string }) => void;
  sqlState: MssqlConnectionState;
  onNavigateToSql: () => void;
  onNavigateToDocs: () => void;
  queuedForSqlCount: number;
  onManualSqlSync: () => void;
  isSyncingToSql: boolean;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  devices,
  readings,
  onTriggerAnomaly,
  onInjectCustomReading,
  sqlState,
  onNavigateToSql,
  onNavigateToDocs,
  queuedForSqlCount,
  onManualSqlSync,
  isSyncingToSql,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showInjectModal, setShowInjectModal] = useState<boolean>(false);
  const [injectDevice, setInjectDevice] = useState<string>(devices[0]?.id || '');
  const [injectParam, setInjectParam] = useState<string>('Core Temperature');
  const [injectValue, setInjectValue] = useState<string>('88.5');
  const [injectUnit, setInjectUnit] = useState<string>('°C');

  // Filtered readings
  const filteredReadings = readings.filter(r => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'temp') return r.parameter.toLowerCase().includes('temperature') || r.unit === '°C';
    if (selectedFilter === 'pressure') return r.parameter.toLowerCase().includes('pressure') || r.unit === 'bar';
    if (selectedFilter === 'power') return r.unit === 'V' || r.unit === 'kW';
    if (selectedFilter === 'flow') return r.unit === 'm³/h' || r.unit === 'pH';
    if (selectedFilter === 'vibration') return r.unit === 'mm/s';
    return true;
  });

  const criticalCount = readings.filter(r => r.status === 'critical').length;
  const warningCount = readings.filter(r => r.status === 'warning').length;
  const normalCount = readings.filter(r => r.status === 'normal').length;

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(injectValue);
    if (isNaN(val)) return;

    onInjectCustomReading({
      deviceId: injectDevice,
      parameter: injectParam,
      value: val,
      unit: injectUnit,
    });

    setShowInjectModal(false);
  };

  const getParameterIcon = (param: string, unit: string) => {
    if (param.toLowerCase().includes('temp') || unit === '°C') return <Thermometer className="w-4 h-4 text-rose-400" />;
    if (param.toLowerCase().includes('press') || unit === 'bar') return <Gauge className="w-4 h-4 text-sky-400" />;
    if (unit === 'V' || unit === 'kW') return <Zap className="w-4 h-4 text-amber-400" />;
    if (unit === 'm³/h' || unit === 'pH') return <Droplet className="w-4 h-4 text-cyan-400" />;
    if (unit === 'ppm' || unit === 'µg/m³') return <Wind className="w-4 h-4 text-emerald-400" />;
    return <Activity className="w-4 h-4 text-indigo-400" />;
  };

  // Helper to render sparkline SVG path
  const renderSparkline = (history: number[], status: string) => {
    if (!history || history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min === 0 ? 1 : max - min;
    const width = 140;
    const height = 36;
    const padding = 4;

    const points = history.map((val, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = status === 'critical' ? '#f43f5e' : status === 'warning' ? '#f59e0b' : '#10b981';

    return (
      <svg className="w-36 h-9 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Latest point circle */}
        {history.length > 0 && (
          <circle
            cx={width - padding}
            cy={height - padding - ((history[history.length - 1] - min) / range) * (height - padding * 2)}
            r="3"
            fill={strokeColor}
          />
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner with Facility Control Room Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/iot_facility_hero_1792981961534.jpg"
            alt="IoT Industrial Control Center"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-[#0b0f17]/90 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>Smart Factory Automation</span>
              <span aria-hidden="true">·</span>
              <span>Online Telemetry Stream</span>
              <span aria-hidden="true">·</span>
              <span>Microsoft SQL Server Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sistem Monitoring IoT &amp; Telemetri Industri
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pemantauan multi-sensor real-time untuk reaktor kimia, sistem pendingin beku, gardu induk tegangan tinggi, pengolahan air, dan turbin dengan integrasi terstruktur ke Microsoft SQL Server.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowInjectModal(true)}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Suntik Data Uji</span>
            </button>

            <button
              onClick={onNavigateToSql}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>Konfigurasi MSSQL</span>
            </button>

            <button
              onClick={onNavigateToDocs}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 flex items-center gap-2 transition-colors"
            >
              <span>Dokumentasi Lengkap</span>
            </button>
          </div>
        </div>

        {/* 4-KPI Row */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 border-t border-slate-800 bg-slate-950/60 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="p-4">
            <div className="text-xs text-slate-400">Total Node IoT</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-white">{devices.length}</span>
              <span className="text-xs text-emerald-400 font-medium">100% Aktif</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">6 Mesin &amp; Sensor Terpasang</div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-400">Status Sensor</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-xs font-medium text-emerald-400">
                <span className="font-mono font-bold text-base text-white tabular-nums mr-1">{normalCount}</span> Normal
              </span>
              <span className="text-xs font-medium text-amber-400">
                <span className="font-mono font-bold text-base text-white tabular-nums mr-1">{warningCount}</span> Peringatan
              </span>
              {criticalCount > 0 && (
                <span className="text-xs font-medium text-rose-400">
                  <span className="font-mono font-bold text-base text-white tabular-nums mr-1">{criticalCount}</span> Kritis
                </span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Evaluasi Threshold Otomatis</div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-400">Koneksi Microsoft SQL</div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm font-semibold capitalize ${
                sqlState.status === 'connected' ? 'text-emerald-400' :
                sqlState.status === 'simulated' ? 'text-sky-400' :
                sqlState.status === 'error' ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {sqlState.status === 'connected' ? 'Connected (Port 1433)' :
                 sqlState.status === 'simulated' ? 'Sandbox Simulator' :
                 sqlState.status === 'error' ? 'Gagal Terhubung' : 'Standby'}
              </span>
              {sqlState.latencyMs && (
                <span className="text-xs font-mono text-slate-400">({sqlState.latencyMs}ms)</span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 truncate">
              {sqlState.currentDb ? `DB: ${sqlState.currentDb}` : 'Siap sinkronisasi'}
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">Antrean Buffer SQL</div>
              <button
                onClick={onManualSqlSync}
                disabled={isSyncingToSql}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="Kirim batch telemetri ke SQL Server"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingToSql ? 'animate-spin' : ''}`} />
                <span>Sync Sekarang</span>
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                {queuedForSqlCount}
              </span>
              <span className="text-xs text-slate-400">catatan data</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Total Tersinkron: {sqlState.totalSyncedCount} log</div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Parameter ({readings.length})
          </button>
          <button
            onClick={() => setSelectedFilter('temp')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'temp' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Suhu (°C)
          </button>
          <button
            onClick={() => setSelectedFilter('pressure')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'pressure' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tekanan (bar)
          </button>
          <button
            onClick={() => setSelectedFilter('power')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'power' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daya &amp; Listrik
          </button>
          <button
            onClick={() => setSelectedFilter('flow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'flow' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aliran &amp; Air
          </button>
          <button
            onClick={() => setSelectedFilter('vibration')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedFilter === 'vibration' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Getaran Turbin
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Ingestion Stream</span>
        </div>
      </div>

      {/* Sensor Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReadings.map(reading => {
          const isWarning = reading.status === 'warning';
          const isCritical = reading.status === 'critical';
          const statusText = isCritical ? 'Kritis' : isWarning ? 'Peringatan' : 'Nominal';
          const statusBg = isCritical 
            ? 'border-rose-800/80 bg-rose-950/20' 
            : isWarning 
            ? 'border-amber-800/80 bg-amber-950/20' 
            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700';

          return (
            <div
              key={reading.id}
              className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${statusBg}`}
            >
              <div>
                {/* Header: Device Name & Parameter */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getParameterIcon(reading.parameter, reading.unit)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight leading-tight">
                        {reading.parameter}
                      </h3>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        {reading.deviceName}
                      </div>
                    </div>
                  </div>

                  {/* Explicit status label (WCAG Color-independent) */}
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      isCritical ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60' :
                      isWarning ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60' :
                      'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                    }`}>
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Main Metric Value & Sparkline */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Nilai Terakhir</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
                        {typeof reading.value === 'number' ? reading.value.toFixed(reading.unit === 'ppm' ? 0 : 2) : reading.value}
                      </span>
                      <span className="text-sm font-medium text-slate-400 font-mono">
                        {reading.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-slate-500 mb-1">Tren Waktu Riil</div>
                    {renderSparkline(reading.history, reading.status)}
                  </div>
                </div>

                {/* Min / Max Range Threshold Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span>Min: {reading.minWarning} {reading.unit}</span>
                    <span>Batas Peringatan: {reading.maxWarning} {reading.unit}</span>
                  </div>
                  {/* Gauge bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((reading.value - reading.minCritical) / (reading.maxCritical - reading.minCritical || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Anomaly Button */}
              <div className="mt-3 pt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60">
                <span className="truncate max-w-[150px]">{reading.location}</span>
                <button
                  onClick={() => onTriggerAnomaly(reading.id)}
                  title="Simulasikan lonjakan nilai sensor untuk menguji alarm dan penulisan ke SQL"
                  className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Uji Lonjakan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Data Injection Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Suntik Data Telemetri Kustom</span>
              </h3>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan formulir ini untuk menyimulasikan data payload yang dikirim dari sensor mikrokontroler (ESP32/Arduino/PLC) ke gateway monitoring dan Microsoft SQL Server.
            </p>

            <form onSubmit={handleInjectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Perangkat IoT</label>
                <select
                  value={injectDevice}
                  onChange={(e) => setInjectDevice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.id} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Parameter Sensor</label>
                <input
                  type="text"
                  value={injectParam}
                  onChange={(e) => setInjectParam(e.target.value)}
                  placeholder="e.g. Core Temperature / Pressure"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nilai Bacaan (Value)</label>
                  <input
                    type="number"
                    step="any"
                    value={injectValue}
                    onChange={(e) => setInjectValue(e.target.value)}
                    placeholder="88.5"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Satuan (Unit)</label>
                  <input
                    type="text"
                    value={injectUnit}
                    onChange={(e) => setInjectUnit(e.target.value)}
                    placeholder="°C / bar / kW"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Sistem &amp; SQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
