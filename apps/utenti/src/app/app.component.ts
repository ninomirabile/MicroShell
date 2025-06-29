import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService, AuthService } from '@microshell/services';
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '@microshell/shared';

@Component({
  selector: 'utenti-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // State
  isLoading = true;
  error = '';
  searchTerm = '';
  
  // Users data
  users: User[] = [];
  roles: UserRole[] = [];
  totalUsers = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Current user
  currentUserId: number | null = null;
  
  // Modal state
  showModal = false;
  modalMode: 'view' | 'create' | 'edit' = 'view';
  selectedUser: User | null = null;
  isSaving = false;
  
  // Form
  userForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadRoles();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCurrentUser(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role_id: ['', [Validators.required]],
      is_active: [true]
    });
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    this.userService.getUsers(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.items;
          this.totalUsers = response.total;
          this.totalPages = response.pages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.error = 'Failed to load users';
          this.isLoading = false;
        }
      });
  }

  private loadRoles(): void {
    this.userService.getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
        }
      });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  // Modal operations
  openCreateUserModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.userForm = this.createUserForm();
    this.showModal = true;
  }

  viewUser(user: User): void {
    this.modalMode = 'view';
    this.selectedUser = user;
    this.showModal = true;
  }

  editUser(user: User): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.userForm = this.createUserForm();
    
    // Remove password requirement for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    // Populate form with user data
    this.userForm.patchValue({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role.id,
      is_active: user.is_active
    });
    
    this.showModal = true;
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.userService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
            alert('User deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
          }
        });
    }
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isSaving = true;
      
      if (this.modalMode === 'create') {
        const createRequest: CreateUserRequest = {
          username: this.userForm.value.username,
          full_name: this.userForm.value.full_name,
          email: this.userForm.value.email,
          password: this.userForm.value.password,
          role_id: parseInt(this.userForm.value.role_id)
        };
        
        this.userService.createUser(createRequest)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSaving = false;
              this.closeModal();
              this.loadUsers();
              alert('User created successfully');
            },
            error: (error) => {
              this.isSaving = false;
              console.error('Error creating user:', error);
              alert('Failed to create user. Please try again.');
            }
          });
      } else if (this.modalMode === 'edit' && this.selectedUser) {
        const updateRequest: UpdateUserRequest = {
          username: this.userForm.value.username,
          full_name: this.userForm.value.full_name,
          email: this.userForm.value.email,
          role_id: parseInt(this.userForm.value.role_id),
          is_active: this.userForm.value.is_active
        };
        
        this.userService.updateUser(this.selectedUser.id, updateRequest)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSaving = false;
              this.closeModal();
              this.loadUsers();
              alert('User updated successfully');
            },
            error: (error) => {
              this.isSaving = false;
              console.error('Error updating user:', error);
              alert('Failed to update user. Please try again.');
            }
          });
      }
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.modalMode = 'view';
    this.isSaving = false;
    this.userForm.reset();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
