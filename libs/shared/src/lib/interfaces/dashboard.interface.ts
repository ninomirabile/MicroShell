export interface DashboardMetrics {
  total_users: number;
  active_users: number;
  total_sessions: number;
  avg_session_duration: number;
  last_updated: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface AnalyticsData {
  user_registrations: ChartData;
  session_activity: ChartData;
  feature_usage: ChartData;
  performance_metrics: ChartData;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  database_status: 'connected' | 'disconnected';
  last_check: string;
} 