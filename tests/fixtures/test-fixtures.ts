import { test as baseTest, expect } from '@playwright/test';
import { AuthPageObjects } from '../page-objects/auth-page';
import { PersonalizationPageObjects } from '../page-objects/personalization-page';
import { CartPageObjects } from '../page-objects/cart-page';
import { TestHelpers } from '../utils/test-helpers';

// Extend the base test with our page objects and helpers
export const test = baseTest.extend<{
  authPage: AuthPageObjects;
  personalizationPage: PersonalizationPageObjects;
  cartPage: CartPageObjects;
  helpers: TestHelpers;
}>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPageObjects(page);
    await use(authPage);
  },
  
  personalizationPage: async ({ page }, use) => {
    const personalizationPage = new PersonalizationPageObjects(page);
    await use(personalizationPage);
  },
  
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPageObjects(page);
    await use(cartPage);
  },
  
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },
});

// Re-export expect for convenience
export { expect };

// Global setup for authenticated tests
export const authenticatedTest = test.extend({
  page: async ({ page, helpers }, use) => {
    // Clear session and login before each authenticated test
    await helpers.clearSession();
    await helpers.login();
    await use(page);
  },
});

// Test data fixtures
export const testFixtures = {
  validUser: {
    email: 'test@aromalife.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
  },
  
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
  },
  
  testCandles: [
    {
      name: 'Relaxation Candle',
      mainOption: 0,
      place: 0,
      impact: 0,
      container: 0,
      fragrance: 0,
      label: 0,
      message: 'A candle for relaxation and peace',
    },
    {
      name: 'Energy Boost Candle',
      mainOption: 1,
      place: 1,
      impact: 1,
      container: 1,
      fragrance: 1,
      label: 1,
      message: 'A candle to boost your energy and motivation',
    },
    {
      name: 'Focus Candle',
      mainOption: 2,
      place: 2,
      impact: 2,
      container: 2,
      fragrance: 2,
      label: 2,
      message: 'A candle to enhance focus and concentration',
    },
  ],
  
  shippingAddresses: [
    {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
    },
  ],
  
  paymentMethods: [
    {
      cardNumber: '4111111111111111', // Test Visa
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'John Doe',
    },
    {
      cardNumber: '5555555555554444', // Test Mastercard
      expiryDate: '12/26',
      cvv: '456',
      cardholderName: 'Jane Smith',
    },
  ],
  
  promoCodes: [
    {
      code: 'DISCOUNT10',
      type: 'percentage',
      value: 10,
      description: '10% off entire order',
    },
    {
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      description: '20% off for new customers',
    },
    {
      code: 'FREESHIP',
      type: 'shipping',
      value: 0,
      description: 'Free shipping',
    },
  ],
};
