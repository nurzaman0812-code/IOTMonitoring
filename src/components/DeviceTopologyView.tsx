import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  Clock, 
  Terminal, 
  Database, 
  Copy, 
  Check, 
  MapPin, 
  Network,
  Activity,
  Layers
} from 'lucide-react';
import { Device, TelemetryReading } from '../types/iot';

interface DeviceTopologyViewProps {
  devices: Device[];
  readings: TelemetryReading[];
  onSelectDeviceForQuery?: (deviceId: string) => void;
}

export const DeviceTopologyView: React.FC<DeviceTopologyViewProps> = ({
  devices,
  readings,
  onSelectDeviceForQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  const categories = ['all', 'Industrial Reactor', 'Cold Logistics', 'Power Grid', 'Water Treatment', 'Environment', 'Turbomachinery'];

  const filteredDevices = devices.filter(d => {
    if (selectedCategory === 'all') return true;
    return d.category === selectedCategory;
  });

  const getSignalStrengthLabel = (dbm: number) => {
    if (dbm >= -60) return { label: 'Sinyal Sangat Kuat', bars: 4, color: 'text-emerald-400' };
    if (dbm >= -70) return { label: 'Sinyal Baik', bars: 3, color: 'text-sky-400' };
    if (dbm >= -80) return { label: 'Sinyal Cukup', bars: 2, color: 'text-amber-400' };
    return { label: 'Sinyal Lemah', bars: 1, color: 'text-rose-400' };
  };

  const getDeviceSqlScript = (dev: Device) => {
    return `-- ===============================================================
-- Kueri Analisis Telemetri Node: ${dev.id} (${dev.name})
-- Lokasi: ${dev.location} | IP: ${dev.ipAddress}
-- ===============================================================

-- 1. Ambil 50 telemetri terakhir dari node ini
SELECT TOP 50 
    LogId, Parameter, Value, Unit, Status, Timestamp 
FROM dbo.TelemetryLogs
WHERE DeviceId = '${dev.id}'
ORDER BY Timestamp DESC;

-- 2. Agregasi Rata-rata, Min, dan Max per Parameter dalam 24 Jam
SELECT 
    Parameter,
    COUNT(*) AS TotalReadings,
    ROUND(AVG(Value), 2) AS AverageValue,
    ROUND(MIN(Value), 2) AS MinValue,
    ROUND(MAX(Value), 2) AS MaxValue,
    Unit
FROM dbo.TelemetryLogs
WHERE DeviceId = '${dev.id}'
  AND Timestamp >= DATEADD(HOUR, -24, SYSDATETIMEOFFSET())
GROUP BY Parameter, Unit;

-- 3. Cek Riwayat Alarm yang Terjadi pada Alat Ini
SELECT AlertId, Parameter, TriggerValue, ThresholdValue, Severity, Message, IsResolved, CreatedAt
FROM dbo.AlertEvents
WHERE DeviceId = '${dev.id}'
ORDER BY CreatedAt DESC;`;
  };

  const handleCopySql = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Architectural Topology Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <span>Hardware Network Topology</span>
            <span aria-hidden="true">·</span>
            <span>Edge Gateway GX-3000</span>
            <span aria-hidden="true">·</span>
            <span>Industrial Fieldbus RS485 &amp; Ethernet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Topologi Jaringan Perangkat &amp; Node Sensor
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Arsitektur pemetaan fisik dan logika konektivitas antar instrumen pabrik menuju Industrial Edge Gateway, dialirkan ke antrean buffer sebelum disimpan secara aman di Microsoft SQL Server.
          </p>
        </div>

        {/* Hardware Gateway Showcase thumbnail */}
        <div className="w-full sm:w-64 shrink-0 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 flex flex-col">
          <img
            src="/src/assets/images/iot_edge_gateway_1792981974951.jpg"
            alt="IoT Edge Gateway GX-3000"
            referrerPolicy="no-referrer"
            className="w-full h-32 object-cover"
          />
          <div className="p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="font-semibold text-white">Edge Gateway GX-3000</span>
            <span className="text-emerald-400 font-mono">Modbus/TCP</span>
          </div>
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? `Semua Node (${devices.length})` : cat}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(dev => {
          const signal = getSignalStrengthLabel(dev.signalStrengthDbm);
          const devReadings = readings.filter(r => r.deviceId === dev.id);

          return (
            <div
              key={dev.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header: ID & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-semibold text-sky-400 tracking-wider">
                      {dev.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {dev.name}
                    </h3>
                  </div>

                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                    dev.status === 'online' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' :
                    dev.status === 'warning' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' :
                    'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  }`}>
                    {dev.status === 'online' ? 'Online' : dev.status === 'warning' ? 'Peringatan' : 'Offline'}
                  </span>
                </div>

                {/* Metadata list */}
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{dev.location}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-500">IP Gateway:</span>
                    <span className="text-slate-200">{dev.ipAddress}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">MAC Hardware:</span>
                    <span className="text-slate-400">{dev.macAddress}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">Firmware:</span>
                    <span className="text-slate-300">{dev.firmwareVersion}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      <span>{signal.label}</span>
                    </span>
                    <span className={`font-mono font-medium ${signal.color}`}>
                      {dev.signalStrengthDbm} dBm
                    </span>
                  </div>

                  {dev.batteryPercent !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        <span>Kapasitas Baterai</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-medium">
                        {dev.batteryPercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Attached Sensor Parameters */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span>Parameter Terhubung ({devReadings.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {devReadings.map(r => (
                      <span
                        key={r.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {r.parameter}: {typeof r.value === 'number' ? r.value.toFixed(1) : r.value} {r.unit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  Heartbeat: {new Date(dev.lastHeartbeat).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => setSelectedDevice(dev)}
                  className="px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Skrip SQL Node</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device SQL Inspector Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-sky-400">{selectedDevice.id}</span>
                <h3 className="text-lg font-bold text-white">
                  Skrip Kueri T-SQL untuk {selectedDevice.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Gunakan kueri T-SQL berikut di SQL Server Management Studio (SSMS) atau Azure Data Studio untuk mengambil riwayat telemetri, rata-rata harian, serta log alert khusus untuk node sensor ini.
            </p>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{getDeviceSqlScript(selectedDevice)}</pre>
              <button
                onClick={() => handleCopySql(getDeviceSqlScript(selectedDevice))}
                className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuery ? 'Tersalin' : 'Salin T-SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
