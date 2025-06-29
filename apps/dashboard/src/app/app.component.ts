import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '@microshell/services';
import { DashboardMetrics, AnalyticsData, SystemHealth } from '@microshell/shared';

Chart.register(...registerables);

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeClass: string;
}

@Component({
  selector: 'dashboard-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('userRegistrationsChart', { static: false }) userRegistrationsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sessionActivityChart', { static: false }) sessionActivityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('featureUsageChart', { static: false }) featureUsageChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart', { static: false }) performanceChart!: ElementRef<HTMLCanvasElement>;

  // State
  isLoading = true;
  error = '';
  selectedPeriod = '7d';

  // Data
  metrics: DashboardMetrics | null = null;
  analytics: AnalyticsData | null = null;
  systemHealth: SystemHealth | null = null;
  metricsCards: MetricCard[] = [];

  // Charts
  private charts: { [key: string]: Chart } = {};
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Load metrics
    this.dashboardService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.metrics = metrics;
          this.updateMetricsCards();
        },
        error: (error) => {
          console.error('Error loading metrics:', error);
          this.error = 'Failed to load dashboard metrics';
          this.isLoading = false;
        }
      });

    // Load analytics
    this.dashboardService.getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.analytics = analytics;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error loading analytics:', error);
        }
      });

    // Load system health
    this.dashboardService.getSystemHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (health) => {
          this.systemHealth = health;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading system health:', error);
          this.isLoading = false;
        }
      });
  }

  private updateMetricsCards(): void {
    if (!this.metrics) return;

    this.metricsCards = [
      {
        title: 'Total Users',
        value: this.metrics.total_users.toLocaleString(),
        change: '+12% from last month',
        changeClass: 'positive'
      },
      {
        title: 'Active Users',
        value: this.metrics.active_users.toLocaleString(),
        change: '+8% from last month',
        changeClass: 'positive'
      },
      {
        title: 'Total Sessions',
        value: this.metrics.total_sessions.toLocaleString(),
        change: '+15% from last month',
        changeClass: 'positive'
      },
      {
        title: 'Avg Session Duration',
        value: `${Math.round(this.metrics.avg_session_duration)} min`,
        change: '-2% from last month',
        changeClass: 'negative'
      }
    ];
  }

  private initializeCharts(): void {
    if (this.analytics) {
      this.createUserRegistrationsChart();
      this.createSessionActivityChart();
      this.createFeatureUsageChart();
      this.createPerformanceChart();
    }
  }

  private createUserRegistrationsChart(): void {
    if (!this.userRegistrationsChart || !this.analytics) return;

    const ctx = this.userRegistrationsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['userRegistrations'] = new Chart(ctx, {
      type: 'line',
      data: this.analytics.user_registrations,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private createSessionActivityChart(): void {
    if (!this.sessionActivityChart || !this.analytics) return;

    const ctx = this.sessionActivityChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['sessionActivity'] = new Chart(ctx, {
      type: 'bar',
      data: this.analytics.session_activity,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private createFeatureUsageChart(): void {
    if (!this.featureUsageChart || !this.analytics) return;

    const ctx = this.featureUsageChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['featureUsage'] = new Chart(ctx, {
      type: 'doughnut',
      data: this.analytics.feature_usage,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private createPerformanceChart(): void {
    if (!this.performanceChart || !this.analytics) return;

    const ctx = this.performanceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['performance'] = new Chart(ctx, {
      type: 'line',
      data: this.analytics.performance_metrics,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private updateCharts(): void {
    this.destroyCharts();
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private destroyCharts(): void {
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
    this.charts = {};
  }

  onPeriodChange(): void {
    this.loadAnalyticsForPeriod();
  }

  private loadAnalyticsForPeriod(): void {
    this.dashboardService.getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.analytics = analytics;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error loading analytics for period:', error);
        }
      });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  seedData(): void {
    this.dashboardService.seedData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Sample data seeded successfully!');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error seeding data:', error);
          alert('Failed to seed data. Please try again.');
        }
      });
  }

  exportData(): void {
    // Implement export functionality
    alert('Export functionality will be implemented soon!');
  }

  clearCache(): void {
    // Implement cache clearing
    alert('Cache cleared successfully!');
  }

  formatUptime(seconds?: number): string {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }
}
