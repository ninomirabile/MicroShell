import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@microshell/services';
import { User } from '@microshell/shared';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MicroShell';
  
  // Authentication state
  isAuthenticated = false;
  currentUser: User | null = null;
  
  // Login form
  loginForm: FormGroup;
  isLoggingIn = false;
  loginError = '';
  
  // Loading state
  isLoading = false;
  loadingMessage = '';
  
  private destroy$ = new Subject<void>();

  // Inject dependencies using the new Angular 20+ syntax
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.initializeAuth();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAuth(): void {
    // Subscribe to authentication state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentUser => {
        this.currentUser = currentUser;
        this.isAuthenticated = !!currentUser;
        
        if (this.isAuthenticated && this.router.url === '/') {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      this.loginError = '';
      
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoggingIn = false;
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoggingIn = false;
            this.loginError = error.error?.detail || 'Login failed. Please try again.';
            console.error('Login error:', error);
          }
        });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Utility methods for loading states
  showLoading(message = 'Loading...'): void {
    this.isLoading = true;
    this.loadingMessage = message;
  }

  hideLoading(): void {
    this.isLoading = false;
    this.loadingMessage = '';
  }
}
