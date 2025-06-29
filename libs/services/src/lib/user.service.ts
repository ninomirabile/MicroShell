import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@microshell/shared';
import { AuthService } from './auth.service';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8000/api/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(page: number = 1, size: number = 10, search?: string): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.API_URL, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, user, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.API_URL}/roles`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 