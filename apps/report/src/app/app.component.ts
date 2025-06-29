import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from '@microshell/services';
import { ReportSummary, ReportData, GenerateReportRequest, ReportType, ExportFormat } from '@microshell/shared';

@Component({
  selector: 'report-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // State
  isLoading = true;
  error = '';
  isGenerating = false;
  
  // Data
  reportSummary: ReportSummary | null = null;
  reports: ReportData[] = [];
  totalReports = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Modal
  showReportModal = false;
  selectedReport: ReportData | null = null;
  
  // Form
  reportForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private fb: FormBuilder
  ) {
    this.reportForm = this.createReportForm();
  }

  ngOnInit(): void {
    this.loadReportSummary();
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createReportForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      type: ['', [Validators.required]],
      format: ['', [Validators.required]],
      start_date: [''],
      end_date: [''],
      // Additional parameters
      include_inactive: [false],
      detailed_metrics: [false],
      log_level: ['']
    });
  }

  private loadReportSummary(): void {
    this.reportService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.reportSummary = summary;
        },
        error: (error) => {
          console.error('Error loading report summary:', error);
        }
      });
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = '';

    this.reportService.getReports(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reports = response.reports;
          this.totalReports = response.total;
          this.totalPages = Math.ceil(response.total / this.pageSize);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading reports:', error);
          this.error = 'Failed to load reports';
          this.isLoading = false;
        }
      });
  }

  generateReport(): void {
    if (this.reportForm.valid) {
      this.isGenerating = true;
      
      const formValue = this.reportForm.value;
      const request: GenerateReportRequest = {
        title: formValue.title,
        type: formValue.type as ReportType,
        format: formValue.format as ExportFormat,
        parameters: this.buildParameters(formValue),
        date_range: this.buildDateRange(formValue)
      };

      this.reportService.generateReport(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (report) => {
            this.isGenerating = false;
            this.loadReports();
            this.loadReportSummary();
            alert(`Report "${report.title}" has been queued for generation.`);
            this.resetForm();
          },
          error: (error) => {
            this.isGenerating = false;
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
          }
        });
    }
  }

  private buildParameters(formValue: any): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    if (formValue.type === 'user_activity') {
      parameters['include_inactive'] = formValue['include_inactive'];
    } else if (formValue.type === 'system_performance') {
      parameters['detailed_metrics'] = formValue['detailed_metrics'];
    } else if (formValue.type === 'audit_log') {
      if (formValue['log_level']) {
        parameters['log_level'] = formValue['log_level'];
      }
    }
    
    return parameters;
  }

  private buildDateRange(formValue: any): { start_date: string; end_date: string } | undefined {
    if (formValue.start_date && formValue.end_date) {
      return {
        start_date: formValue.start_date,
        end_date: formValue.end_date
      };
    }
    return undefined;
  }

  resetForm(): void {
    this.reportForm.reset();
    this.reportForm.patchValue({
      include_inactive: false,
      detailed_metrics: false,
      log_level: ''
    });
  }

  refreshReports(): void {
    this.loadReports();
    this.loadReportSummary();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReports();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReports();
    }
  }

  viewReport(report: ReportData): void {
    this.selectedReport = report;
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedReport = null;
  }

  downloadReport(report: ReportData): void {
    if (report.status === 'completed') {
      const filename = `${report.title.replace(/\s+/g, '_')}_${report.id}.${this.getFileExtension(report.parameters?.['format'] || 'csv')}`;
      this.reportService.downloadReport(report.id, report.parameters?.['format'] || 'csv', filename);
    }
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'csv': return 'csv';
      case 'json': return 'json';
      case 'pdf': return 'pdf';
      case 'xlsx': return 'xlsx';
      default: return 'csv';
    }
  }

  deleteReport(report: ReportData): void {
    if (confirm(`Are you sure you want to delete the report "${report.title}"?`)) {
      // Implement delete functionality
      alert('Delete functionality will be implemented soon!');
    }
  }

  getSystemHealthReport(): void {
    this.reportService.getSystemHealthReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (healthReport) => {
          // Create a blob and download it
          const blob = new Blob([JSON.stringify(healthReport, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `system_health_report_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error getting system health report:', error);
          alert('Failed to generate system health report.');
        }
      });
  }

  // Utility methods
  formatReportType(type: string): string {
    switch (type) {
      case 'user_activity': return 'User Activity';
      case 'system_performance': return 'System Performance';
      case 'audit_log': return 'Audit Log';
      case 'custom': return 'Custom';
      default: return type;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatTime(seconds?: number): string {
    if (!seconds) return 'N/A';
    return `${Math.round(seconds * 100) / 100}s`;
  }
}
