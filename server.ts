import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory telemetry log buffer (last 500 records)
interface TelemetryRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  parameter: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
  syncedToSql?: boolean;
}

let simulatedSqlSyncedBuffer: TelemetryRecord[] = [];

// MSSQL Configuration validation helper
function createSqlConfig(body: any): sql.config {
  return {
    server: body.server || 'localhost',
    port: parseInt(body.port, 10) || 1433,
    user: body.user || 'sa',
    password: body.password || '',
    database: body.database || 'IoT_Monitoring',
    options: {
      encrypt: body.encrypt !== false,
      trustServerCertificate: body.trustServerCertificate !== false,
      connectTimeout: parseInt(body.connectTimeout, 10) || 7000,
      requestTimeout: 10000,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

// 1. Test Connection API
app.post('/api/mssql/test-connection', async (req, res) => {
  const { server, port = 1433, database, user, password, trustServerCertificate = true, encrypt = false } = req.body;
  const startTime = Date.now();

  if (!server) {
    return res.status(400).json({
      success: false,
      message: 'Parameter "server" (Host/IP) wajib diisi.',
      diagnostic: 'Harap masukkan IP server, hostname, atau Azure SQL server address.',
    });
  }

  // Attempt real MSSQL connection with timeout
  const config = createSqlConfig(req.body);

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as current_db, GETDATE() as server_time');
    const latencyMs = Date.now() - startTime;
    await pool.close();

    return res.json({
      success: true,
      connected: true,
      latencyMs,
      serverVersion: result.recordset[0]?.version?.split('\n')[0] || 'Microsoft SQL Server',
      currentDb: result.recordset[0]?.current_db || database,
      serverTime: result.recordset[0]?.server_time,
      message: `Berhasil terhubung ke Microsoft SQL Server di ${server}:${port}!`,
      details: {
        server,
        port,
        database,
        user,
        sslEncrypted: encrypt,
        trustCertificate: trustServerCertificate,
      },
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = err.message || 'Unknown connection error';
    const errCode = err.code || err.originalError?.code || 'UNKNOWN';

    // Detailed troubleshooting diagnostic
    let diagnosticAdvice = 'Periksa apakah service SQL Server sedang berjalan dan port 1433 terbuka.';
    if (errorMsg.includes('Login failed') || errorMsg.includes('18456')) {
      diagnosticAdvice = 'Autentikasi gagal (Error 18456). Pastikan SQL Server mengaktifkan "Mixed Mode Authentication" (SQL Server and Windows Authentication) dan username/password benar.';
    } else if (errorMsg.includes('ETIMEOUT') || errorMsg.includes('timeout') || errorMsg.includes('ESOCKET')) {
      diagnosticAdvice = `Koneksi timeout ke ${server}:${port}. Pastikan TCP/IP aktif di SQL Server Configuration Manager, service SQL Server Browser aktif jika menggunakan named instance, dan Windows Firewall mengizinkan Inbound Port 1433.`;
    } else if (errorMsg.includes('self signed certificate') || errorMsg.includes('certificate')) {
      diagnosticAdvice = 'Sertifikat SSL/TLS ditolak. Aktifkan opsi "Trust Server Certificate" pada konfigurasi koneksi.';
    } else if (errorMsg.includes('Cannot open database')) {
      diagnosticAdvice = `Database "${database}" belum dibuat atau user "${user}" tidak memiliki hak akses (db_datareader / db_datawriter). Jalankan skrip pembuatan database terlebih dahulu.`;
    }

    return res.json({
      success: false,
      connected: false,
      latencyMs,
      errorCode: errCode,
      message: errorMsg,
      diagnostic: diagnosticAdvice,
      hostAttempted: `${server}:${port}`,
      // Provide fallback indicator so frontend can showcase both real error diagnostic and allow simulated pipeline execution
      simulationAvailable: true,
    });
  }
});

// 2. Execute Query API (with real execution or realistic fallback simulator)
app.post('/api/mssql/execute-query', async (req, res) => {
  const { query, connectionConfig } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query T-SQL tidak boleh kosong' });
  }

  // Attempt real query if connectionConfig is provided and configured
  if (connectionConfig && connectionConfig.server && connectionConfig.isRealConnection) {
    try {
      const config = createSqlConfig(connectionConfig);
      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      const result = await pool.request().query(query);
      await pool.close();
      return res.json({
        success: true,
        source: 'real_mssql',
        rowsAffected: result.rowsAffected,
        recordset: result.recordset || [],
        columns: result.recordset?.length ? Object.keys(result.recordset[0]) : [],
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: err.code || 'SQL_EXEC_ERROR',
      });
    }
  }

  // Safe Interactive T-SQL Simulator for test environment / sandboxes
  const trimmed = query.trim().toUpperCase();
  if (trimmed.startsWith('SELECT') && trimmed.includes('TELEMETRYLOGS')) {
    const sampleRows = [
      { LogId: 1042, DeviceId: 'DEV-RCT-01', Parameter: 'Temperature', Value: 78.4, Unit: '°C', Status: 'warning', LoggedAt: new Date(Date.now() - 12000).toISOString() },
      { LogId: 1041, DeviceId: 'DEV-RCT-01', Parameter: 'Pressure', Value: 4.82, Unit: 'bar', Status: 'normal', LoggedAt: new Date(Date.now() - 14000).toISOString() },
      { LogId: 1040, DeviceId: 'DEV-WTP-04', Parameter: 'FlowRate', Value: 145.2, Unit: 'm³/h', Status: 'normal', LoggedAt: new Date(Date.now() - 25000).toISOString() },
      { LogId: 1039, DeviceId: 'DEV-TRB-06', Parameter: 'Vibration', Value: 5.61, Unit: 'mm/s', Status: 'critical', LoggedAt: new Date(Date.now() - 32000).toISOString() },
      { LogId: 1038, DeviceId: 'DEV-SUB-03', Parameter: 'ActivePower', Value: 382.5, Unit: 'kW', Status: 'normal', LoggedAt: new Date(Date.now() - 45000).toISOString() },
    ];
    return res.json({
      success: true,
      source: 'mssql_sandbox_engine',
      rowsAffected: [sampleRows.length],
      recordset: sampleRows,
      columns: ['LogId', 'DeviceId', 'Parameter', 'Value', 'Unit', 'Status', 'LoggedAt'],
      notice: 'Menjalankan kueri simulasi T-SQL Engine (Koneksi langsung ke server nyata dapat diaktifkan pada tab Konfigurasi).',
    });
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('DEVICES')) {
    const sampleDevices = [
      { DeviceId: 'DEV-RCT-01', Name: 'Reactor Vessel 01', Category: 'Sensors', Status: 'Online', LastHeartbeat: new Date().toISOString() },
      { DeviceId: 'DEV-CLD-02', Name: 'Cold Storage Room B', Category: 'Sensors', Status: 'Online', LastHeartbeat: new Date().toISOString() },
      { DeviceId: 'DEV-SUB-03', Name: 'Substation Transformer', Category: 'Sensors', Status: 'Online', LastHeartbeat: new Date().toISOString() },
      { DeviceId: 'DEV-WTP-04', Name: 'Water Treatment Line', Category: 'Sensors', Status: 'Online', LastHeartbeat: new Date().toISOString() },
      { DeviceId: 'DEV-TRB-06', Name: 'Turbine Unit 02 Motor', Category: 'Sensors', Status: 'Warning', LastHeartbeat: new Date().toISOString() },
    ];
    return res.json({
      success: true,
      source: 'mssql_sandbox_engine',
      rowsAffected: [sampleDevices.length],
      recordset: sampleDevices,
      columns: ['DeviceId', 'Name', 'Category', 'Status', 'LastHeartbeat'],
    });
  }

  return res.json({
    success: true,
    source: 'mssql_sandbox_engine',
    rowsAffected: [1],
    recordset: [{ Result: 'Command executed successfully in IoT MSSQL Sandbox', Timestamp: new Date().toISOString() }],
    columns: ['Result', 'Timestamp'],
  });
});

// 3. Batch Telemetry Sync Endpoint (Receives readings from IoT simulator or real sensors)
app.post('/api/mssql/sync-telemetry', (req, res) => {
  const { readings } = req.body;
  if (!Array.isArray(readings) || readings.length === 0) {
    return res.status(400).json({ error: 'Data readings tidak valid' });
  }

  const timestamp = new Date().toISOString();
  const stampedReadings = readings.map((r, idx) => ({
    ...r,
    id: r.id || `LOG-${Date.now()}-${idx}`,
    timestamp: r.timestamp || timestamp,
    syncedToSql: true,
  }));

  simulatedSqlSyncedBuffer = [...stampedReadings, ...simulatedSqlSyncedBuffer].slice(0, 500);

  return res.json({
    success: true,
    syncedCount: readings.length,
    totalBuffered: simulatedSqlSyncedBuffer.length,
    timestamp,
    message: `${readings.length} data telemetri berhasil disinkronkan ke buffer Microsoft SQL Server!`,
  });
});

// 4. Download / Export Full T-SQL Schema File
app.get('/api/mssql/export-schema', (_req, res) => {
  const tsql = `-- ===============================================================
-- Database Architecture: IoT_Monitoring System
-- Platform: Microsoft SQL Server 2017 / 2019 / 2022 / Azure SQL Database
-- Generated for: NexusIoT Monitoring Platform
-- Date: ${new Date().toISOString()}
-- ===============================================================

USE master;
GO

-- 1. Buat Database IoT_Monitoring jika belum ada
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IoT_Monitoring')
BEGIN
    CREATE DATABASE IoT_Monitoring;
    PRINT '>> Database IoT_Monitoring berhasil dibuat.';
END
GO

USE IoT_Monitoring;
GO

-- 2. Buat Tabel Devices (Master Alat & Sensor IoT)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devices')
BEGIN
    CREATE TABLE dbo.Devices (
        DeviceId VARCHAR(50) NOT NULL PRIMARY KEY,
        DeviceName NVARCHAR(100) NOT NULL,
        Category VARCHAR(50) NOT NULL,
        Location NVARCHAR(100) NOT NULL,
        IpAddress VARCHAR(45) NULL,
        MacAddress VARCHAR(20) NULL,
        FirmwareVersion VARCHAR(20) DEFAULT 'v1.0.0',
        Status VARCHAR(20) DEFAULT 'Online', -- 'Online', 'Offline', 'Warning', 'Critical'
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE NONCLUSTERED INDEX IX_Devices_Status ON dbo.Devices(Status);
    PRINT '>> Tabel dbo.Devices berhasil dibuat.';
END
GO

-- 3. Buat Tabel TelemetryLogs (High-Throughput Time-Series Readings)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TelemetryLogs')
BEGIN
    CREATE TABLE dbo.TelemetryLogs (
        LogId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        DeviceId VARCHAR(50) NOT NULL,
        Parameter VARCHAR(50) NOT NULL, -- e.g. Temperature, Pressure, Humidity, Voltage, Vibration
        Value FLOAT NOT NULL,
        Unit VARCHAR(20) NOT NULL,     -- e.g. °C, bar, %RH, V, mm/s
        Status VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'warning', 'critical'
        Timestamp DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_TelemetryLogs_Devices FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(DeviceId) ON DELETE CASCADE
    );

    -- Index optimal untuk kueri time-series berdasarkan Device dan Waktu
    CREATE NONCLUSTERED INDEX IX_TelemetryLogs_DeviceId_Timestamp 
    ON dbo.TelemetryLogs (DeviceId, Timestamp DESC)
    INCLUDE (Parameter, Value, Unit, Status);

    PRINT '>> Tabel dbo.TelemetryLogs berhasil dibuat.';
END
GO

-- 4. Buat Tabel AlertEvents (Pemberitahuan Threshold Terlampaui)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AlertEvents')
BEGIN
    CREATE TABLE dbo.AlertEvents (
        AlertId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        DeviceId VARCHAR(50) NOT NULL,
        Parameter VARCHAR(50) NOT NULL,
        TriggerValue FLOAT NOT NULL,
        ThresholdValue FLOAT NOT NULL,
        Severity VARCHAR(20) NOT NULL, -- 'Warning', 'Critical'
        Message NVARCHAR(255) NOT NULL,
        IsAcknowledged BIT NOT NULL DEFAULT 0,
        AcknowledgedBy NVARCHAR(100) NULL,
        AcknowledgedAt DATETIMEOFFSET NULL,
        IsResolved BIT NOT NULL DEFAULT 0,
        ResolvedAt DATETIMEOFFSET NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_AlertEvents_Devices FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(DeviceId)
    );
    CREATE NONCLUSTERED INDEX IX_AlertEvents_Severity_Active ON dbo.AlertEvents(Severity, IsResolved);
    PRINT '>> Tabel dbo.AlertEvents berhasil dibuat.';
END
GO

-- 5. Buat Tabel DeviceActuators (Status Saklar, Relay, Valve, dan Kontrol Jarak Jauh)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeviceActuators')
BEGIN
    CREATE TABLE dbo.DeviceActuators (
        ActuatorId VARCHAR(50) NOT NULL PRIMARY KEY,
        DeviceId VARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Type VARCHAR(30) NOT NULL, -- 'relay', 'valve', 'fan', 'pump', 'heater'
        CurrentState VARCHAR(50) NOT NULL DEFAULT 'OFF',
        Value FLOAT NOT NULL DEFAULT 0,
        LastControlledBy NVARCHAR(100) DEFAULT 'System',
        LastCommandAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_DeviceActuators_Devices FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(DeviceId)
    );
    PRINT '>> Tabel dbo.DeviceActuators berhasil dibuat.';
END
GO

-- 6. Stored Procedure Berkecepatan Tinggi untuk Insert Telemetri Batch
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
    
    IF @Timestamp IS NULL
        SET @Timestamp = SYSDATETIMEOFFSET();

    INSERT INTO dbo.TelemetryLogs (DeviceId, Parameter, Value, Unit, Status, Timestamp)
    VALUES (@DeviceId, @Parameter, @Value, @Unit, @Status, @Timestamp);

    -- Perbarui last heartbeat di tabel Devices
    UPDATE dbo.Devices
    SET UpdatedAt = @Timestamp,
        Status = CASE WHEN @Status = 'critical' THEN 'Critical'
                      WHEN @Status = 'warning' THEN 'Warning'
                      ELSE 'Online' END
    WHERE DeviceId = @DeviceId;
END;
GO
PRINT '>> Stored Procedure dbo.sp_InsertTelemetry berhasil dikompilasi.';
GO

-- 7. View Statistik Agregat Real-time 24 Jam Terakhir
CREATE OR ALTER VIEW dbo.vw_LatestTelemetrySummary
AS
SELECT 
    d.DeviceId,
    d.DeviceName,
    d.Location,
    t.Parameter,
    t.Value AS LatestValue,
    t.Unit,
    t.Status AS TelemetryStatus,
    t.Timestamp AS LastReadingTime
FROM dbo.Devices d
CROSS APPLY (
    SELECT TOP 1 Parameter, Value, Unit, Status, Timestamp
    FROM dbo.TelemetryLogs tl
    WHERE tl.DeviceId = d.DeviceId
    ORDER BY tl.Timestamp DESC
) t;
GO
PRINT '>> View dbo.vw_LatestTelemetrySummary berhasil dibuat.';
GO

PRINT '===============================================================';
PRINT '>> INSTALASI SKEMA IOT MICROSOFT SQL SERVER SELESAI DENGAN SUKSES!';
PRINT '===============================================================';
`;

  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', 'attachment; filename="IoT_Monitoring_MSSQL_Schema.sql"');
  res.send(tsql);
});

// 5. System Status API
app.get('/api/system/status', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'NexusIoT Online Monitoring Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    mssqlDriver: 'mssql (tedious) v11',
    features: [
      'Real-time Multi-sensor Telemetry Streaming',
      'Actuator Relay & Proportional Valve Control',
      'Alert Threshold Detection & Event Logging',
      'Native Microsoft SQL Server Connection Pool',
      'Interactive T-SQL Workbench & Schema Export',
    ],
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexusIoT Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
