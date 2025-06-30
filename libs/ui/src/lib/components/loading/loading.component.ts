import { Component, Input } from '@angular/core';


@Component({
  selector: 'lib-loading',
  standalone: true,
  imports: [],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        @if (message) {
          <p class="loading-message">{{ message }}</p>
        }
      </div>
    </div>
    `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    }
    
    .loading-spinner {
      text-align: center;
    }
    
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-message {
      margin-top: 16px;
      color: #666;
      font-size: 14px;
    }
    
    .overlay .loading-message {
      color: white;
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
} 