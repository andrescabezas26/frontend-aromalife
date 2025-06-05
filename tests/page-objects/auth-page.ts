import { Page, expect } from '@playwright/test';

export class AuthPageObjects {
  constructor(private page: Page) {}

  // Login Page
  get loginEmailInput() { return this.page.locator('[data-testid="email-input"]'); }
  get loginPasswordInput() { return this.page.locator('[data-testid="password-input"]'); }
  get loginButton() { return this.page.locator('[data-testid="login-button"]'); }
  get forgotPasswordLink() { return this.page.locator('[data-testid="forgot-password-link"]'); }
  get registerLink() { return this.page.locator('[data-testid="register-link"]'); }
  get loginErrorMessage() { return this.page.locator('[data-testid="login-error"]'); }

  // Register Page
  get registerFirstNameInput() { return this.page.locator('[data-testid="first-name-input"]'); }
  get registerLastNameInput() { return this.page.locator('[data-testid="last-name-input"]'); }
  get registerEmailInput() { return this.page.locator('[data-testid="register-email-input"]'); }
  get registerPasswordInput() { return this.page.locator('[data-testid="register-password-input"]'); }
  get registerConfirmPasswordInput() { return this.page.locator('[data-testid="confirm-password-input"]'); }
  get registerPhoneInput() { return this.page.locator('[data-testid="phone-input"]'); }
  get registerButton() { return this.page.locator('[data-testid="register-button"]'); }
  get loginLinkFromRegister() { return this.page.locator('[data-testid="login-link"]'); }
  get registerErrorMessage() { return this.page.locator('[data-testid="register-error"]'); }

  // Validation Messages
  get emailValidationError() { return this.page.locator('[data-testid="email-validation-error"]'); }
  get passwordValidationError() { return this.page.locator('[data-testid="password-validation-error"]'); }
  get nameValidationError() { return this.page.locator('[data-testid="name-validation-error"]'); }
  get phoneValidationError() { return this.page.locator('[data-testid="phone-validation-error"]'); }

  async navigateToLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToRegister() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async fillLoginForm(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
  }

  async fillRegisterForm(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  }) {
    await this.registerFirstNameInput.fill(userData.firstName);
    await this.registerLastNameInput.fill(userData.lastName);
    await this.registerEmailInput.fill(userData.email);
    await this.registerPasswordInput.fill(userData.password);
    await this.registerConfirmPasswordInput.fill(userData.confirmPassword);
    await this.registerPhoneInput.fill(userData.phone);
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  async submitRegister() {
    await this.registerButton.click();
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL('/home');
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async verifyRegisterSuccess() {
    await this.page.waitForURL('/login');
    // Could also check for success message
  }

  async verifyValidationError(field: 'email' | 'password' | 'name' | 'phone', expectedMessage: string) {
    let errorLocator;
    switch (field) {
      case 'email':
        errorLocator = this.emailValidationError;
        break;
      case 'password':
        errorLocator = this.passwordValidationError;
        break;
      case 'name':
        errorLocator = this.nameValidationError;
        break;
      case 'phone':
        errorLocator = this.phoneValidationError;
        break;
    }
    
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(expectedMessage);
  }
}
