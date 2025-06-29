import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User, ChangePasswordRequest } from '@microshell/shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.tokenSubject.next(response.access_token);
        }),
        switchMap(() => this.getCurrentUserInfo()),
        tap(user => {
          localStorage.setItem('current_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getCurrentUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`, {
      headers: this.getAuthHeaders()
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<User> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.tokenSubject.next(response.access_token);
      }),
      switchMap(() => this.getCurrentUserInfo()),
      tap(user => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, request, {
      headers: this.getAuthHeaders()
    });
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
} 