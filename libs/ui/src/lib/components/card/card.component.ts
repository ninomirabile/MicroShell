import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.clickable]="clickable" [class.elevated]="elevated">
      <div *ngIf="title" class="card-header">
        <h3 class="card-title">{{ title }}</h3>
        <div *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</div>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      <div *ngIf="hasFooter" class="card-footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e5e9;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    
    .card.clickable {
      cursor: pointer;
    }
    
    .card.clickable:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    .card.elevated {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e1e5e9;
      background-color: #f8f9fa;
    }
    
    .card-title {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .card-subtitle {
      margin: 0;
      font-size: 14px;
      color: #6c757d;
    }
    
    .card-content {
      padding: 20px;
    }
    
    .card-footer {
      padding: 12px 20px;
      border-top: 1px solid #e1e5e9;
      background-color: #f8f9fa;
    }
  `]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() clickable: boolean = false;
  @Input() elevated: boolean = false;
  @Input() hasFooter: boolean = false;
} 