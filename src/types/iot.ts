export type DeviceStatus = 'online' | 'warning' | 'critical' | 'offline';
export type TelemetryStatus = 'normal' | 'warning' | 'critical';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Device {
  id: string;
  name: string;
  category: 'Industrial Reactor' | 'Cold Logistics' | 'Power Grid' | 'Water Treatment' | 'Environment' | 'Turbomachinery';
  location: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: DeviceStatus;
  signalStrengthDbm: number;
  batteryPercent?: number;
  lastHeartbeat: string;
  activeAlarmsCount: number;
}

export interface TelemetryReading {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  parameter: string;
  value: number;
  unit: string;
  status: TelemetryStatus;
  timestamp: string;
  minWarning: number;
  maxWarning: number;
  minCritical: number;
  maxCritical: number;
  history: number[];
  syncedToSql?: boolean;
}

export interface Actuator {
  id: string;
  deviceId: string;
  name: string;
  type: 'relay' | 'valve' | 'fan' | 'pump' | 'breaker';
  state: boolean | number;
  unit?: string;
  status: 'idle' | 'running' | 'tripped';
  lastUpdated: string;
  lastUser: string;
}

export interface AlertEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  parameter: string;
  triggerValue: number;
  thresholdValue: number;
  unit: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface MssqlConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  connectTimeout: number;
  autoSync: boolean;
  syncIntervalSec: number;
}

export interface MssqlConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'simulated';
  latencyMs?: number;
  serverVersion?: string;
  currentDb?: string;
  serverTime?: string;
  errorMessage?: string;
  errorCode?: string;
  diagnostic?: string;
  lastTestedAt?: string;
  totalSyncedCount: number;
}
