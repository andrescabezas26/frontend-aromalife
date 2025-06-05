import { Page, expect } from '@playwright/test';

export class CartPageObjects {
  constructor(private page: Page) {}

  // Cart Page Elements
  get cartItems() { return this.page.locator('[data-testid="cart-item"]'); }
  get cartItemNames() { return this.page.locator('[data-testid="cart-item-name"]'); }
  get cartItemPrices() { return this.page.locator('[data-testid="cart-item-price"]'); }
  get cartItemQuantities() { return this.page.locator('[data-testid="cart-item-quantity"]'); }
  get quantityIncreaseButtons() { return this.page.locator('[data-testid="quantity-increase"]'); }
  get quantityDecreaseButtons() { return this.page.locator('[data-testid="quantity-decrease"]'); }
  get removeItemButtons() { return this.page.locator('[data-testid="remove-item"]'); }
  
  // Cart Summary
  get subtotal() { return this.page.locator('[data-testid="cart-subtotal"]'); }
  get tax() { return this.page.locator('[data-testid="cart-tax"]'); }
  get shipping() { return this.page.locator('[data-testid="cart-shipping"]'); }
  get total() { return this.page.locator('[data-testid="cart-total"]'); }
  get itemCount() { return this.page.locator('[data-testid="cart-item-count"]'); }
  
  // Actions
  get checkoutButton() { return this.page.locator('[data-testid="checkout-button"]'); }
  get continueShoppingButton() { return this.page.locator('[data-testid="continue-shopping"]'); }
  get clearCartButton() { return this.page.locator('[data-testid="clear-cart"]'); }
  get applyPromoButton() { return this.page.locator('[data-testid="apply-promo"]'); }
  get promoCodeInput() { return this.page.locator('[data-testid="promo-code-input"]'); }
  
  // Empty Cart
  get emptyCartMessage() { return this.page.locator('[data-testid="empty-cart-message"]'); }
  get startShoppingButton() { return this.page.locator('[data-testid="start-shopping-button"]'); }

  // Checkout Elements
  get checkoutForm() { return this.page.locator('[data-testid="checkout-form"]'); }
  get shippingAddressInputs() { return this.page.locator('[data-testid^="shipping-"]'); }
  get billingAddressInputs() { return this.page.locator('[data-testid^="billing-"]'); }
  get paymentMethodSelect() { return this.page.locator('[data-testid="payment-method"]'); }
  get cardNumberInput() { return this.page.locator('[data-testid="card-number"]'); }
  get expiryDateInput() { return this.page.locator('[data-testid="expiry-date"]'); }
  get cvvInput() { return this.page.locator('[data-testid="cvv"]'); }
  get placeOrderButton() { return this.page.locator('[data-testid="place-order"]'); }
  
  // Order Confirmation
  get orderConfirmation() { return this.page.locator('[data-testid="order-confirmation"]'); }
  get orderNumber() { return this.page.locator('[data-testid="order-number"]'); }
  get orderSummary() { return this.page.locator('[data-testid="order-summary"]'); }

  async navigateToCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyCartIsEmpty() {
    await expect(this.emptyCartMessage).toBeVisible();
    await expect(this.startShoppingButton).toBeVisible();
  }

  async verifyCartHasItems(expectedCount: number) {
    await expect(this.cartItems).toHaveCount(expectedCount);
    await expect(this.itemCount).toContainText(expectedCount.toString());
  }

  async verifyCartItem(itemIndex: number, expectedData: {
    name?: string;
    price?: string;
    quantity?: number;
  }) {
    const item = this.cartItems.nth(itemIndex);
    await expect(item).toBeVisible();
    
    if (expectedData.name) {
      await expect(this.cartItemNames.nth(itemIndex)).toContainText(expectedData.name);
    }
    
    if (expectedData.price) {
      await expect(this.cartItemPrices.nth(itemIndex)).toContainText(expectedData.price);
    }
    
    if (expectedData.quantity) {
      await expect(this.cartItemQuantities.nth(itemIndex)).toHaveValue(expectedData.quantity.toString());
    }
  }

  async updateItemQuantity(itemIndex: number, newQuantity: number) {
    const currentQuantityInput = this.cartItemQuantities.nth(itemIndex);
    await currentQuantityInput.fill(newQuantity.toString());
    await currentQuantityInput.blur();
    await this.page.waitForLoadState('networkidle');
  }

  async increaseItemQuantity(itemIndex: number) {
    await this.quantityIncreaseButtons.nth(itemIndex).click();
    await this.page.waitForLoadState('networkidle');
  }

  async decreaseItemQuantity(itemIndex: number) {
    await this.quantityDecreaseButtons.nth(itemIndex).click();
    await this.page.waitForLoadState('networkidle');
  }

  async removeItem(itemIndex: number) {
    const initialCount = await this.cartItems.count();
    await this.removeItemButtons.nth(itemIndex).click();
    
    // Wait for confirmation dialog if exists
    const confirmButton = this.page.locator('[data-testid="confirm-remove"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    await this.page.waitForLoadState('networkidle');
    
    // Verify item was removed
    if (initialCount === 1) {
      await this.verifyCartIsEmpty();
    } else {
      await expect(this.cartItems).toHaveCount(initialCount - 1);
    }
  }

  async clearAllItems() {
    await this.clearCartButton.click();
    
    // Wait for confirmation dialog
    const confirmButton = this.page.locator('[data-testid="confirm-clear-cart"]');
    await confirmButton.click();
    
    await this.page.waitForLoadState('networkidle');
    await this.verifyCartIsEmpty();
  }

  async applyPromoCode(promoCode: string) {
    await this.promoCodeInput.fill(promoCode);
    await this.applyPromoButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyCartTotal(expectedTotal: string) {
    await expect(this.total).toContainText(expectedTotal);
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.checkoutForm).toBeVisible();
  }

  async fillShippingAddress(addressData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    await this.page.fill('[data-testid="shipping-first-name"]', addressData.firstName);
    await this.page.fill('[data-testid="shipping-last-name"]', addressData.lastName);
    await this.page.fill('[data-testid="shipping-address"]', addressData.address);
    await this.page.fill('[data-testid="shipping-city"]', addressData.city);
    await this.page.fill('[data-testid="shipping-state"]', addressData.state);
    await this.page.fill('[data-testid="shipping-zip"]', addressData.zipCode);
    await this.page.selectOption('[data-testid="shipping-country"]', addressData.country);
  }

  async fillPaymentInformation(paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) {
    await this.cardNumberInput.fill(paymentData.cardNumber);
    await this.expiryDateInput.fill(paymentData.expiryDate);
    await this.cvvInput.fill(paymentData.cvv);
    await this.page.fill('[data-testid="cardholder-name"]', paymentData.cardholderName);
  }

  async completeCheckout(shippingData: any, paymentData: any) {
    await this.fillShippingAddress(shippingData);
    await this.fillPaymentInformation(paymentData);
    
    await this.placeOrderButton.click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for order confirmation
    await expect(this.orderConfirmation).toBeVisible();
  }

  async verifyOrderConfirmation() {
    await expect(this.orderConfirmation).toBeVisible();
    await expect(this.orderNumber).toBeVisible();
    await expect(this.orderSummary).toBeVisible();
  }

  async getOrderNumber(): Promise<string> {
    const orderNumberText = await this.orderNumber.textContent();
    return orderNumberText?.replace(/[^0-9]/g, '') || '';
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.page.waitForURL('/home');
  }
}
