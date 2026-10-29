import React, { useState } from 'react';
import { 
  Sliders, 
  Power, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  User, 
  Cpu, 
  Zap, 
  Volume2
} from 'lucide-react';
import { Actuator } from '../types/iot';

interface ActuatorControlViewProps {
  actuators: Actuator[];
  onUpdateActuator: (id: string, newState: boolean | number, user: string) => void;
}

interface CommandLog {
  id: string;
  actuatorName: string;
  previousState: string;
  newState: string;
  timestamp: string;
  user: string;
}

export const ActuatorControlView: React.FC<ActuatorControlViewProps> = ({
  actuators,
  onUpdateActuator,
}) => {
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([
    {
      id: 'CMD-101',
      actuatorName: 'Cooling Jacket Proportional Valve',
      previousState: '30%',
      newState: '42%',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      user: 'Auto-PID Controller',
    },
    {
      id: 'CMD-100',
      actuatorName: 'Turbine Forced Lubrication Pump',
      previousState: 'OFF',
      newState: 'ON',
      timestamp: new Date(Date.now() - 14400000).toLocaleTimeString(),
      user: 'Turbine Safety PLC',
    },
  ]);

  const [confirmDialog, setConfirmDialog] = useState<{
    actuator: Actuator;
    targetState: boolean | number;
  } | null>(null);

  const handleToggleBoolean = (act: Actuator) => {
    const nextState = !act.state;
    // If it's a high voltage breaker, require safety confirmation
    if (act.type === 'breaker') {
      setConfirmDialog({ actuator: act, targetState: nextState });
      return;
    }

    executeCommand(act, nextState);
  };

  const handleSliderChange = (act: Actuator, value: number) => {
    executeCommand(act, value);
  };

  const executeCommand = (act: Actuator, targetState: boolean | number) => {
    const prevStateStr = typeof act.state === 'boolean' 
      ? (act.state ? 'ON' : 'OFF') 
      : `${act.state}${act.unit || ''}`;
    
    const newStateStr = typeof targetState === 'boolean' 
      ? (targetState ? 'ON' : 'OFF') 
      : `${targetState}${act.unit || ''}`;

    onUpdateActuator(act.id, targetState, 'Operator Web Console');

    const newLog: CommandLog = {
      id: `CMD-${Date.now()}`,
      actuatorName: act.name,
      previousState: prevStateStr,
      newState: newStateStr,
      timestamp: new Date().toLocaleTimeString(),
      user: 'Operator Web Console',
    };

    setCommandLogs(prev => [newLog, ...prev].slice(0, 50));
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>Remote Telecommand &amp; SCADA Actuation</span>
            <span aria-hidden="true">·</span>
            <span>Two-Way Edge Sync</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Kontrol Aktuator &amp; Perangkat Lapangan
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Kirimkan perintah dua arah (bi-directional telecommand) langsung ke relay saklar, katup proporsional, dan pompa pendorong dengan pencatatan audit log otomatis ke tabel <code>dbo.DeviceActuators</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Interlock Keamanan Aktif</span>
        </div>
      </div>

      {/* Actuator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actuators.map(act => {
          const isBoolean = typeof act.state === 'boolean';
          const isNumeric = typeof act.state === 'number';
          const isRunning = isBoolean ? act.state : (act.state as number) > 0;

          return (
            <div
              key={act.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">{act.id} · {act.deviceId}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {act.name}
                    </h3>
                  </div>

                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                    isRunning 
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isRunning ? 'Aktif (Running)' : 'Mati (Idle)'}
                  </span>
                </div>

                {/* State display */}
                <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Status Keluaran Saat Ini</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      {isBoolean ? (act.state ? 'POWER ON' : 'POWER OFF') : `${act.state} ${act.unit || ''}`}
                    </span>
                    <span className="text-xs font-mono text-slate-500 uppercase">{act.type}</span>
                  </div>

                  {/* Slider control if continuous / numeric */}
                  {isNumeric && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={act.state as number}
                        onChange={(e) => handleSliderChange(act, parseFloat(e.target.value))}
                        className="w-full accent-amber-500 bg-slate-800 cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleSliderChange(act, 0)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                        >
                          Tutup (0%)
                        </button>
                        <button
                          onClick={() => handleSliderChange(act, 50)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                        >
                          50%
                        </button>
                        <button
                          onClick={() => handleSliderChange(act, 100)}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                        >
                          Buka Penuh (100%)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toggle button if boolean */}
                  {isBoolean && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleToggleBoolean(act)}
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                          act.state
                            ? 'bg-rose-600/90 hover:bg-rose-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        <span>{act.state ? 'Matikan (Turn OFF)' : 'Nyalakan (Turn ON)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Oleh: {act.lastUser}</span>
                  <span>{new Date(act.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Audit Log Perintah Aktuator (Tersimpan ke T-SQL)</span>
          </h3>
          <span className="text-xs text-slate-500">Menampilkan {commandLogs.length} aksi terakhir</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Nama Aktuator</th>
                <th className="py-2.5 px-3">Nilai Sebelumnya</th>
                <th className="py-2.5 px-3">Nilai Baru</th>
                <th className="py-2.5 px-3">Operator / Pemicu</th>
                <th className="py-2.5 px-3 text-right">Status SQL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {commandLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-white font-sans">{log.actuatorName}</td>
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{log.previousState}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold tabular-nums">{log.newState}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{log.user}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      Tercatat
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for critical safety breaker */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Perubahan Status Saklar Utama</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan mengubah status <strong className="text-white">{confirmDialog.actuator.name}</strong> menjadi{' '}
              <strong className="text-amber-400">{confirmDialog.targetState ? 'ON (ENGAGED)' : 'OFF (DISENGAGED)'}</strong>. Aksi ini dapat memengaruhi aliran listrik utama pada transformer 33kV.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Batalkan
              </button>
              <button
                onClick={() => executeCommand(confirmDialog.actuator, confirmDialog.targetState)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Lanjutkan &amp; Eksekusi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
