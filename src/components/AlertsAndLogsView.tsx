import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileCode, 
  Database,
  Check,
  Clock
} from 'lucide-react';
import { AlertEvent, TelemetryReading } from '../types/iot';

interface AlertsAndLogsViewProps {
  alerts: AlertEvent[];
  readings: TelemetryReading[];
  onAcknowledgeAlert: (id: string, user: string) => void;
  onResolveAlert: (id: string) => void;
  telemetryLogs: TelemetryReading[];
}

export const AlertsAndLogsView: React.FC<AlertsAndLogsViewProps> = ({
  alerts,
  readings,
  onAcknowledgeAlert,
  onResolveAlert,
  telemetryLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'alerts' | 'telemetry'>('alerts');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Filter alerts
  const activeAlerts = alerts.filter(a => !a.isResolved);
  const resolvedAlerts = alerts.filter(a => a.isResolved);

  // Filter telemetry logs
  const filteredLogs = telemetryLogs.filter(log => {
    const matchesSearch = 
      log.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || log.deviceId === deviceFilter;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  // Unique devices in logs
  const uniqueDevices = Array.from(new Set(telemetryLogs.map(l => l.deviceId)));

  // 1. Export CSV
  const handleExportCsv = () => {
    const headers = ['LogId', 'DeviceId', 'DeviceName', 'Parameter', 'Value', 'Unit', 'Status', 'Timestamp'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.deviceId,
      `"${l.deviceName.replace(/"/g, '""')}"`,
      l.parameter,
      l.value,
      l.unit,
      l.status,
      l.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IoT_TelemetryLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export JSON
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `IoT_TelemetryLogs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 3. Export T-SQL Batch Script
  const handleExportSql = () => {
    const sqlStatements = filteredLogs.slice(0, 200).map(l => {
      const sanitizedName = l.parameter.replace(/'/g, "''");
      return `INSERT INTO dbo.TelemetryLogs (DeviceId, Parameter, Value, Unit, Status, Timestamp) VALUES ('${l.deviceId}', '${sanitizedName}', ${l.value}, '${l.unit}', '${l.status}', '${l.timestamp}');`;
    }).join('\n');

    const fullScript = `-- ===============================================================
-- Batch T-SQL INSERT Statements for Telemetry Logs
-- Total Records: ${filteredLogs.length}
-- Generated at: ${new Date().toISOString()}
-- ===============================================================

USE IoT_Monitoring;
GO

BEGIN TRANSACTION;

${sqlStatements}

COMMIT TRANSACTION;
GO
PRINT '>> Sinkronisasi Batch T-SQL Selesai.';
`;

    const blob = new Blob([fullScript], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IoT_Telemetry_BatchInsert_${Date.now()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <span>Threshold Detection &amp; Historical Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Audit &amp; Diagnostic Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pusat Alert &amp; Riwayat Log Telemetri
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Inspeksi kejadian alarm threshold, konfirmasi status gangguan teknis oleh operator, dan ekspor riwayat log telemetri ke format CSV, JSON, atau skrip T-SQL.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'alerts' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Kejadian Alarm ({activeAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'telemetry' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Log ({telemetryLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Alerts View */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Alarm Aktif yang Memerlukan Perhatian ({activeAlerts.length})
            </h3>
            <span className="text-xs text-slate-400">
              Evaluasi threshold otomatis sesuai toleransi mesin
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Semua Parameter Beroperasi Normal</h4>
              <p className="text-xs text-slate-400">Tidak ada alarm aktif saat ini. Seluruh sensor berada dalam rentang toleransi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/30 border-rose-800/80'
                      : 'bg-amber-950/30 border-amber-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-amber-900 text-amber-200'
                      }`}>
                        {alert.severity} ALARM
                      </span>
                      <span className="text-xs font-mono text-slate-400">{alert.deviceId}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-mono text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{alert.deviceName}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{alert.message}</p>

                    <div className="flex items-center gap-3 pt-1 text-xs font-mono text-slate-400">
                      <span>Parameter: <strong className="text-white">{alert.parameter}</strong></span>
                      <span>Nilai Terbaca: <strong className="text-rose-400">{alert.triggerValue} {alert.unit}</strong></span>
                      <span>Batas: <strong className="text-slate-300">{alert.thresholdValue} {alert.unit}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!alert.isAcknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id, 'Operator Shift Pagi')}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                      >
                        Konfirmasi (Acknowledge)
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono italic">
                        Dikonfirmasi ({alert.acknowledgedBy})
                      </span>
                    )}

                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
                    >
                      Selesaikan Gangguan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resolved Alerts Accordion / History */}
          {resolvedAlerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">Riwayat Alarm Terselesaikan ({resolvedAlerts.length})</h4>
              <div className="space-y-2">
                {resolvedAlerts.map(r => (
                  <div key={r.id} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-white">{r.deviceName}</span>
                        <span className="text-slate-400 ml-2">{r.parameter} ({r.triggerValue} {r.unit})</span>
                      </div>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      Selesai: {r.resolvedAt ? new Date(r.resolvedAt).toLocaleTimeString() : 'Resolved'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: High-Density Telemetry Logs View */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          
          {/* Controls: Search, Device Filter, Status Filter, Export buttons */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari alat atau parameter..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
              >
                <option value="all">Semua Status</option>
                <option value="normal">Normal</option>
                <option value="warning">Peringatan</option>
                <option value="critical">Kritis</option>
              </select>

              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-hidden"
              >
                <option value="all">Semua Perangkat</option>
                {uniqueDevices.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            {/* Export Toolbar */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Ekspor ke CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Ekspor format JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportSql}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                title="Download skrip T-SQL INSERT batch"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Download T-SQL</span>
              </button>
            </div>
          </div>

          {/* High-Density Data Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-mono z-10">
                  <tr>
                    <th className="py-2.5 px-3">Waktu Log</th>
                    <th className="py-2.5 px-3">Device ID</th>
                    <th className="py-2.5 px-3">Nama Perangkat</th>
                    <th className="py-2.5 px-3">Parameter Sensor</th>
                    <th className="py-2.5 px-3 text-right">Nilai Bacaan</th>
                    <th className="py-2.5 px-3">Satuan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Status SQL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                        Tidak ada log telemetri yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.slice(0, 100).map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400 tabular-nums">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3 text-sky-400 font-semibold">{log.deviceId}</td>
                        <td className="py-2 px-3 font-sans text-slate-200 truncate max-w-[180px]">
                          {log.deviceName}
                        </td>
                        <td className="py-2 px-3 font-sans text-white">{log.parameter}</td>
                        <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                          {typeof log.value === 'number' ? log.value.toFixed(2) : log.value}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{log.unit}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                            log.status === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            log.status === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Synced
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Menampilkan {Math.min(filteredLogs.length, 100)} dari {filteredLogs.length} total baris</span>
              <span className="font-mono text-[11px]">Tabel MSSQL Target: dbo.TelemetryLogs</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
