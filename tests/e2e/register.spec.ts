import { test, expect } from '@playwright/test';
import { AuthPageObjects } from '../page-objects/auth-page';
import { TestHelpers, testData } from '../utils/test-helpers';

test.describe('Registration E2E Tests', () => {
  let authPage: AuthPageObjects;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPageObjects(page);
    helpers = new TestHelpers(page);
    await helpers.clearSession();
  });

  test.describe('Registration', () => {

    test('should show confirmation in register', async ({page}) => {
      await page.goto('http://localhost:3000/');
      await page.getByRole('button', { name: 'Registrarse' }).click();
      await page.getByTestId('first-name-input').click();
      await page.getByTestId('first-name-input').fill('Test');
      await page.getByTestId('first-name-input').press('Tab');
      await page.getByTestId('last-name-input').fill('test');
      await page.getByTestId('last-name-input').press('Tab');

      const uniqueTestEmail = 'test${Date.now()}@email.com';

      await page.getByTestId('register-email-input').fill(uniqueTestEmail);
      await page.getByTestId('register-password-input').click();
      await page.getByTestId('register-password-input').fill('#Test123');
      await page.locator('div').filter({ hasText: /^Código PaísCódigo$/ }).locator('svg').click();
      await page.getByRole('option', { name: 'Colombia (+57)' }).click();
      await page.getByTestId('phone-input').click();
      await page.getByTestId('phone-input').fill('3227075439');
      await page.locator('div').filter({ hasText: /^PaísSelecciona tu país$/ }).locator('svg').click();
      await page.getByRole('option', { name: 'Colombia' }).click();
      await page.locator('div').filter({ hasText: /^Estado\/ProvinciaSelecciona tu estado$/ }).locator('svg').click();
      await page.getByRole('option', { name: 'Valle del Cauca' }).click();
      await page.locator('div').filter({ hasText: /^CiudadSelecciona tu ciudad$/ }).locator('svg').click();
      await page.getByRole('option', { name: 'Toro' }).click();
      await page.getByRole('textbox', { name: 'Dirección' }).click();
      await page.getByRole('textbox', { name: 'Dirección' }).fill('Aqui test');
      await page.getByTestId('register-button').click();
    });

    // test de registro con datos invalidos
    test('should show validation errors on invalid registration', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.getByRole('button', { name: 'Registrarse' }).click();
      // Submit the form
      await page.getByTestId('register-button').click();

      // Check for validation error messages
      await expect(page.getByTestId('name-validation-error')).toBeVisible();
      await expect(page.getByTestId('email-validation-error')).toBeVisible();
      await expect(page.getByTestId('password-validation-error')).toBeVisible();
      await expect(page.getByTestId('phone-validation-error')).toBeVisible();
    });


    
  });

});