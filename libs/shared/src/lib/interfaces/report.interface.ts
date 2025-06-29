export interface ReportSummary {
  total_reports: number;
  reports_this_month: number;
  most_common_type: string;
  avg_generation_time: number;
  last_generated: string;
}

export interface ReportData {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  created_at: string;
  generated_at?: string;
  file_path?: string;
  parameters: Record<string, any>;
  size?: number;
}

export type ReportType = 'user_activity' | 'system_performance' | 'audit_log' | 'custom';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export interface GenerateReportRequest {
  title: string;
  type: ReportType;
  format: ExportFormat;
  parameters: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface ExportReportRequest {
  report_id: string;
  format: ExportFormat;
} 