import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@microshell/services';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
}

@Component({
  selector: 'app-utenti',
  template: `
    <div class="utenti-container">
      <h1>👥 Gestione Utenti</h1>
      
      <div class="actions-bar">
        <button class="btn btn-primary" (click)="showAddUserForm = !showAddUserForm">
          ➕ Aggiungi Utente
        </button>
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Cerca utenti..." 
            [(ngModel)]="searchTerm"
            (input)="filterUsers()"
            class="search-input">
        </div>
      </div>
      
      <div class="add-user-form" *ngIf="showAddUserForm">
        <h3>Nuovo Utente</h3>
        <form [formGroup]="userForm" (ngSubmit)="addUser()">
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" class="form-control">
            </div>
            <div class="form-group">
              <label>Username</label>
              <input type="text" formControlName="username" class="form-control">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" formControlName="fullName" class="form-control">
            </div>
            <div class="form-group">
              <label>Ruolo</label>
              <select formControlName="role" class="form-control">
                <option value="user">Utente</option>
                <option value="admin">Amministratore</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-success" [disabled]="userForm.invalid">
              Salva
            </button>
            <button type="button" class="btn btn-secondary" (click)="showAddUserForm = false">
              Annulla
            </button>
          </div>
        </form>
      </div>
      
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Nome</th>
              <th>Ruolo</th>
              <th>Stato</th>
              <th>Ultimo Login</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>{{ user.email }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.fullName }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="user.isActive ? 'status-active' : 'status-inactive'">
                  {{ user.isActive ? 'Attivo' : 'Inattivo' }}
                </span>
              </td>
              <td>{{ user.lastLogin | date:'medium' || 'Mai' }}</td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="editUser(user)">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger" (click)="deleteUser(user.id)">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <lib-loading *ngIf="loading" message="Caricamento utenti..."></lib-loading>
    </div>
  `,
  styles: [`
    .utenti-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .search-box {
      flex: 1;
      max-width: 300px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    
    .add-user-form {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .add-user-form h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      font-weight: 500;
      margin-bottom: 5px;
      color: #555;
    }
    
    .form-control {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .users-table {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
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
    
    .role-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .role-admin {
      background: #e74c3c;
      color: white;
    }
    
    .role-manager {
      background: #f39c12;
      color: white;
    }
    
    .role-user {
      background: #3498db;
      color: white;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-active {
      background: #27ae60;
      color: white;
    }
    
    .status-inactive {
      background: #95a5a6;
      color: white;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-success {
      background: #27ae60;
      color: white;
    }
    
    .btn-warning {
      background: #f39c12;
      color: white;
    }
    
    .btn-danger {
      background: #e74c3c;
      color: white;
    }
    
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
    
    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      margin-right: 5px;
    }
    
    .btn:hover {
      opacity: 0.8;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .actions-bar {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-box {
        max-width: none;
      }
      
      table {
        font-size: 12px;
      }
      
      th, td {
        padding: 8px;
      }
    }
  `]
})
export class UtentiComponent implements OnInit {
  loading = true;
  showAddUserForm = false;
  searchTerm = '';
  userForm: FormGroup;
  users: User[] = [];
  filteredUsers: User[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    // Simulate API call
    setTimeout(() => {
      this.users = [
        {
          id: 1,
          email: 'admin@microshell.com',
          username: 'admin',
          fullName: 'Administrator',
          role: 'admin',
          isActive: true,
          lastLogin: new Date()
        },
        {
          id: 2,
          email: 'marco.rossi@example.com',
          username: 'mrossi',
          fullName: 'Marco Rossi',
          role: 'manager',
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 3,
          email: 'laura.bianchi@example.com',
          username: 'lbianchi',
          fullName: 'Laura Bianchi',
          role: 'user',
          isActive: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          email: 'giuseppe.verdi@example.com',
          username: 'gverdi',
          fullName: 'Giuseppe Verdi',
          role: 'user',
          isActive: false,
          lastLogin: null
        }
      ];
      this.filteredUsers = [...this.users];
      this.loading = false;
    }, 1200);
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.fullName.toLowerCase().includes(term)
      );
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      admin: 'Amministratore',
      manager: 'Manager',
      user: 'Utente'
    };
    return labels[role] || role;
  }

  addUser() {
    if (this.userForm.valid) {
      const newUser: User = {
        id: this.users.length + 1,
        ...this.userForm.value,
        isActive: true,
        lastLogin: null
      };
      
      this.users.push(newUser);
      this.filterUsers();
      this.userForm.reset({ role: 'user' });
      this.showAddUserForm = false;
    }
  }

  editUser(user: User) {
    alert(`Edit user: ${user.fullName}\n(Funzionalità in sviluppo)`);
  }

  deleteUser(userId: number) {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.filterUsers();
    }
  }
} 