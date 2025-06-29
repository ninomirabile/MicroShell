import { Component, OnInit } from '@angular/core';
import { ApiService } from '@microshell/services';

interface ReportData {
  name: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-report',
  template: `
    <div class="report-container">
      <h1>📊 Report & Analytics</h1>
      
      <div class="report-filters">
        <div class="filter-group">
          <label>Periodo:</label>
          <select [(ngModel)]="selectedPeriod" (change)="loadReportData()">
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 3 mesi</option>
            <option value="1y">Ultimo anno</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Categoria:</label>
          <select [(ngModel)]="selectedCategory" (change)="loadReportData()">
            <option value="all">Tutte</option>
            <option value="users">Utenti</option>
            <option value="revenue">Ricavi</option>
            <option value="performance">Performance</option>
          </select>
        </div>
        
        <button class="btn btn-primary" (click)="exportReport()">
          📥 Esporta Report
        </button>
      </div>
      
      <div class="report-summary">
        <div class="summary-card">
          <h3>Panoramica Generale</h3>
          <div class="summary-metrics">
            <div class="metric">
              <span class="metric-label">Totale Eventi</span>
              <span class="metric-value">{{ summary.totalEvents }}</span>
              <span class="metric-trend" [class]="'trend-' + summary.eventsTrend">
                {{ getTrendIcon(summary.eventsTrend) }} {{ summary.eventsChange }}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Conversioni</span>
              <span class="metric-value">{{ summary.conversions }}</span>
              <span class="metric-trend" [class]="'trend-' + summary.conversionsTrend">
                {{ getTrendIcon(summary.conversionsTrend) }} {{ summary.conversionsChange }}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Tasso di Successo</span>
              <span class="metric-value">{{ summary.successRate }}%</span>
              <span class="metric-trend" [class]="'trend-' + summary.successRateTrend">
                {{ getTrendIcon(summary.successRateTrend) }} {{ summary.successRateChange }}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-charts">
        <div class="chart-card">
          <h3>Performance nel Tempo</h3>
          <div class="chart-placeholder">
            📈 Grafico delle performance nel tempo
            <br><small>Dati per {{ selectedPeriod === '7d' ? '7 giorni' : selectedPeriod === '30d' ? '30 giorni' : selectedPeriod === '90d' ? '3 mesi' : 'anno' }}</small>
          </div>
        </div>
        
        <div class="chart-card">
          <h3>Distribuzione per Categoria</h3>
          <div class="category-chart">
            <div class="category-item" *ngFor="let item of reportData">
              <div class="category-info">
                <span class="category-name">{{ item.name }}</span>
                <span class="category-percentage">{{ item.percentage }}%</span>
              </div>
              <div class="category-bar">
                <div class="category-fill" [style.width.%]="item.percentage"></div>
              </div>
              <div class="category-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detailed-report">
        <h3>Report Dettagliato</h3>
        <div class="report-table">
          <table>
            <thead>
              <tr>
                <th>Metrica</th>
                <th>Valore Attuale</th>
                <th>Periodo Precedente</th>
                <th>Variazione</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of reportData">
                <td>{{ item.name }}</td>
                <td>{{ item.value }}</td>
                <td>{{ getPreviousValue(item.value, item.percentage) }}</td>
                <td [class]="'change-' + item.trend">{{ item.percentage > 0 ? '+' : '' }}{{ item.percentage }}%</td>
                <td>
                  <span class="trend-indicator" [class]="'trend-' + item.trend">
                    {{ getTrendIcon(item.trend) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <lib-loading *ngIf="loading" message="Generazione report..."></lib-loading>
    </div>
  `,
  styles: [`
    .report-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .report-filters {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      flex-wrap: wrap;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .filter-group label {
      font-weight: 500;
      color: #555;
      font-size: 14px;
    }
    
    .filter-group select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    
    .report-summary {
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .metric {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .metric-label {
      display: block;
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }
    
    .metric-value {
      display: block;
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    
    .metric-trend {
      font-size: 12px;
      font-weight: 500;
    }
    
    .trend-up {
      color: #27ae60;
    }
    
    .trend-down {
      color: #e74c3c;
    }
    
    .trend-stable {
      color: #f39c12;
    }
    
    .report-charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .chart-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .chart-card h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .chart-placeholder {
      height: 250px;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #6c757d;
      border-radius: 8px;
      text-align: center;
    }
    
    .category-chart {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .category-info {
      min-width: 120px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    
    .category-name {
      font-weight: 500;
      color: #2c3e50;
    }
    
    .category-percentage {
      font-size: 12px;
      color: #7f8c8d;
    }
    
    .category-bar {
      flex: 1;
      height: 20px;
      background: #ecf0f1;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .category-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2980b9);
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    
    .category-value {
      min-width: 60px;
      text-align: right;
      font-weight: 500;
      color: #2c3e50;
    }
    
    .detailed-report {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .detailed-report h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .report-table {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    .change-up {
      color: #27ae60;
      font-weight: 500;
    }
    
    .change-down {
      color: #e74c3c;
      font-weight: 500;
    }
    
    .change-stable {
      color: #f39c12;
      font-weight: 500;
    }
    
    .trend-indicator {
      font-size: 16px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn:hover {
      opacity: 0.8;
    }
    
    @media (max-width: 768px) {
      .report-filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-group {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      
      .summary-metrics {
        grid-template-columns: 1fr;
      }
      
      .report-charts {
        grid-template-columns: 1fr;
      }
      
      .category-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .category-info {
        min-width: auto;
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class ReportComponent implements OnInit {
  loading = true;
  selectedPeriod = '30d';
  selectedCategory = 'all';
  
  summary = {
    totalEvents: 15420,
    conversions: 1247,
    successRate: 78.5,
    eventsTrend: 'up' as const,
    eventsChange: 12.3,
    conversionsTrend: 'up' as const,
    conversionsChange: 8.7,
    successRateTrend: 'stable' as const,
    successRateChange: 2.1
  };
  
  reportData: ReportData[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.reportData = [
        { name: 'Registrazioni Utenti', value: 342, percentage: 15.2, trend: 'up' },
        { name: 'Login Riusciti', value: 1567, percentage: 8.3, trend: 'up' },
        { name: 'Sessioni Attive', value: 89, percentage: -5.1, trend: 'down' },
        { name: 'Transazioni', value: 234, percentage: 12.7, trend: 'up' },
        { name: 'Errori Sistema', value: 23, percentage: -18.3, trend: 'down' },
        { name: 'Tempo Risposta (ms)', value: 145, percentage: 3.2, trend: 'stable' }
      ];
      this.loading = false;
    }, 1000);
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  getPreviousValue(current: number, percentageChange: number): number {
    if (percentageChange === 0) return current;
    return Math.round(current / (1 + percentageChange / 100));
  }

  exportReport() {
    // Simulate export functionality
    alert('Report esportato con successo!\n\nDati inclusi:\n- Periodo: ' + this.selectedPeriod + '\n- Categoria: ' + this.selectedCategory + '\n- Formato: CSV\n\n(Funzionalità di export in sviluppo)');
  }
} 