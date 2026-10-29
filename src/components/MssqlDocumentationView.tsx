import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  Cpu, 
  Layers, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  FileCode,
  Network,
  Clock
} from 'lucide-react';

export const MssqlDocumentationView: React.FC = () => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const steps = [
    { id: 1, title: 'Arsitektur Konektivitas IoT ke SQL Server' },
    { id: 2, title: 'Tahap 1: Konfigurasi SQL Server & Firewall' },
    { id: 3, title: 'Tahap 2: Skrip Skema Database & Tabel (T-SQL)' },
    { id: 4, title: 'Tahap 3: Implementasi Driver (Node.js, Python, C#, ESP32)' },
    { id: 5, title: 'Tahap 4: Optimasi Performa & Keamanan' },
    { id: 6, title: 'Tahap 5: Kamus Solusi Error Populer' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <span>Official Implementation Guide</span>
            <span aria-hidden="true">·</span>
            <span>Step-by-Step Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Panduan Lengkap Implementasi Koneksi Microsoft SQL Server
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Dokumentasi komprehensif langkah demi langkah menghubungkan perangkat sensor IoT lapangan ke Microsoft SQL Server 2017/2019/2022 atau Azure SQL, lengkap dengan skrip T-SQL, driver backend, dan praktik keamanan industri.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs text-purple-300 shrink-0">
          <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Panduan Bahasa Indonesia</span>
        </div>
      </div>

      {/* Step Navigation Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeStep === step.id
                ? 'bg-purple-950/40 border-purple-600/80 text-white shadow-xs'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="text-[11px] font-mono font-bold text-purple-400 block mb-1">
              Bagian 0{step.id}
            </span>
            <span className="text-xs font-semibold leading-tight line-clamp-2">
              {step.title}
            </span>
          </button>
        ))}
      </div>

      {/* Content Section based on activeStep */}

      {/* STEP 1: ARSITEKTUR ALUR DATA IOT */}
      {activeStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 01 · Konseptual &amp; Alur Data</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Arsitektur End-to-End: IoT Sensor ke Microsoft SQL Server
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Dalam sistem IoT skala industri, menghubungkan mikrokontroler (seperti ESP32/Arduino) secara langsung ke port database SQL Server (Port 1433) sangat tidak disarankan karena keterbatasan memori mikrokontroler dan risiko keamanan. Pola arsitektur standar industri menggunakan <strong>Gateway / Ingestion Layer</strong> sebagai perantara.
            </p>
          </div>

          {/* Architecture Flow Diagram */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Diagram Alur Komunikasi 4-Lapisan</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              
              {/* Layer 1 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="font-bold text-white">1. Field Devices</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  ESP32, PLC Siemens, Arduino, RS485 Modbus Sensor yang membaca Suhu, Tekanan, Arus, dan Getaran.
                </div>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">
                  Protokol: WiFi / Ethernet / MQTT / HTTP
                </div>
              </div>

              {/* Layer 2 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Network className="w-4 h-4" />
                </div>
                <div className="font-bold text-white">2. Ingestion Gateway</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Backend API (Node.js Express / Python / .NET) yang menerima payload JSON, memvalidasi ambang batas, dan mengelola pool koneksi.
                </div>
                <div className="text-[10px] font-mono text-sky-400 pt-1">
                  Buffer Antrean &amp; Validasi
                </div>
              </div>

              {/* Layer 3 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database className="w-4 h-4" />
                </div>
                <div className="font-bold text-white">3. Microsoft SQL Server</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Database Relasional dengan T-SQL Stored Procedure, Clustered Time-Series Indexing, dan Partitioning harian.
                </div>
                <div className="text-[10px] font-mono text-indigo-400 pt-1">
                  Port: 1433 TCP (SSL Encrypted)
                </div>
              </div>

              {/* Layer 4 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="font-bold text-white">4. NexusIoT Dashboard</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Dashboard web monitoring online dengan grafik live streaming, kontrol aktuator, dan analitik data historis.
                </div>
                <div className="text-[10px] font-mono text-purple-400 pt-1">
                  React SPA + WebSockets / Polling
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Keunggulan Menggunakan Microsoft SQL Server untuk IoT:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>ACID Transaction Compliance:</strong> Menjamin integritas audit log aktuator dan kejadian alarm mesin kritis.</li>
              <li><strong>Non-Clustered &amp; Columnstore Indexing:</strong> Mampu memproses jutaan baris time-series per hari dengan latensi kueri di bawah 15ms.</li>
              <li><strong>Keamanan Kelas Korporat:</strong> Mendukung Transparent Data Encryption (TDE), Always Encrypted, dan granular Role-Based Access Control.</li>
              <li><strong>Interoperabilitas:</strong> Kompatibel penuh dengan SQL Server Management Studio (SSMS), Power BI, Azure Data Studio, Grafana, dan Node.js/Python driver.</li>
            </ul>
          </div>
        </div>
      )}

      {/* STEP 2: KONFIGURASI SQL SERVER & FIREWALL */}
      {activeStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 02 · Konfigurasi Sistem</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Tahap 1: Konfigurasi SQL Server, Port 1433, dan Windows Firewall
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Ikuti 5 langkah wajib berikut di komputer/server tempat Microsoft SQL Server terpasang agar aplikasi IoT monitoring dapat terhubung dengan sukses.
            </p>
          </div>

          {/* Sub-steps */}
          <div className="space-y-5 text-xs text-slate-300">
            
            {/* Step 1.1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="font-bold text-white text-sm">
                  Aktifkan Protokol TCP/IP pada Port 1433 di SQL Server Configuration Manager
                </h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Secara default pada instalasi baru (terutama SQL Server Express), protokol TCP/IP sering kali berada dalam kondisi <em>Disabled</em>. Anda wajib mengaktifkannya:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-2">
                <li>Buka <strong>SQL Server Configuration Manager</strong> dari menu Start Windows.</li>
                <li>Pilih menu <strong>SQL Server Network Configuration</strong> &gt; klik <strong>Protocols for MSSQLSERVER</strong> (atau nama instance Anda).</li>
                <li>Klik kanan pada <strong>TCP/IP</strong> &gt; pilih <strong>Properties</strong>.</li>
                <li>Pada tab <strong>Protocol</strong>: Ubah nilai <strong>Enabled</strong> menjadi <strong>Yes</strong>.</li>
                <li>Pindah ke tab <strong>IP Addresses</strong>: Scroll ke bawah hingga menemukan bagian <strong>IPAll</strong>:
                  <ul className="list-disc list-inside pl-4 text-emerald-300 pt-1">
                    <li>Kosongkan kolom <strong>TCP Dynamic Ports</strong> (hapus angka 0 jika ada).</li>
                    <li>Isi kolom <strong>TCP Port</strong> dengan nilai <strong>1433</strong>.</li>
                  </ul>
                </li>
                <li>Klik <strong>Apply</strong> lalu <strong>OK</strong>.</li>
              </ol>
            </div>

            {/* Step 1.2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="font-bold text-white text-sm">
                  Aktifkan Mixed Mode Authentication (SQL Server &amp; Windows Authentication)
                </h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Backend IoT memerlukan login dengan username &amp; password SQL (bukan akun Windows).
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-2">
                <li>Buka <strong>SQL Server Management Studio (SSMS)</strong> dan lakukan koneksi dengan Windows Authentication.</li>
                <li>Klik kanan pada nama server di Object Explorer &gt; pilih <strong>Properties</strong>.</li>
                <li>Pilih halaman <strong>Security</strong> di panel sebelah kiri.</li>
                <li>Pada bagian Server authentication, pilih <strong>SQL Server and Windows Authentication mode</strong>.</li>
                <li>Klik <strong>OK</strong>.</li>
              </ol>
            </div>

            {/* Step 1.3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    Buat User Database &amp; Berikan Hak Akses (T-SQL)
                  </h4>
                </div>

                <button
                  onClick={() => handleCopy(`-- Buat Login pada Server
CREATE LOGIN iot_service_user 
WITH PASSWORD = 'Password@IoT2026!', 
     CHECK_POLICY = ON;
GO

-- Pindah ke Database IoT
USE IoT_Monitoring;
GO

-- Buat User yang terhubung ke Login
CREATE USER iot_service_user FOR LOGIN iot_service_user;
GO

-- Berikan hak baca, tulis, dan eksekusi Stored Procedure
ALTER ROLE db_datareader ADD MEMBER iot_service_user;
ALTER ROLE db_datawriter ADD MEMBER iot_service_user;
GRANT EXECUTE TO iot_service_user;
GO
PRINT '>> User iot_service_user berhasil dibuat dan diberikan hak akses.';`, 'sec-3')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedCodeId === 'sec-3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'sec-3' ? 'Tersalin' : 'Salin Skrip'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-emerald-300 text-xs overflow-x-auto">
                <pre>{`-- Buat Login pada Server
CREATE LOGIN iot_service_user 
WITH PASSWORD = 'Password@IoT2026!', 
     CHECK_POLICY = ON;
GO

-- Pindah ke Database IoT
USE IoT_Monitoring;
GO

-- Buat User yang terhubung ke Login
CREATE USER iot_service_user FOR LOGIN iot_service_user;
GO

-- Berikan hak baca, tulis, dan eksekusi Stored Procedure
ALTER ROLE db_datareader ADD MEMBER iot_service_user;
ALTER ROLE db_datawriter ADD MEMBER iot_service_user;
GRANT EXECUTE TO iot_service_user;
GO`}</pre>
              </div>
            </div>

            {/* Step 1.4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h4 className="font-bold text-white text-sm">
                  Restart Layanan SQL Server (Service Restart)
                </h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Perubahan pada TCP/IP dan Mode Autentikasi hanya akan berlaku setelah service di-restart:
              </p>
              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-amber-300 text-xs flex items-center justify-between">
                <span>net stop MSSQLSERVER && net start MSSQLSERVER</span>
                <button
                  onClick={() => handleCopy('net stop MSSQLSERVER && net start MSSQLSERVER', 'cmd-restart')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCodeId === 'cmd-restart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                *Catatan: Jika Anda menggunakan SQL Server Express, jalankan: <code>net stop MSSQL$SQLEXPRESS &amp;&amp; net start MSSQL$SQLEXPRESS</code>
              </p>
            </div>

            {/* Step 1.5 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    Buat Inbound Rule di Windows Defender Firewall untuk Port 1433
                  </h4>
                </div>

                <button
                  onClick={() => handleCopy('netsh advfirewall firewall add rule name="SQL Server Port 1433" dir=in action=allow protocol=TCP localport=1433', 'firewall-cmd')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedCodeId === 'firewall-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'firewall-cmd' ? 'Tersalin' : 'Salin Perintah CMD'}</span>
                </button>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Buka <strong>Command Prompt</strong> sebagai Administrator dan jalankan perintah satu baris berikut untuk membuka port:
              </p>
              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-sky-300 text-xs overflow-x-auto">
                netsh advfirewall firewall add rule name="SQL Server Port 1433" dir=in action=allow protocol=TCP localport=1433
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: SKRIP SKEMA DATABASE T-SQL */}
      {activeStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 03 · Skema Database T-SQL</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Tahap 2: Skrip DDL Database, Tabel, Index, dan Stored Procedure
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Jalankan skrip T-SQL berikut di SSMS atau Azure Data Studio untuk membangun skema database <code>IoT_Monitoring</code> yang teroptimasi untuk beban data tinggi.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">File Skrip: IoT_Monitoring_Schema.sql</span>
              <button
                onClick={() => handleCopy(`-- 1. Buat Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IoT_Monitoring')
BEGIN
    CREATE DATABASE IoT_Monitoring;
END
GO

USE IoT_Monitoring;
GO

-- 2. Master Devices
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

-- 3. Telemetry Logs (Time-Series)
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

-- Index Khusus Time-Series Kueri
CREATE NONCLUSTERED INDEX IX_TelemetryLogs_DeviceId_Timestamp 
ON dbo.TelemetryLogs (DeviceId, Timestamp DESC)
INCLUDE (Parameter, Value, Unit, Status);

-- 4. Stored Procedure Batch Insert
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
GO`, 'full-sql')}
                className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeId === 'full-sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeId === 'full-sql' ? 'Tersalin!' : 'Salin Seluruh T-SQL'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#090d14] border border-slate-800 font-mono text-xs text-emerald-300 max-h-[450px] overflow-y-auto leading-relaxed">
              <pre>{`-- 1. Buat Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IoT_Monitoring')
BEGIN
    CREATE DATABASE IoT_Monitoring;
END
GO

USE IoT_Monitoring;
GO

-- 2. Master Devices (Perangkat Terpasang)
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

-- 3. Telemetry Logs (Pencatatan Sensor Skala Waktu)
CREATE TABLE dbo.TelemetryLogs (
    LogId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DeviceId VARCHAR(50) NOT NULL,
    Parameter VARCHAR(50) NOT NULL, -- Contoh: Temperature, Pressure
    Value FLOAT NOT NULL,
    Unit VARCHAR(20) NOT NULL,     -- Contoh: °C, bar, kW
    Status VARCHAR(20) NOT NULL DEFAULT 'normal', -- normal, warning, critical
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_TelemetryLogs_Devices FOREIGN KEY (DeviceId) 
        REFERENCES dbo.Devices(DeviceId) ON DELETE CASCADE
);

-- Indeks Performa Tinggi untuk Pencarian Waktu Riil
CREATE NONCLUSTERED INDEX IX_TelemetryLogs_DeviceId_Timestamp 
ON dbo.TelemetryLogs (DeviceId, Timestamp DESC)
INCLUDE (Parameter, Value, Unit, Status);

-- 4. Stored Procedure Batch Insert
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
        </div>
      )}

      {/* STEP 4: KODE IMPLEMENTASI DRIVER (4 BAHASA) */}
      {activeStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 04 · Kode Sumber Driver</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Tahap 3: Implementasi Driver di Node.js, Python, C#, dan ESP32
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Pilih bahasa pemrograman yang digunakan pada Gateway atau Backend Anda untuk menghubungkan data sensor ke Microsoft SQL Server.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* 1. Node.js (TypeScript/JavaScript) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">JS/TS</div>
                  <h4 className="font-bold text-white text-sm">Node.js Express dengan Package 'mssql'</h4>
                </div>
                <button
                  onClick={() => handleCopy(`import sql from 'mssql';

const sqlConfig: sql.config = {
  user: 'iot_service_user',
  password: 'Password@IoT2026!',
  database: 'IoT_Monitoring',
  server: '192.168.1.100', // atau IP Server SQL Anda
  port: 1433,
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // Set true jika memakai Azure SQL
    trustServerCertificate: true, // true untuk dev/self-signed cert
  },
};

// Inisialisasi pool koneksi tunggal (Singleton)
let pool: sql.ConnectionPool;

export async function getDbPool() {
  if (!pool) {
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    console.log('>> Berhasil terhubung ke Microsoft SQL Server Pool!');
  }
  return pool;
}

// Fungsi Simpan Telemetri
export async function saveTelemetry(deviceId: string, param: string, value: number, unit: string) {
  const p = await getDbPool();
  await p.request()
    .input('DeviceId', sql.VarChar(50), deviceId)
    .input('Parameter', sql.VarChar(50), param)
    .input('Value', sql.Float, value)
    .input('Unit', sql.VarChar(20), unit)
    .execute('dbo.sp_InsertTelemetry');
}`, 'node-code')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedCodeId === 'node-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'node-code' ? 'Tersalin' : 'Salin Kode Node.js'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-xs text-sky-300 max-h-60 overflow-y-auto">
                <pre>{`import sql from 'mssql';

const sqlConfig: sql.config = {
  user: 'iot_service_user',
  password: 'Password@IoT2026!',
  database: 'IoT_Monitoring',
  server: '192.168.1.100', // IP Server SQL Anda
  port: 1433,
  pool: { max: 20, min: 2, idleTimeoutMillis: 30000 },
  options: {
    encrypt: false, // true untuk Azure SQL
    trustServerCertificate: true, // true untuk sertifikat lokal
  },
};

// Pool koneksi singleton
let pool: sql.ConnectionPool;
export async function getDbPool() {
  if (!pool) {
    pool = await new sql.ConnectionPool(sqlConfig).connect();
  }
  return pool;
}

export async function saveTelemetry(deviceId: string, param: string, value: number, unit: string) {
  const p = await getDbPool();
  await p.request()
    .input('DeviceId', sql.VarChar(50), deviceId)
    .input('Parameter', sql.VarChar(50), param)
    .input('Value', sql.Float, value)
    .input('Unit', sql.VarChar(20), unit)
    .execute('dbo.sp_InsertTelemetry');
}`}</pre>
              </div>
            </div>

            {/* 2. Python (Raspberry Pi / Linux Gateway) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold">PY</div>
                  <h4 className="font-bold text-white text-sm">Python (Raspberry Pi Gateway) dengan 'pyodbc'</h4>
                </div>
                <button
                  onClick={() => handleCopy(`import pyodbc

# Connection String ODBC Driver 18 for SQL Server
conn_str = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=192.168.1.100,1433;"
    "DATABASE=IoT_Monitoring;"
    "UID=iot_service_user;"
    "PWD=Password@IoT2026!;"
    "TrustServerCertificate=yes;"
)

def insert_telemetry(device_id, parameter, value, unit, status='normal'):
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Jalankan Stored Procedure dengan parameterized values
    cursor.execute("""
        EXEC dbo.sp_InsertTelemetry 
            @DeviceId = ?, 
            @Parameter = ?, 
            @Value = ?, 
            @Unit = ?, 
            @Status = ?
    """, (device_id, parameter, float(value), unit, status))
    
    conn.commit()
    cursor.close()
    conn.close()

# Contoh Penggunaan:
insert_telemetry('DEV-RCT-01', 'Core Temperature', 78.4, '°C', 'normal')
print(">> Data sensor berhasil disimpan ke Microsoft SQL Server!")`, 'py-code')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedCodeId === 'py-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'py-code' ? 'Tersalin' : 'Salin Python'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-xs text-amber-300 max-h-60 overflow-y-auto">
                <pre>{`import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=192.168.1.100,1433;"
    "DATABASE=IoT_Monitoring;"
    "UID=iot_service_user;"
    "PWD=Password@IoT2026!;"
    "TrustServerCertificate=yes;"
)

def insert_telemetry(device_id, parameter, value, unit, status='normal'):
    with pyodbc.connect(conn_str) as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                EXEC dbo.sp_InsertTelemetry 
                    @DeviceId = ?, @Parameter = ?, @Value = ?, @Unit = ?, @Status = ?
            """, (device_id, parameter, float(value), unit, status))
            conn.commit()`}</pre>
              </div>
            </div>

            {/* 3. ESP32 / Arduino C++ (HTTP REST to Gateway) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-rose-500/10 text-rose-400 font-mono text-xs font-bold">C++</div>
                  <h4 className="font-bold text-white text-sm">ESP32 Arduino C++ (Kirim Payload ke REST Gateway)</h4>
                </div>
                <button
                  onClick={() => handleCopy(`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "PABRIK_WIFI_IOT";
const char* password = "PasswordPabrik2026";
const char* gatewayApiUrl = "http://192.168.1.50:3000/api/mssql/sync-telemetry";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Terhubung!");
}

void sendSensorData(float temperature, float pressure) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(gatewayApiUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    JsonArray readings = doc.createNestedArray("readings");
    
    JsonObject r1 = readings.createNestedObject();
    r1["deviceId"] = "DEV-RCT-01";
    r1["deviceName"] = "Chemical Reactor 01";
    r1["parameter"] = "Core Temperature";
    r1["value"] = temperature;
    r1["unit"] = "°C";

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);
    Serial.printf("HTTP Response Code: %d\\n", httpCode);
    http.end();
  }
}`, 'esp-code')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedCodeId === 'esp-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'esp-code' ? 'Tersalin' : 'Salin Arduino C++'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#090d14] rounded-lg font-mono text-xs text-rose-300 max-h-60 overflow-y-auto">
                <pre>{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* gatewayApiUrl = "http://192.168.1.50:3000/api/mssql/sync-telemetry";

void sendSensorData(float temp) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(gatewayApiUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    JsonArray readings = doc.createNestedArray("readings");
    JsonObject r1 = readings.createNestedObject();
    r1["deviceId"] = "DEV-RCT-01";
    r1["parameter"] = "Core Temperature";
    r1["value"] = temp;
    r1["unit"] = "°C";

    String payload;
    serializeJson(doc, payload);
    int httpResponseCode = http.POST(payload);
    http.end();
  }
}`}</pre>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 5: OPTIMASI PERFORMA & KEAMANAN */}
      {activeStep === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 05 · Best Practices</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Tahap 4: Optimasi Performa Time-Series &amp; Keamanan Industri
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Panduan mempertahankan kestabilan database ketika menangani ribuan sensor dengan frekuensi pembacaan tinggi (High Frequency Ingestion).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>1. Gunakan Connection Pooling</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Membuka koneksi baru ke SQL Server membutuhkan jabat tangan TCP, negosiasi SSL, dan autentikasi (~50-150ms). Dengan <em>Connection Pool</em>, koneksi disimpan tetap hidup dan digunakan kembali (reusable), sehingga waktu eksekusi turun menjadi &lt;2ms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>2. Selalu Gunakan Parameterized Query</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Jangan pernah menggabungkan string langsung (e.g. <code>`INSERT ... VALUES ('${'{'}deviceId{'}'}')`</code>). Selain mencegah SQL Injection, parameterized query memungkinkan SQL Server meng-cache execution plan kueri dalam memory cache plan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>3. Batching &amp; Bulk Insert</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Jika memiliki 50+ sensor yang mengirim data setiap detik, kumpulkan dalam antrean buffer gateway selama 2–5 detik lalu kirim secara batch menggunakan Table-Valued Parameters (TVP) atau <code>SqlBulkCopy</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>4. Strategi Retensi Data &amp; Partisi</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Data IoT bertambah sangat cepat. Buat SQL Server Agent Job untuk memindahkan data yang berusia lebih dari 90 hari ke tabel arsip dingin atau database cold storage agar performa tabel utama tetap prima.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* STEP 6: KAMUS ERROR POPULER & SOLUSINYA */}
      {activeStep === 6 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-purple-400">Bagian 06 · Troubleshooting Assistant</span>
            <h3 className="text-lg font-bold text-white mt-1">
              Tahap 5: Kamus Solusi Error Umum Microsoft SQL Server
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Daftar kode kesalahan yang paling sering ditemui saat menghubungkan aplikasi ke SQL Server beserta solusi konkretnya.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Error 18456 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-800/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Error 18456, Severity 14, State 1: "Login failed for user"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Penyebab:</strong> Mode autentikasi server masih terkunci di Windows-Only (bukan Mixed Mode), password salah, atau user berstatus dinonaktifkan (Disabled).
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-emerald-300 font-mono">
                Solusi: Buka SSMS &gt; Server Properties &gt; Security &gt; Pilih 'SQL Server and Windows Authentication mode' &gt; Restart Service SQL Server.
              </div>
            </div>

            {/* Error 26 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Error 26: "Error Locating Server/Instance Specified"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Penyebab:</strong> Host/IP tidak dapat dijangkau, atau Anda menggunakan Named Instance (misalnya <code>DESKTOP-ABC\SQLEXPRESS</code>) tanpa mengaktifkan service <strong>SQL Server Browser</strong>.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-emerald-300 font-mono">
                Solusi: Gunakan IP langsung dengan Port 1433 (misal: 192.168.1.100,1433), atau buka Services.msc dan ubah 'SQL Server Browser' menjadi Automatic dan Start.
              </div>
            </div>

            {/* ETIMEOUT */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ETIMEOUT / "The wait operation timed out"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Penyebab:</strong> Paket data diblokir oleh Windows Firewall pada server tujuan atau router jaringan lokal.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-emerald-300 font-mono">
                Solusi: Tambahkan Inbound Rule di Windows Defender Firewall untuk Port 1433 TCP: netsh advfirewall firewall add rule name="SQL 1433" dir=in action=allow protocol=TCP localport=1433.
              </div>
            </div>

            {/* Self-signed Cert */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>SSL/TLS Error: "Self signed certificate in certificate chain"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Penyebab:</strong> Driver Node.js / Tedious menolak sertifikat enkripsi default bawaan Windows karena tidak ditandatangani oleh Certificate Authority publik.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-emerald-300 font-mono">
                Solusi: Tambahkan opsi 'trustServerCertificate: true' pada konfigurasi koneksi pool database Anda.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
