import { Page, expect } from '@playwright/test';

export class PersonalizationPageObjects {
  constructor(private page: Page) {}

  // Common elements
  get continueButton() { return this.page.locator('[data-testid="continue-button"]'); }
  get backButton() { return this.page.locator('[data-testid="back-button"]'); }
  get progressIndicator() { return this.page.locator('[data-testid="progress-indicator"]'); }
  get stepTitle() { return this.page.locator('[data-testid="step-title"]'); }

  // Step 1: Main Option
  get mainOptionCards() { return this.page.locator('[data-testid="main-option-card"]'); }
  get selectedMainOption() { return this.page.locator('[data-testid="main-option-card"][data-selected="true"]'); }

  // Step 2: Place
  get placeCards() { return this.page.locator('[data-testid="place-card"]'); }
  get selectedPlace() { return this.page.locator('[data-testid="place-card"][data-selected="true"]'); }

  // Step 3: Intended Impact
  get impactCards() { return this.page.locator('[data-testid="impact-card"]'); }
  get selectedImpact() { return this.page.locator('[data-testid="impact-card"][data-selected="true"]'); }

  // Step 4: Container
  get containerCards() { return this.page.locator('[data-testid="container-card"]'); }
  get selectedContainer() { return this.page.locator('[data-testid="container-card"][data-selected="true"]'); }

  // Step 5: Fragrance
  get fragranceCards() { return this.page.locator('[data-testid="fragrance-card"]'); }
  get selectedFragrance() { return this.page.locator('[data-testid="fragrance-card"][data-selected="true"]'); }

  // Step 6: Label
  get labelCards() { return this.page.locator('[data-testid="label-card"]'); }
  get selectedLabel() { return this.page.locator('[data-testid="label-card"][data-selected="true"]'); }

  // Step 7: Message
  get messageInput() { return this.page.locator('[data-testid="message-input"]'); }
  get characterCount() { return this.page.locator('[data-testid="character-count"]'); }
  get audioUpload() { return this.page.locator('[data-testid="audio-upload"]'); }
  get audioPreview() { return this.page.locator('[data-testid="audio-preview"]'); }

  // Step 8: Name
  get candleNameInput() { return this.page.locator('[data-testid="candle-name-input"]'); }
  get nameValidationError() { return this.page.locator('[data-testid="name-validation-error"]'); }

  // Preview
  get candlePreview() { return this.page.locator('[data-testid="candle-preview"]'); }
  get editStepButtons() { return this.page.locator('[data-testid="edit-step-button"]'); }
  get addToCartButton() { return this.page.locator('[data-testid="add-to-cart-button"]'); }
  get saveForLaterButton() { return this.page.locator('[data-testid="save-for-later-button"]'); }
  get previewSummary() { return this.page.locator('[data-testid="preview-summary"]'); }

  async navigateToPersonalization() {
    await this.page.goto('/personalization/main-option');
    await this.page.waitForLoadState('networkidle');
  }

  async selectMainOption(optionIndex: number = 0) {
    const options = this.mainOptionCards;
    await options.nth(optionIndex).click();
    await expect(this.selectedMainOption).toBeVisible();
  }

  async selectPlace(placeIndex: number = 0) {
    const places = this.placeCards;
    await places.nth(placeIndex).click();
    await expect(this.selectedPlace).toBeVisible();
  }

  async selectIntendedImpact(impactIndex: number = 0) {
    const impacts = this.impactCards;
    await impacts.nth(impactIndex).click();
    await expect(this.selectedImpact).toBeVisible();
  }

  async selectContainer(containerIndex: number = 0) {
    const containers = this.containerCards;
    await containers.nth(containerIndex).click();
    await expect(this.selectedContainer).toBeVisible();
  }

  async selectFragrance(fragranceIndex: number = 0) {
    const fragrances = this.fragranceCards;
    await fragrances.nth(fragranceIndex).click();
    await expect(this.selectedFragrance).toBeVisible();
  }

  async selectLabel(labelIndex: number = 0) {
    const labels = this.labelCards;
    await labels.nth(labelIndex).click();
    await expect(this.selectedLabel).toBeVisible();
  }

  async enterMessage(message: string) {
    await this.messageInput.fill(message);
    await expect(this.characterCount).toContainText(message.length.toString());
  }

  async uploadAudio(filePath: string) {
    await this.audioUpload.setInputFiles(filePath);
    await expect(this.audioPreview).toBeVisible();
  }

  async enterCandleName(name: string) {
    await this.candleNameInput.fill(name);
  }

  async continueToNextStep() {
    await this.continueButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goBackToPreviousStep() {
    await this.backButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async completeFullPersonalization(candleData: {
    mainOption?: number;
    place?: number;
    impact?: number;
    container?: number;
    fragrance?: number;
    label?: number;
    message?: string;
    audioFile?: string;
    name?: string;
  }) {
    // Step 1: Main Option
    if (candleData.mainOption !== undefined) {
      await this.selectMainOption(candleData.mainOption);
    }
    await this.continueToNextStep();

    // Step 2: Place
    if (candleData.place !== undefined) {
      await this.selectPlace(candleData.place);
    }
    await this.continueToNextStep();

    // Step 3: Intended Impact
    if (candleData.impact !== undefined) {
      await this.selectIntendedImpact(candleData.impact);
    }
    await this.continueToNextStep();

    // Step 4: Container
    if (candleData.container !== undefined) {
      await this.selectContainer(candleData.container);
    }
    await this.continueToNextStep();

    // Step 5: Fragrance
    if (candleData.fragrance !== undefined) {
      await this.selectFragrance(candleData.fragrance);
    }
    await this.continueToNextStep();

    // Step 6: Label
    if (candleData.label !== undefined) {
      await this.selectLabel(candleData.label);
    }
    await this.continueToNextStep();

    // Step 7: Message
    if (candleData.message) {
      await this.enterMessage(candleData.message);
    }
    if (candleData.audioFile) {
      await this.uploadAudio(candleData.audioFile);
    }
    await this.continueToNextStep();

    // Step 8: Name
    if (candleData.name) {
      await this.enterCandleName(candleData.name);
    }
    await this.continueToNextStep();

    // Should now be at preview
    await expect(this.candlePreview).toBeVisible();
  }

  async verifyPreviewSummary(expectedData: any) {
    await expect(this.previewSummary).toBeVisible();
    // Verify specific elements in the summary
    if (expectedData.name) {
      await expect(this.previewSummary).toContainText(expectedData.name);
    }
    if (expectedData.message) {
      await expect(this.previewSummary).toContainText(expectedData.message);
    }
  }

  async editStep(stepNumber: number) {
    await this.editStepButtons.nth(stepNumber - 1).click();
    await this.page.waitForLoadState('networkidle');
  }

  async addToCart() {
    await this.addToCartButton.click();
    // Wait for success message or redirect
    await this.page.waitForLoadState('networkidle');
  }

  async saveForLater() {
    await this.saveForLaterButton.click();
    // Wait for success message or redirect
    await this.page.waitForLoadState('networkidle');
  }

  async verifyStepTitle(expectedTitle: string) {
    await expect(this.stepTitle).toContainText(expectedTitle);
  }

  async verifyProgressIndicator(currentStep: number, totalSteps: number = 8) {
    await expect(this.progressIndicator).toContainText(`${currentStep}/${totalSteps}`);
  }
}
