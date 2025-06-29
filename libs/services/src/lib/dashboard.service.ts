import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetrics, AnalyticsData, ChartData, SystemHealth } from '@microshell/shared';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8000/api/dashboard';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.API_URL}/metrics`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.API_URL}/analytics`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getChartData(chartType: string, period: string = '7d'): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/${chartType}`, {
      params: { period },
      headers: this.authService.getAuthHeaders()
    });
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.API_URL}/health`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  seedData(): Observable<any> {
    return this.http.post(`${this.API_URL}/seed`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 