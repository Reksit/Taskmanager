import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="container">
          <div class="nav-content">
            <div class="nav-brand">TaskManager Pro</div>
            <div class="nav-links">
              <span class="welcome-text">Welcome, {{ currentUser?.username }}!</span>
              <button class="btn-secondary" (click)="logout()">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container">
        <div class="dashboard-header">
          <h1 class="dashboard-title">My Tasks</h1>
          <button class="btn-primary" (click)="navigateToCreateTask()">
            <i class="icon-plus"></i>
            Create New Task
          </button>
        </div>

        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-number">{{ totalTasks }}</div>
            <div class="stats-label">Total Tasks</div>
          </div>
          <div class="stats-card">
            <div class="stats-number pending-color">{{ pendingTasks.length }}</div>
            <div class="stats-label">Pending</div>
          </div>
          <div class="stats-card">
            <div class="stats-number completed-color">{{ completedTasks.length }}</div>
            <div class="stats-label">Completed</div>
          </div>
        </div>

        <div class="tasks-section">
          <div class="tasks-container">
            <div class="tasks-column">
              <div class="column-header">
                <h2 class="column-title">Pending Tasks</h2>
                <span class="task-count">{{ pendingTasks.length }}</span>
              </div>
              
              <div class="tasks-list">
                <div *ngIf="pendingTasks.length === 0" class="empty-state">
                  <p>No pending tasks. Create your first task!</p>
                </div>
                
                <div 
                  *ngFor="let task of pendingTasks" 
                  class="task-card fade-in"
                  [class.priority-high]="task.priority === 'HIGH'"
                  [class.priority-medium]="task.priority === 'MEDIUM'"
                  [class.priority-low]="task.priority === 'LOW'"
                >
                  <div class="task-header">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <span class="priority-badge" [class]="task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta">
                    <span class="task-date" *ngIf="task.dueDate">
                      Due: {{ task.dueDate | date:'short' }}
                    </span>
                    <span class="task-created">
                      Created: {{ task.createdAt | date:'short' }}
                    </span>
                  </div>
                  
                  <div class="task-actions">
                    <button 
                      class="btn-sm btn-success" 
                      (click)="markAsCompleted(task.id!)"
                      [disabled]="isLoading"
                    >
                      Mark Complete
                    </button>
                    <button 
                      class="btn-sm btn-danger" 
                      (click)="deleteTask(task.id!)"
                      [disabled]="isLoading"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="tasks-column">
              <div class="column-header">
                <h2 class="column-title">Completed Tasks</h2>
                <span class="task-count">{{ completedTasks.length }}</span>
              </div>
              
              <div class="tasks-list">
                <div *ngIf="completedTasks.length === 0" class="empty-state">
                  <p>No completed tasks yet.</p>
                </div>
                
                <div 
                  *ngFor="let task of completedTasks" 
                  class="task-card completed fade-in"
                  [class.priority-high]="task.priority === 'HIGH'"
                  [class.priority-medium]="task.priority === 'MEDIUM'"
                  [class.priority-low]="task.priority === 'LOW'"
                >
                  <div class="task-header">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <span class="priority-badge" [class]="task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta">
                    <span class="task-date" *ngIf="task.dueDate">
                      Due: {{ task.dueDate | date:'short' }}
                    </span>
                    <span class="task-completed">
                      Completed: {{ task.updatedAt | date:'short' }}
                    </span>
                  </div>
                  
                  <div class="task-actions">
                    <button 
                      class="btn-sm btn-warning" 
                      (click)="markAsPending(task.id!)"
                      [disabled]="isLoading"
                    >
                      Mark Pending
                    </button>
                    <button 
                      class="btn-sm btn-danger" 
                      (click)="deleteTask(task.id!)"
                      [disabled]="isLoading"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-text {
      color: #495057;
      font-weight: 500;
      margin-right: 20px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30px 0;
      padding: 0 20px;
    }

    .dashboard-title {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .pending-color {
      color: #ffc107 !important;
    }

    .completed-color {
      color: #28a745 !important;
    }

    .tasks-section {
      margin-top: 30px;
    }

    .tasks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .tasks-column {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    .column-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .task-count {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .tasks-list {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .tasks-list::-webkit-scrollbar {
      width: 6px;
    }

    .tasks-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }

    .tasks-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: white;
      opacity: 0.7;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .task-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
      flex: 1;
      margin-right: 10px;
    }

    .task-description {
      color: #666;
      margin: 10px 0;
      line-height: 1.5;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 15px 0;
      font-size: 12px;
      color: #999;
    }

    .task-date {
      color: #ffc107;
      font-weight: 500;
    }

    .task-created, .task-completed {
      color: #999;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    //button styles
    .create-task-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(145deg, #2f74f7, #2364d2); /* Beveled gradient */
  border: none;
  border-radius: 30px; /* Bevel round rectangle */
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.15),
    inset -2px -2px 4px rgba(0, 0, 0, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.15); /* 3D bevel + base shadow */
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-task-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.1),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05),
    0 6px 16px rgba(0, 0, 0, 0.25); /* Elevated shadow on hover */
  background: linear-gradient(145deg, #3b82f6, #2563eb); /* Slightly lighter bevel */
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}


    //end
    .icon-plus::before {
      content: '+';
      font-size: 18px;
      font-weight: bold;
      margin-right: 5px;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .tasks-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  pendingTasks: Task[] = [];
  completedTasks: Task[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
  }

  get totalTasks(): number {
    return this.pendingTasks.length + this.completedTasks.length;
  }

  loadTasks(): void {
    this.isLoading = true;
    
    this.taskService.getPendingTasks().subscribe({
      next: (tasks) => {
        this.pendingTasks = tasks;
        this.loadCompletedTasks();
      },
      error: (error) => {
        console.error('Error loading pending tasks:', error);
        this.isLoading = false;
      }
    });
  }

  loadCompletedTasks(): void {
    this.taskService.getCompletedTasks().subscribe({
      next: (tasks) => {
        this.completedTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading completed tasks:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }

  markAsCompleted(taskId: number): void {
    this.isLoading = true;
    
    this.taskService.markTaskAsCompleted(taskId).subscribe({
      next: (updatedTask) => {
        this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId);
        this.completedTasks.push(updatedTask);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error marking task as completed:', error);
        this.isLoading = false;
      }
    });
  }

  markAsPending(taskId: number): void {
    this.isLoading = true;
    
    this.taskService.markTaskAsPending(taskId).subscribe({
      next: (updatedTask) => {
        this.completedTasks = this.completedTasks.filter(task => task.id !== taskId);
        this.pendingTasks.push(updatedTask);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error marking task as pending:', error);
        this.isLoading = false;
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId);
          this.completedTasks = this.completedTasks.filter(task => task.id !== taskId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.isLoading = false;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}