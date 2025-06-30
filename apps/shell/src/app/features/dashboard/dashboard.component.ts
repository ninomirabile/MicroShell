import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '@microshell/ui';
import { ApiService } from '@microshell/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="dashboard-container">
      <h1>📊 Dashboard Analytics</h1>
    
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Total Users</h3>
          <div class="metric-value">{{ metrics.totalUsers }}</div>
        </div>
    
        <div class="metric-card">
          <h3>Active Sessions</h3>
          <div class="metric-value">{{ metrics.activeSessions }}</div>
        </div>
    
        <div class="metric-card">
          <h3>Revenue</h3>
          <div class="metric-value">€{{ metrics.revenue }}</div>
        </div>
    
        <div class="metric-card">
          <h3>Growth</h3>
          <div class="metric-value">+{{ metrics.growth }}%</div>
        </div>
      </div>
    
      <div class="charts-section">
        <div class="chart-card">
          <h3>Activity Overview</h3>
          <div class="chart-placeholder">
            📈 Chart will be rendered here
          </div>
        </div>
    
        <div class="chart-card">
          <h3>User Distribution</h3>
          <div class="chart-placeholder">
            📊 Pie chart will be rendered here
          </div>
        </div>
      </div>
    
      @if (loading) {
        <lib-loading message="Loading dashboard data..."></lib-loading>
      }
    </div>
    `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .metric-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3498db;
    }
    
    .metric-card h3 {
      color: #7f8c8d;
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #2c3e50;
    }
    
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .chart-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .chart-card h3 {
      color: #2c3e50;
      margin: 0 0 20px 0;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .chart-placeholder {
      height: 200px;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #6c757d;
      border-radius: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  metrics = {
    totalUsers: 0,
    activeSessions: 0,
    revenue: 0,
    growth: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Simulate API call
    setTimeout(() => {
      this.metrics = {
        totalUsers: 1247,
        activeSessions: 89,
        revenue: 15420,
        growth: 12.5
      };
      this.loading = false;
    }, 1500);
  }
} 