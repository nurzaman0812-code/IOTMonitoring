import React from 'react';
import { 
  Activity, 
  Cpu, 
  Sliders, 
  Bell, 
  Database, 
  BookOpen, 
  Play, 
  Pause,
  RefreshCw,
  Server
} from 'lucide-react';
import { MssqlConnectionState } from '../types/iot';

export type NavTab = 'monitoring' | 'topology' | 'actuators' | 'alerts' | 'mssql-studio' | 'mssql-docs';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  sqlState: MssqlConnectionState;
  onOpenSqlStudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isStreaming,
  onToggleStreaming,
  sqlState,
  onOpenSqlStudio,
}) => {
  const getSqlStatusBadge = () => {
    switch (sqlState.status) {
      case 'connected':
        return { label: 'SQL Terhubung', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' };
      case 'simulated':
        return { label: 'SQL Sandbox', color: 'text-sky-400 bg-sky-950/60 border-sky-800/80' };
      case 'connecting':
        return { label: 'Menghubungkan...', color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' };
      case 'error':
        return { label: 'SQL Offline', color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' };
      default:
        return { label: 'SQL Disconnected', color: 'text-slate-400 bg-slate-900 border-slate-800' };
    }
  };

  const sqlBadge = getSqlStatusBadge();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div 
          onClick={() => onTabChange('monitoring')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Nexus<span className="text-emerald-400">IoT</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => onTabChange('monitoring')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'monitoring'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monitoring</span>
          </button>

          <button
            onClick={() => onTabChange('topology')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'topology'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Topologi Alat</span>
          </button>

          <button
            onClick={() => onTabChange('actuators')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'actuators'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Kontrol Aktuator</span>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'alerts'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Alert &amp; Log</span>
          </button>

          <button
            onClick={() => onTabChange('mssql-studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'mssql-studio'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>SQL Studio</span>
          </button>

          <button
            onClick={() => onTabChange('mssql-docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'mssql-docs'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Panduan MSSQL</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* MSSQL Connection status indicator button */}
          <button
            onClick={onOpenSqlStudio}
            title="Klik untuk mengonfigurasi koneksi Microsoft SQL Server"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-colors ${sqlBadge.color}`}
          >
            <Server className="w-3 h-3" />
            <span>{sqlBadge.label}</span>
          </button>

          {/* Live Telemetry Streaming Simulator Toggle */}
          <button
            onClick={onToggleStreaming}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isStreaming
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Streaming Aktif</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Mulai Stream</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-3 pb-0.5 mt-2 border-t border-slate-800/60">
        <button
          onClick={() => onTabChange('monitoring')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'monitoring' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Monitoring
        </button>
        <button
          onClick={() => onTabChange('topology')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'topology' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Topologi
        </button>
        <button
          onClick={() => onTabChange('actuators')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'actuators' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Aktuator
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'alerts' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Alert
        </button>
        <button
          onClick={() => onTabChange('mssql-studio')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'mssql-studio' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          SQL Studio
        </button>
        <button
          onClick={() => onTabChange('mssql-docs')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'mssql-docs' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Panduan MSSQL
        </button>
      </div>
    </header>
  );
};
