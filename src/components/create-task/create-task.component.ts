import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CreateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="create-task-container">
  <nav class="navbar">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">TaskManager Pro</div>
        <div class="nav-links">
          <button class="btn btn-outline-primary back-btn" (click)="goBack()">
            <span class="icon">←</span> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </nav>


      <div class="container">
        <div class="create-task-wrapper">
          <div class="create-task-card card">
            <div class="card-header">
              <h1 class="card-title">Create New Task</h1>
              <p class="card-subtitle">Fill in the details to create a new task</p>
            </div>

            <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="task-form">
              <div class="form-group">
                <label for="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  class="form-control"
                  [(ngModel)]="taskData.title"
                  name="title"
                  required
                  maxlength="100"
                  placeholder="Enter task title"
                />
                <div class="field-hint">
                  {{ taskData.title.length }}/100 characters
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description *</label>
                <textarea
                  id="description"
                  class="form-control"
                  [(ngModel)]="taskData.description"
                  name="description"
                  required
                  rows="4"
                  maxlength="500"
                  placeholder="Describe your task in detail"
                ></textarea>
                <div class="field-hint">
                  {{ taskData.description.length }}/500 characters
                </div>
              </div>

              <div class="form-group">
                <label for="priority">Priority *</label>
                <select
                  id="priority"
                  class="form-control"
                  [(ngModel)]="taskData.priority"
                  name="priority"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>

              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  class="form-control"
                  [(ngModel)]="dueDateString"
                  name="dueDate"
                  [min]="minDate"
                />
               
              </div>

              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <div *ngIf="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="goBack()"
                  [disabled]="isLoading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  [disabled]="!taskForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creating...' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-task-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .back-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #007bff;
  color: #fff;
}

.back-btn .icon {
  margin-right: 6px;
  font-weight: bold;
}


    .create-task-wrapper {
      padding: 30px 0;
      display: flex;
      justify-content: center;
    }

    .create-task-card {
      width: 100%;
      max-width: 600px;
      padding: 40px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      padding: 12px 15px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      resize: vertical;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control select {
      cursor: pointer;
    }

    .field-hint {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-actions button {
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .form-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0b27a7ff 0%, #6b00bdff 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .error-message {
      color: #dc3545;
      font-size: 14px;
      padding: 10px 15px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
    }

    .success-message {
      color: #155724;
      font-size: 14px;
      padding: 10px 15px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
    }

    textarea.form-control {
      min-height: 100px;
    }

    @media (max-width: 768px) {
      .create-task-card {
        padding: 20px;
        margin: 0 15px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class CreateTaskComponent {
  taskData: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'MEDIUM'
  };

  dueDateString = '';
  minDate = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {
    this.setMinDate();
  }

  private setMinDate(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minDate = now.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert date string to Date object if provided
    if (this.dueDateString) {
      this.taskData.dueDate = new Date(this.dueDateString);
    }

    this.taskService.createTask(this.taskData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
        
        // Navigate back to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create task. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}