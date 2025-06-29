import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'lib-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="onClick($event)">
      
      <span *ngIf="loading" class="loading-spinner"></span>
      <ng-content *ngIf="!loading"></ng-content>
      <span *ngIf="loading">{{ loadingText }}</span>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: 1px solid transparent;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
      position: relative;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Sizes */
    .btn-small {
      padding: 4px 8px;
      font-size: 12px;
    }
    
    .btn-medium {
      padding: 8px 16px;
      font-size: 14px;
    }
    
    .btn-large {
      padding: 12px 24px;
      font-size: 16px;
    }
    
    /* Variants */
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      border-color: #0056b3;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
      border-color: #545b62;
    }
    
    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
      color: white;
    }
    
    .btn-success:hover:not(:disabled) {
      background-color: #1e7e34;
      border-color: #1e7e34;
    }
    
    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background-color: #bd2130;
      border-color: #bd2130;
    }
    
    .btn-warning {
      background-color: #ffc107;
      border-color: #ffc107;
      color: #212529;
    }
    
    .btn-warning:hover:not(:disabled) {
      background-color: #e0a800;
      border-color: #e0a800;
    }
    
    .btn-info {
      background-color: #17a2b8;
      border-color: #17a2b8;
      color: white;
    }
    
    .btn-info:hover:not(:disabled) {
      background-color: #117a8b;
      border-color: #117a8b;
    }
    
    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() loadingText: string = 'Loading...';
  
  @Output() clicked = new EventEmitter<Event>();
  
  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
  
  getButtonClasses(): string {
    return `btn btn-${this.variant} btn-${this.size}`;
  }
} 