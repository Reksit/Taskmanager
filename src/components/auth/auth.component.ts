import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest, VerifyEmailRequest } from '../../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-card card">
          <div class="auth-header">
            <h1 class="auth-title">TaskManager Pro</h1>
            <p class="auth-subtitle"> </p>
          </div>

          <div class="auth-tabs">
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'login'"
              (click)="setMode('login')">
              Login
            </button>
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'register'"
              (click)="setMode('register')">
              Sign Up
            </button>
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'verify'"
              (click)="setMode('verify')"
              *ngIf="showVerifyTab">
              Verify Email
            </button>
          </div>

          <div class="auth-form-container">
            <!-- Login Form -->
            <div *ngIf="currentMode === 'login'" class="auth-form fade-in">
              <form (ngSubmit)="onLogin()" #loginForm="ngForm">
                <div class="form-group">
                  <label for="loginEmail">Email Address</label>
                  <input
                    type="email"
                    id="loginEmail"
                    class="form-control"
                    [(ngModel)]="loginData.email"
                    name="email"
                    required
                    email
                    placeholder="Enter your email"
                  />
                </div>

                <div class="form-group">
                  <label for="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    class="form-control"
                    [(ngModel)]="loginData.password"
                    name="password"
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!loginForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
            </div>

            <!-- Register Form -->
            <div *ngIf="currentMode === 'register'" class="auth-form fade-in">
              <form (ngSubmit)="onRegister()" #registerForm="ngForm">
                <div class="form-group">
                  <label for="registerUsername">Username</label>
                  <input
                    type="text"
                    id="registerUsername"
                    class="form-control"
                    [(ngModel)]="registerData.username"
                    name="username"
                    required
                    minlength="3"
                    placeholder="Choose a username"
                  />
                </div>

                <div class="form-group">
                  <label for="registerEmail">Email Address</label>
                  <input
                    type="email"
                    id="registerEmail"
                    class="form-control"
                    [(ngModel)]="registerData.email"
                    name="email"
                    required
                    email
                    placeholder="Enter your email"
                  />
                </div>

                <div class="form-group">
              <label for="registerPassword">Password</label>
              <input
              type="password"
              id="registerPassword"
              class="form-control"
              [(ngModel)]="registerData.password"
              name="password"
              required
              placeholder="Create a password"
              (input)="validatePassword()"
              />
              <div class="password-requirements" *ngIf="!isPasswordValid && registerData.password">
              <small class="password-hint text-danger">
                Password must contain at least 8 characters, 1 uppercase letter, and 1 symbol
              </small>
            </div>
            </div>


                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!registerForm.valid || !isPasswordValid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>
            </div>

            <!-- Email Verification Form -->
            <div *ngIf="currentMode === 'verify'" class="auth-form fade-in">
              <div class="verification-info">
                <div class="verification-icon">📧</div>
                <h3>Verify Your Email</h3>
                <p>We've sent a 4-digit verification code to:</p>
                <p class="email-highlight"><strong>{{ pendingEmail }}</strong></p>
                <p class="verification-note">Check your inbox and enter the code below to complete your registration.</p>
                <p class="verification-sender">📨 Sent from: taskmanagerai&#64;gmail.com</p>
              </div>

              <form (ngSubmit)="onVerifyEmail()" #verifyForm="ngForm">
                <div class="form-group">
                  <label for="verificationCode">Verification Code</label>
                  <input
                    type="text"
                    id="verificationCode"
                    class="form-control verification-input"
                    [(ngModel)]="verifyData.verificationCode"
                    name="verificationCode"
                    required
                    pattern="[0-9]{4}"
                    maxlength="4"
                    placeholder="Enter 4-digit code"
                    (input)="formatVerificationCode($event)"
                  />
                </div>

                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!verifyForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Verifying...' : 'Verify Email' }}
                </button>

                <div class="resend-section">
                  <p class="resend-text">Didn't receive the code?</p>
                  <button
                    type="button"
                    class="resend-btn"
                    (click)="resendCode()"
                    [disabled]="isResending || resendCooldown > 0"
                  >
                    <span *ngIf="isResending" class="spinner"></span>
                    {{ getResendButtonText() }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-wrapper {
      width: 100%;
      max-width: 450px;
    }

    .auth-card {
      padding: 40px;
      text-align: center;
    }

    .auth-header {
      margin-bottom: 30px;
    }

    .auth-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }

    .auth-subtitle {
      color: #666;
      font-size: 16px;
    }

    .auth-tabs {
      display: flex;
      margin-bottom: 30px;
      border-radius: 25px;
      overflow: hidden;
      border: 2px solid #e1e5e9;
    }

    .tab-button {
      flex: 1;

      padding: 12px 20px;
      border: none;
      background: white;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .tab-button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .verification-info {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-radius: 25px;
      border: 2px solid #e1e5e9;
    }

    .verification-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .verification-info h3 {
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 24px;
    }

    .verification-info p {
      color: #666;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .email-highlight {
      background: rgba(102, 126, 234, 0.1);
      padding: 8px 15px;
      border-radius: 15px;
      color: #667eea !important;
      font-weight: 600;
      margin: 10px 0;
    }

    .verification-note {
      font-size: 14px;
      font-style: italic;
      color: #555 !important;
    }

    .verification-sender {
      font-size: 12px;
      color: #999 !important;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .verification-input {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 8px;
      padding: 20px;
    }

    .resend-section {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e1e5e9;
    }

    .resend-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .resend-btn {
      background: none;
      border: none;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin: 0 auto;
    }

    .resend-btn:disabled {
      color: #999;
      cursor: not-allowed;
      text-decoration: none;
    }

    .auth-form-container {
      text-align: left;
    }

    .auth-form {
      animation: fadeIn 0.3s ease-in;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .auth-btn {
      width: 100%;
      padding: 15px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .password-requirements {
      margin-top: 8px;
    }

    .password-hint {
      color: #666;
      font-size: 12px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AuthComponent {
  currentMode: 'login' | 'register' | 'verify' = 'login';
  showVerifyTab = false;
  isLoading = false;
  isResending = false;
  isPasswordValid = false;
  errorMessage = '';
  pendingEmail = '';
  resendCooldown = 0;
  private resendTimer: any;

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };

  verifyData: VerifyEmailRequest = {
    email: '',
    verificationCode: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setMode(mode: 'login' | 'register' | 'verify'): void {
    this.currentMode = mode;
    this.errorMessage = '';
    this.resetForms();
  }

  resetForms(): void {
    this.loginData = { email: '', password: '' };
    this.registerData = { username: '', email: '', password: '' };
    this.verifyData = { email: '', verificationCode: '' };
  }

  validatePassword(): void {
    this.isPasswordValid = this.authService.validatePassword(this.registerData.password);
  }

  formatVerificationCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    this.verifyData.verificationCode = value;
    event.target.value = value;
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  onRegister(): void {
    if (!this.isPasswordValid) {
      this.errorMessage = 'Password does not meet requirements.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token === 'VERIFICATION_REQUIRED') {
          this.pendingEmail = this.registerData.email;
          this.verifyData.email = this.registerData.email;
          this.showVerifyTab = true;
          this.setMode('verify');
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  onVerifyEmail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Ensure email is set properly
    if (!this.verifyData.email) {
      this.verifyData.email = this.pendingEmail;
    }

    console.log('Verification request:', this.verifyData); // Debug log
    this.authService.verifyEmail(this.verifyData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Verification error:', error); // Debug log
        this.errorMessage = error.error?.message || 'Verification failed. Please try again.';
      }
    });
  }

  resendCode(): void {
    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendVerificationCode({ email: this.pendingEmail }).subscribe({
      next: () => {
        this.isResending = false;
        this.startResendCooldown();
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.error?.message || 'Failed to resend code. Please try again.';
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60; // 60 seconds cooldown
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  getResendButtonText(): string {
    if (this.isResending) {
      return 'Sending...';
    }
    if (this.resendCooldown > 0) {
      return `Resend in ${this.resendCooldown}s`;
    }
    return 'Resend Code';
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }
}