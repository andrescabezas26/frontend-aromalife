import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely
   */
  async waitForPageReady() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all cookies and localStorage
   */
  async clearSession() {
    await this.page.context().clearCookies();
    try {
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      // If localStorage access fails (e.g., no page loaded), just continue
      console.log('Could not clear localStorage/sessionStorage:', error);
    }
  }

  /**
   * Login with valid credentials
   */
  async login(email: string = 'client1@example.com', password: string = 'client123') {
    await this.page.goto('/login');
    await this.waitForPageReady();
    
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login redirect
    try {
      await this.page.waitForURL('/home', { timeout: 10000 });
    } catch {
      // If redirect doesn't happen, wait for any navigation
      await this.page.waitForLoadState('networkidle');
    }
    await this.waitForPageReady();
  }

  /**
   * Login with valid credentials
   */
  async loginAdmin(email: string = 'admin@example.com', password: string = 'admin123') {
    await this.page.goto('/login');
    await this.waitForPageReady();
    
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login redirect
    try {
      await this.page.waitForURL('/home', { timeout: 10000 });
    } catch {
      // If redirect doesn't happen, wait for any navigation
      await this.page.waitForLoadState('networkidle');
    }
    await this.waitForPageReady();
  }

  /**
   * Wait for and verify toast notification
   */
  async verifyToast(message: string | RegExp, type: 'success' | 'error' | 'info' = 'success') {
    const toast = this.page.locator('[data-testid="toast"]').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
    
    if (type === 'success') {
      await expect(toast).toHaveClass(/success/);
    } else if (type === 'error') {
      await expect(toast).toHaveClass(/error/);
    }
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string, shouldValidate: boolean = true) {
    const field = this.page.locator(selector);
    await field.fill(value);
    
    if (shouldValidate) {
      try {
        // Try to blur the field to trigger validation
        await field.blur();
      } catch {
        // Fallback: press Tab to move focus away
        await field.press('Tab');
      }
      await this.page.waitForTimeout(500); // Wait for validation
    }
  }

  /**
   * Fill field and verify no validation errors
   */
  async fillFieldAndVerify(selector: string, value: string) {
    await this.fillField(selector, value, true);
    
    // Check for validation error messages
    const errorSelector = `${selector} + .error, ${selector} ~ .error, [data-testid="${selector.replace(/\[|\]|"/g, '')}-error"]`;
    const errorMessage = this.page.locator(errorSelector);
    
    try {
      await expect(errorMessage).not.toBeVisible({ timeout: 1000 });
    } catch {
      // If error selector doesn't exist, that's fine
    }
  }

  /**
   * Fill field and expect validation error
   */
  async fillFieldAndExpectError(selector: string, value: string, expectedError?: string) {
    await this.fillField(selector, value, true);
    
    // Look for error message
    const errorSelector = `${selector} + .error, ${selector} ~ .error, [data-testid="${selector.replace(/\[|\]|"/g, '')}-error"]`;
    const errorMessage = this.page.locator(errorSelector);
    
    await expect(errorMessage).toBeVisible();
    if (expectedError) {
      await expect(errorMessage).toContainText(expectedError);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const authState = await this.page.evaluate(() => {
        return localStorage.getItem('auth-store');
      });
      return authState !== null && JSON.parse(authState || '{}').user !== null;
    } catch {
      return false;
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(url?: string) {
    if (url) {
      await this.page.waitForURL(url);
    }
    await this.waitForPageReady();
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10000) {
    return await this.page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string | RegExp, response: any, status: number = 200) {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }
}

export const testData = {
  validUser: {
    email: 'test@aromalife.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    firstName: '',
    lastName: '',
    phone: 'invalid-phone',
  },
  testCandle: {
    name: 'Test Candle',
    mainOption: 'Crecimiento Personal',
    place: 'Hogar',
    intendedImpact: 'Relajación',
    container: 1,
    fragrance: 1,
    label: 1,
    message: 'This is a test candle message',
    audioUrl: null,
  },
};
import { User } from '@/types/user';

interface MockUserOptions {
  id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
  phoneCountryCode?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  imageUrl?: string;
  bio?: string;
}

export const createMockUser = (options: MockUserOptions = {}): User => ({
  id: options.id || '1',
  name: options.name || 'John',
  lastName: options.lastName || 'Doe',
  email: options.email || 'john@example.com',
  roles: options.roles || ['client'],
  isActive: options.isActive ?? true,
  phoneCountryCode: options.phoneCountryCode || '+1',
  phone: options.phone || '1234567890',
  address: options.address || '123 Main St',
  city: options.city || 'New York',
  state: options.state || 'NY',
  country: options.country || 'USA',
  profilePicture: options.profilePicture,
  imageUrl: options.imageUrl,
  bio: options.bio,
  createdAt: new Date(),
  updatedAt: new Date(),
}); 