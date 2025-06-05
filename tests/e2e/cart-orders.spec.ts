import { test, expect } from '@playwright/test';
import { CartPageObjects } from '../page-objects/cart-page';
import { PersonalizationPageObjects } from '../page-objects/personalization-page';
import { TestHelpers, testData } from '../utils/test-helpers';

test.describe('Orders E2E Tests', () => {
  let cartPage: CartPageObjects;
  let personalizationPage: PersonalizationPageObjects;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPageObjects(page);
    personalizationPage = new PersonalizationPageObjects(page);
    helpers = new TestHelpers(page);
    
    // Clear session and login before each test
    await helpers.clearSession();
    await helpers.login();
  });

  test.describe('Cart Functionality', () => {
    test('should display empty cart initially', async ({page}) => {
        await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
        await page.getByText('Vela Floral MedianaVela').click();
    });

    test('should add candle to cart from personalization', async ({ page }) => {
      
        await page.goto('http://localhost:3000/mis-velas');
        await page.getByRole('button', { name: 'Agregar al Carrito' }).first().click();
        await page.getByRole('button', { name: 'Añadir al carrito' }).click();
    });

    test('should update item quantity', async ({ page }) => {
      // First, add an item to cart
      await page.goto('http://localhost:3000/cart')
      await page.getByTestId('add-quantity-button').first().click();
    });

    test('should remove item from cart', async ({ page }) => {
      // Add item to cart
      await page.goto('http://localhost:3000/cart')
      await page.getByTestId('remove-item-button').first().click();
    });

  });

});