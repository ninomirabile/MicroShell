import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportSummary, ReportData, GenerateReportRequest, ExportReportRequest, ExportFormat } from '@microshell/shared';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = 'http://localhost:8000/api/reports';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getSummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.API_URL}/summary`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getReports(page: number = 1, size: number = 10): Observable<{ reports: ReportData[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<{ reports: ReportData[], total: number }>(this.API_URL, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  generateReport(request: GenerateReportRequest): Observable<ReportData> {
    return this.http.post<ReportData>(`${this.API_URL}/generate`, request, {
      headers: this.authService.getAuthHeaders()
    });
  }

  exportReport(reportId: string, format: ExportFormat): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${reportId}/export`, {
      params: { format },
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  downloadReport(reportId: string, format: ExportFormat, filename: string): void {
    this.exportReport(reportId, format).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getSystemHealthReport(): Observable<any> {
    return this.http.get(`${this.API_URL}/system-health`, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 