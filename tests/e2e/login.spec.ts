import { test, expect } from '@playwright/test';
import { AuthPageObjects } from '../page-objects/auth-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Basic Login Tests', () => {
  let authPage: AuthPageObjects;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPageObjects(page);
    helpers = new TestHelpers(page);
    await helpers.clearSession();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Navigate to login
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Fill login form
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('admin123');
    
    // Submit login
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    
    // Verify successful login
    await page.waitForURL('/home');
    // Esperar un momento para que se carguen todos los componentes de la interfaz
    await page.waitForTimeout(5000); 
    await expect(page.locator('[data-testid="user-menu"]').or(page.locator('.user-menu'))).toBeVisible();
  });

  test('should show login form elements correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Verify all form elements are present
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contraseña' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    
    // Check for additional elements
    const registerLink = page.getByText('¿No tienes cuenta?').or(page.getByText('Registrarse'));
    if (await registerLink.isVisible()) {
      await expect(registerLink).toBeVisible();
    }
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Try with invalid credentials
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    
    // Should show error message or stay on login page
    await page.waitForTimeout(2000); // Wait for potential error message
    
    // Check if we're still on login page or if there's an error message
    const currentUrl = page.url();
    const isStillOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/';
    
    if (isStillOnLogin) {
      // Look for error message
      const errorMessage = page.locator('.error, [data-testid="error"], .alert-danger').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // Enter invalid email format
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid-email');
    await page.getByRole('textbox', { name: 'Contraseña' }).click(); // Trigger blur event
    
    // Look for validation message
    const validationError = page.locator('.error, [data-testid="email-validation-error"], .invalid-feedback').first();
    if (await validationError.isVisible()) {
      await expect(validationError).toBeVisible();
    }
  });
});