import { test, expect } from '@playwright/test';
import { PersonalizationPageObjects } from '../page-objects/personalization-page';
import { AuthPageObjects } from '../page-objects/auth-page';
import { TestHelpers, testData } from '../utils/test-helpers';

test.describe('Candle Personalization E2E Tests', () => {
  let personalizationPage: PersonalizationPageObjects;
  let authPage: AuthPageObjects;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    personalizationPage = new PersonalizationPageObjects(page);
    authPage = new AuthPageObjects(page);
    helpers = new TestHelpers(page);
    
    // Navigate to a page first to enable localStorage access
    await page.goto('/');
    
    // Clear session and login before each test
    await helpers.clearSession();
    await helpers.login();
  });

  test.describe('Complete Personalization Flow', () => {
    test('should complete full 8-step personalization process', async ({ page }) => {
        test.setTimeout(120000); // Increase timeout for this test

        await page.getByRole('button', { name: 'Comenzar Personalización' }).click();
        await page.getByTestId('start-personalization').click();
        await page.getByText('😊¿Cómo te quieres sentir?').click();
        await page.getByRole('button', { name: 'Continuar' }).click();
        //esperar un momento para que se carguen todos los componentes de la interfaz
        await page.waitForTimeout(5000);
        await page.getByText('🌿').click();
        await page.getByRole('button', { name: 'Continuar' }).click();
        await page.locator('.p-6 > .flex-1').first().click();
        await page.getByRole('button', { name: 'Siguiente: Fragancia' }).click();
        await page.getByRole('heading', { name: 'Calma Profunda' }).click();
        await page.getByRole('button', { name: 'Siguiente: Imagen de etiqueta' }).click();
        await page.getByRole('img', { name: 'Vintage Clásico' }).click();
        await page.getByRole('button', { name: 'Siguiente: Mensaje' }).click();
        await page.getByRole('textbox', { name: 'Mensaje inspirador en primera' }).click();
        await page.getByRole('textbox', { name: 'Mensaje inspirador en primera' }).fill('Prueba test');
        await page.getByRole('button', { name: 'Siguiente: Audio' }).click();
        
        await page.getByRole('textbox', { name: 'Buscar canciones en Spotify...' }).click();

        await page.waitForTimeout(2000); // Wait for search to load
        await page.getByRole('textbox', { name: 'Buscar canciones en Spotify...' }).fill('casa');

        await page.waitForTimeout(5000);
        await page.getByLabel('Spotify').getByRole('button').filter({ hasText: /^$/ }).click();
        await page.locator('.p-3').first().click();
        await page.getByRole('button', { name: '✓ Seleccionar esta canción' }).click();

        await page.waitForTimeout(5000);
        await page.getByRole('button', { name: 'Siguiente: Nombre' }).click();
        await page.getByRole('textbox', { name: '¿Cómo quieres llamar a tu' }).click();
        await page.getByRole('textbox', { name: '¿Cómo quieres llamar a tu' }).fill('test');
        await page.getByRole('button', { name: 'Siguiente: Vela' }).click();
        await page.getByRole('button', { name: 'Crear mi vela' }).click();

        
    });

    test('should start personalization and navigate to first step', async ({ page }) => {   
        await page.goto('http://localhost:3000/personalization/welcome');
        await page.getByRole('button', { name: 'Comenzar Personalización' }).click();
        
        // Verify we are on the first step
        await expect(page.getByText('😊¿Cómo te quieres sentir?')).toBeVisible();
    });
  });

});