import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff,
  Code,
  Table,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { MssqlConfig, MssqlConnectionState } from '../types/iot';

interface MssqlStudioViewProps {
  config: MssqlConfig;
  onUpdateConfig: (config: MssqlConfig) => void;
  connectionState: MssqlConnectionState;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
  onManualSync: () => void;
  isSyncing: boolean;
  queuedCount: number;
}

export const MssqlStudioView: React.FC<MssqlStudioViewProps> = ({
  config,
  onUpdateConfig,
  connectionState,
  onTestConnection,
  isTesting,
  onManualSync,
  isSyncing,
  queuedCount,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'query' | 'schema'>('config');
  const [queryText, setQueryText] = useState<string>(
    'SELECT TOP 20 LogId, DeviceId, Parameter, Value, Unit, Status, Timestamp \nFROM dbo.TelemetryLogs \nORDER BY Timestamp DESC;'
  );
  const [queryRunning, setQueryRunning] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  const sampleQueries = [
    {
      title: '20 Telemetri Terkini',
      sql: 'SELECT TOP 20 LogId, DeviceId, Parameter, Value, Unit, Status, Timestamp \nFROM dbo.TelemetryLogs \nORDER BY Timestamp DESC;',
    },
    {
      title: 'Daftar Perangkat IoT Online',
      sql: 'SELECT DeviceId, DeviceName, Category, Location, IpAddress, Status, UpdatedAt \nFROM dbo.Devices \nWHERE Status = \'Online\';',
    },
    {
      title: 'Rata-rata Suhu & Tekanan per Node',
      sql: 'SELECT DeviceId, Parameter, AVG(Value) as RataRata, MIN(Value) as Terendah, MAX(Value) as Tertinggi, Unit \nFROM dbo.TelemetryLogs \nWHERE Parameter LIKE \'%Temp%\' OR Parameter LIKE \'%Pressure%\' \nGROUP BY DeviceId, Parameter, Unit;',
    },
    {
      title: 'Daftar Alarm Belum Selesai',
      sql: 'SELECT AlertId, DeviceId, Parameter, TriggerValue, ThresholdValue, Severity, Message, CreatedAt \nFROM dbo.AlertEvents \nWHERE IsResolved = 0 \nORDER BY CreatedAt DESC;',
    },
    {
      title: 'Lihat View Ringkasan Real-Time',
      sql: 'SELECT * FROM dbo.vw_LatestTelemetrySummary;',
    },
  ];

  const handleRunQuery = async () => {
    if (!queryText.trim()) return;
    setQueryRunning(true);
    setQueryResult(null);

    try {
      const response = await fetch('/api/mssql/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          connectionConfig: {
            ...config,
            isRealConnection: connectionState.status === 'connected',
          },
        }),
      });

      const data = await response.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Gagal mengeksekusi kueri T-SQL',
      });
    } finally {
      setQueryRunning(false);
    }
  };

  const handleDownloadSchema = () => {
    window.open('/api/mssql/export-schema', '_blank');
  };

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/api/mssql/export-schema');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span>Enterprise Relational Database Integration</span>
            <span aria-hidden="true">·</span>
            <span>T-SQL Native Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Microsoft SQL Server Integration Studio
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Kelola parameter koneksi database Microsoft SQL Server (On-Premises / Azure SQL / AWS RDS), uji konektivitas port 1433, eksekusi kueri analitik T-SQL, dan pantau sinkronisasi telemetri.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSubTab === 'config' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Koneksi Database</span>
          </button>
          <button
            onClick={() => setActiveSubTab('query')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSubTab === 'query' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kueri Workbench</span>
          </button>
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSubTab === 'schema' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-sky-400" />
            <span>Skema DDL SQL</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Configuration & Connection Test */}
      {activeSubTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Pengaturan Koneksi Microsoft SQL Server</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mendukung Microsoft SQL Server 2017, 2019, 2022, SQL Server Express, serta Azure SQL Database.
                </p>
              </div>

              <button
                onClick={onTestConnection}
                disabled={isTesting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji Port 1433...' : 'Uji Koneksi Server'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Server Host / IP Address / Azure Endpoint
                </label>
                <input
                  type="text"
                  value={config.server}
                  onChange={(e) => onUpdateConfig({ ...config, server: e.target.value })}
                  placeholder="192.168.1.100 atau localhost atau sql.server.com"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Port TCP
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => onUpdateConfig({ ...config, port: parseInt(e.target.value, 10) || 1433 })}
                  placeholder="1433"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Database
                </label>
                <input
                  type="text"
                  value={config.database}
                  onChange={(e) => onUpdateConfig({ ...config, database: e.target.value })}
                  placeholder="IoT_Monitoring"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username SQL (Authentication)
                </label>
                <input
                  type="text"
                  value={config.user}
                  onChange={(e) => onUpdateConfig({ ...config, user: e.target.value })}
                  placeholder="iot_service_user atau sa"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password SQL
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.password || ''}
                  onChange={(e) => onUpdateConfig({ ...config, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Advanced Connection Flags */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400">Opsi Keamanan &amp; Protokol Jaringan</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.trustServerCertificate}
                    onChange={(e) => onUpdateConfig({ ...config, trustServerCertificate: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <div>
                    <span className="font-medium text-white block">Trust Server Certificate</span>
                    <span className="text-[11px] text-slate-400">Direkomendasikan 'true' untuk self-signed SSL/TLS server lokal</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.encrypt}
                    onChange={(e) => onUpdateConfig({ ...config, encrypt: e.target.checked })}
                    className="accent-indigo-500 rounded"
                  />
                  <div>
                    <span className="font-medium text-white block">Enkripsi SSL/TLS (Encrypt)</span>
                    <span className="text-[11px] text-slate-400">Wajib 'true' untuk Azure SQL, opsional untuk on-premises</span>
                  </div>
                </label>
              </div>

              {/* Auto Sync Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={config.autoSync}
                    onChange={(e) => onUpdateConfig({ ...config, autoSync: e.target.checked })}
                    className="accent-emerald-500 rounded"
                  />
                  <label htmlFor="autoSync" className="text-xs font-medium text-white cursor-pointer">
                    Sinkronisasi Otomatis Telemetri IoT ke Microsoft SQL Server
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Interval:</span>
                  <select
                    value={config.syncIntervalSec}
                    onChange={(e) => onUpdateConfig({ ...config, syncIntervalSec: parseInt(e.target.value, 10) || 5 })}
                    className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white font-mono"
                  >
                    <option value={1}>Setiap 1 Detik (High Frequency)</option>
                    <option value={3}>Setiap 3 Detik</option>
                    <option value={5}>Setiap 5 Detik (Rekomendasi)</option>
                    <option value={10}>Setiap 10 Detik</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Formatted Connection String Preview */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Standard ADO.NET / Node MSSQL Connection String:</span>
                <span className="font-mono text-indigo-400">Port {config.port}</span>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all select-all">
                Server={config.server},{config.port};Database={config.database};User Id={config.user};Password=***;TrustServerCertificate={config.trustServerCertificate ? 'True' : 'False'};Encrypt={config.encrypt ? 'True' : 'False'};
              </div>
            </div>
          </div>

          {/* Right 1 Col: Status & Diagnostics Assistant */}
          <div className="space-y-4">
            
            {/* Live Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status Koneksi Real-time
              </h4>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                    connectionState.status === 'connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    connectionState.status === 'simulated' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                    connectionState.status === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {connectionState.status === 'connected' ? 'Connected (Aktif)' :
                     connectionState.status === 'simulated' ? 'T-SQL Sandbox Engine' :
                     connectionState.status === 'error' ? 'Connection Failed' : 'Belum Diuji'}
                  </span>
                </div>

                {connectionState.latencyMs !== undefined && (
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Latensi Jaringan:</span>
                    <span className="text-emerald-400 font-bold">{connectionState.latencyMs} ms</span>
                  </div>
                )}

                {connectionState.serverVersion && (
                  <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Versi Server:</span>
                    <span className="truncate block">{connectionState.serverVersion}</span>
                  </div>
                )}

                {connectionState.lastTestedAt && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Pengujian Terakhir: {new Date(connectionState.lastTestedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Diagnostic Message if Error */}
              {connectionState.status === 'error' && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Diagnostik Error Koneksi MSSQL:</span>
                  </div>
                  <div className="text-xs text-rose-200 font-mono break-words">
                    {connectionState.errorMessage}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    💡 <strong>Solusi:</strong> {connectionState.diagnostic || 'Pastikan TCP/IP aktif di SQL Server Configuration Manager dan Port 1433 diizinkan oleh Windows Firewall.'}
                  </p>
                </div>
              )}

              {/* Telemetry Queue & Manual Sync Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Antrean Buffer Telemetri</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">{queuedCount} baris</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Data pembacaan sensor dari semua node ditampung dalam memory buffer sebelum dikirim ke database <code>IoT_Monitoring</code>.
                </p>
                <button
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Mengirim Data...' : 'Kirim Batch ke SQL Server'}</span>
                </button>
              </div>

            </div>

            {/* Quick Schema Download Tile */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Unduh Skrip Skema T-SQL
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unduh file <code>.sql</code> lengkap berisi perintah <code>CREATE DATABASE</code>, tabel dengan clustered index, view, dan stored procedure berkinerja tinggi.
              </p>
              <button
                onClick={handleDownloadSchema}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh IoT_Monitoring_Schema.sql</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Sub-tab 2: T-SQL Query Workbench */}
      {activeSubTab === 'query' && (
        <div className="space-y-4">
          
          {/* Query Templates Quick Select */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Contoh Kueri T-SQL Siap Pakai:</span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => setQueryText(sq.sql)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 font-mono"
              >
                {sq.title}
              </button>
            ))}
          </div>

          {/* Editor Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-white">T-SQL Query Editor</span>
                <span className="text-[11px] text-slate-400">· Target: {config.database}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunQuery}
                  disabled={queryRunning}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 ${queryRunning ? 'animate-pulse' : ''}`} />
                  <span>{queryRunning ? 'Mengeksekusi...' : 'Jalankan Kueri (Execute)'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={6}
              className="w-full p-4 bg-[#090d14] text-emerald-300 font-mono text-xs focus:outline-hidden resize-y leading-relaxed border-0"
              spellCheck={false}
            />
          </div>

          {/* Query Results Data Grid */}
          {queryResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white">Hasil Eksekusi Kueri T-SQL</h4>
                  {queryResult.recordset && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({queryResult.recordset.length} baris dikembalikan)
                    </span>
                  )}
                </div>

                {queryResult.source && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Sumber: {queryResult.source === 'real_mssql' ? 'Live Microsoft SQL Server' : 'T-SQL Sandbox Engine'}
                  </span>
                )}
              </div>

              {queryResult.error ? (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 font-mono">
                  Error: {queryResult.error}
                </div>
              ) : queryResult.recordset && queryResult.recordset.length > 0 ? (
                <div className="overflow-x-auto max-h-[350px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                      <tr>
                        {queryResult.columns?.map((col: string) => (
                          <th key={col} className="py-2 px-3 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {queryResult.recordset.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {queryResult.columns?.map((col: string) => (
                            <td key={col} className="py-2 px-3 text-slate-200 whitespace-nowrap">
                              {typeof row[col] === 'object' && row[col] !== null 
                                ? JSON.stringify(row[col]) 
                                : String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  Perintah berhasil dijalankan (0 baris dikembalikan).
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Sub-tab 3: DDL SQL Schema Viewer */}
      {activeSubTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Arsitektur Skema Database Microsoft SQL Server (T-SQL)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Struktur tabel ternormalisasi dengan Non-Clustered Time-Series Indexing dan Stored Procedure untuk performa maksimal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchema}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Tersalin!' : 'Salin Seluruh Skrip'}</span>
              </button>

              <button
                onClick={handleDownloadSchema}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .SQL File</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#090d14] p-4 text-xs font-mono text-emerald-300 max-h-[500px] overflow-y-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">{`-- ===============================================================
-- Database Architecture: IoT_Monitoring System
-- Platform: Microsoft SQL Server 2017 / 2019 / 2022 / Azure SQL Database
-- ===============================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IoT_Monitoring')
BEGIN
    CREATE DATABASE IoT_Monitoring;
END
GO

USE IoT_Monitoring;
GO

-- 1. Tabel Devices (Master Alat & Node Sensor)
CREATE TABLE dbo.Devices (
    DeviceId VARCHAR(50) NOT NULL PRIMARY KEY,
    DeviceName NVARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Location NVARCHAR(100) NOT NULL,
    IpAddress VARCHAR(45) NULL,
    MacAddress VARCHAR(20) NULL,
    FirmwareVersion VARCHAR(20) DEFAULT 'v1.0.0',
    Status VARCHAR(20) DEFAULT 'Online',
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- 2. Tabel TelemetryLogs (High-Throughput Time-Series Readings)
CREATE TABLE dbo.TelemetryLogs (
    LogId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DeviceId VARCHAR(50) NOT NULL,
    Parameter VARCHAR(50) NOT NULL,
    Value FLOAT NOT NULL,
    Unit VARCHAR(20) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'normal',
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_TelemetryLogs_Devices FOREIGN KEY (DeviceId) 
        REFERENCES dbo.Devices(DeviceId) ON DELETE CASCADE
);

-- Index optimal untuk kueri time-series berdasarkan Device dan Waktu
CREATE NONCLUSTERED INDEX IX_TelemetryLogs_DeviceId_Timestamp 
ON dbo.TelemetryLogs (DeviceId, Timestamp DESC)
INCLUDE (Parameter, Value, Unit, Status);

-- 3. Stored Procedure Batch Insert Berkecepatan Tinggi
CREATE OR ALTER PROCEDURE dbo.sp_InsertTelemetry
    @DeviceId VARCHAR(50),
    @Parameter VARCHAR(50),
    @Value FLOAT,
    @Unit VARCHAR(20),
    @Status VARCHAR(20) = 'normal',
    @Timestamp DATETIMEOFFSET = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Timestamp IS NULL SET @Timestamp = SYSDATETIMEOFFSET();

    INSERT INTO dbo.TelemetryLogs (DeviceId, Parameter, Value, Unit, Status, Timestamp)
    VALUES (@DeviceId, @Parameter, @Value, @Unit, @Status, @Timestamp);

    UPDATE dbo.Devices
    SET UpdatedAt = @Timestamp,
        Status = CASE WHEN @Status = 'critical' THEN 'Critical'
                      WHEN @Status = 'warning' THEN 'Warning'
                      ELSE 'Online' END
    WHERE DeviceId = @DeviceId;
END;
GO`}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
