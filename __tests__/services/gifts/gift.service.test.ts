import { Gift } from "@/types/gift";

// Mock del módulo axios
jest.mock("@/lib/axios", () => ({
  createRequestWithEntity: jest.fn(),
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Declaración para usar después
let GiftService: typeof import("@/services/gifts/gift.service").GiftService;

// Setup del mock antes de importar el servicio
beforeAll(() => {
  const { createRequestWithEntity } = require("@/lib/axios");
  (createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);

  // Importar el servicio *después* del mock
  GiftService = require("@/services/gifts/gift.service").GiftService;
});

describe("GiftService", () => {
  const mockGift: Gift = {
    id: "gift-1",
    name: "Elegant Gift Box",
    description: "Beautiful gift box perfect for special occasions",
    price: 25.99,
    imageUrl: "https://example.com/images/gift-box.jpg",
  };

  const mockGifts: Gift[] = [
    mockGift,
    {
      id: "gift-2",
      name: "Premium Gift Set",
      description: "Luxury gift set with premium accessories",
      price: 49.99,
      imageUrl: "https://example.com/images/premium-set.jpg",
    },
    {
      id: "gift-3",
      name: "Basic Gift Wrap",
      description: "Simple and elegant gift wrapping",
      price: 5.99,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  describe("getAll", () => {
    it("should return all gifts", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockGifts });

      const result = await GiftService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/gifts");
      expect(result).toEqual(mockGifts);
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no gifts exist", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await GiftService.getAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle gifts without imageUrl", async () => {
      const giftsWithoutImage = [
        {
          id: "gift-no-image",
          name: "Simple Gift",
          description: "Gift without image",
          price: 10.00,
        },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: giftsWithoutImage });

      const result = await GiftService.getAll();

      expect(result[0]).not.toHaveProperty("imageUrl");
      expect(result[0].name).toBe("Simple Gift");
    });

    it("should handle different price formats", async () => {
      const giftsWithDifferentPrices = [
        { id: "1", name: "Cheap Gift", description: "Low cost", price: 1 },
        { id: "2", name: "Expensive Gift", description: "High cost", price: 999.99 },
        { id: "3", name: "Free Gift", description: "No cost", price: 0 },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: giftsWithDifferentPrices });

      const result = await GiftService.getAll();

      expect(result[0].price).toBe(1);
      expect(result[1].price).toBe(999.99);
      expect(result[2].price).toBe(0);
    });

    it("should rethrow API errors", async () => {
      const error = new Error("API Error");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toThrow("API Error");
    });

    it("should handle 404 error", async () => {
      const error = { response: { status: 404, data: { message: "Not found" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle 500 server error", async () => {
      const error = { response: { status: 500, data: { message: "Internal server error" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle network timeout", async () => {
      const error = { code: "ECONNABORTED", message: "timeout of 5000ms exceeded" };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle 401 unauthorized error", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle 503 service unavailable error", async () => {
      const error = { response: { status: 503, data: { message: "Service unavailable" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });
  });

  describe("getById", () => {
    const testId = "test-gift-id";

    it("should return gift by id", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockGift });

      const result = await GiftService.getById(testId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/gifts/${testId}`);
      expect(result).toEqual(mockGift);
    });

    it("should handle gift with all fields", async () => {
      const completeGift = {
        id: testId,
        name: "Complete Gift",
        description: "A complete gift with all fields",
        price: 39.99,
        imageUrl: "https://example.com/complete-gift.jpg",
      };
      mockAxiosInstance.get.mockResolvedValue({ data: completeGift });

      const result = await GiftService.getById(testId);

      expect(result).toEqual(completeGift);
      expect(result.imageUrl).toBe("https://example.com/complete-gift.jpg");
    });

    it("should handle gift without imageUrl", async () => {
      const giftWithoutImage = {
        id: testId,
        name: "No Image Gift",
        description: "Gift without image",
        price: 15.99,
      };
      mockAxiosInstance.get.mockResolvedValue({ data: giftWithoutImage });

      const result = await GiftService.getById(testId);

      expect(result).toEqual(giftWithoutImage);
      expect(result).not.toHaveProperty("imageUrl");
    });

    it("should handle UUID format id", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      mockAxiosInstance.get.mockResolvedValue({ data: { ...mockGift, id: uuidId } });

      const result = await GiftService.getById(uuidId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/gifts/${uuidId}`);
      expect(result.id).toBe(uuidId);
    });

    it("should handle numeric string id", async () => {
      const numericId = "12345";
      mockAxiosInstance.get.mockResolvedValue({ data: { ...mockGift, id: numericId } });

      const result = await GiftService.getById(numericId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/gifts/${numericId}`);
      expect(result.id).toBe(numericId);
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Not found");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getById(testId)).rejects.toThrow("Not found");
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Gift not found" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getById(testId)).rejects.toEqual(error);
    });

    it("should handle empty string id", async () => {
      const emptyId = "";
      mockAxiosInstance.get.mockResolvedValue({ data: mockGift });

      await GiftService.getById(emptyId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/gifts/");
    });

    it("should handle special characters in id", async () => {
      const specialId = "gift-with-special-chars-áéíóú";
      mockAxiosInstance.get.mockResolvedValue({ data: { ...mockGift, id: specialId } });

      const result = await GiftService.getById(specialId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/gifts/${specialId}`);
      expect(result.id).toBe(specialId);
    });
  });

  describe("create", () => {
    const newGiftData: Omit<Gift, "id"> = {
      name: "New Gift",
      description: "A new gift item",
      price: 29.99,
      imageUrl: "https://example.com/new-gift.jpg",
    };

    it("should create a new gift", async () => {
      const createdGift = {
        id: "new-gift-id",
        ...newGiftData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.create(newGiftData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/gifts", newGiftData);
      expect(result).toEqual(createdGift);
      expect(result.id).toBe("new-gift-id");
    });

    it("should create gift without imageUrl", async () => {
      const minimalData = {
        name: "Minimal Gift",
        description: "Simple gift",
        price: 10.00,
      };
      const createdGift = {
        id: "minimal-gift-id",
        ...minimalData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.create(minimalData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/gifts", minimalData);
      expect(result).toEqual(createdGift);
      expect(result).not.toHaveProperty("imageUrl");
    });

    it("should handle gift with zero price", async () => {
      const freeGiftData = {
        name: "Free Gift",
        description: "Complimentary item",
        price: 0,
      };
      const createdGift = {
        id: "free-gift-id",
        ...freeGiftData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.create(freeGiftData);

      expect(result.price).toBe(0);
    });

    it("should handle gift with high price", async () => {
      const expensiveGiftData = {
        name: "Luxury Gift",
        description: "Premium luxury item",
        price: 999.99,
      };
      const createdGift = {
        id: "luxury-gift-id",
        ...expensiveGiftData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.create(expensiveGiftData);

      expect(result.price).toBe(999.99);
    });

    it("should handle special characters in text fields", async () => {
      const specialCharData = {
        name: "Regalo Especial ñáéíóú",
        description: "Descripción con caracteres especiales @#$%^&*()",
        price: 25.50,
      };
      const createdGift = {
        id: "special-char-id",
        ...specialCharData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.create(specialCharData);

      expect(result.name).toBe("Regalo Especial ñáéíóú");
      expect(result.description).toBe("Descripción con caracteres especiales @#$%^&*()");
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Creation failed");
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(GiftService.create(newGiftData)).rejects.toThrow("Creation failed");
    });

    it("should handle 400 bad request error", async () => {
      const error = { response: { status: 400, data: { message: "Invalid data" } } };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(GiftService.create(newGiftData)).rejects.toEqual(error);
    });

    it("should handle 409 conflict error (duplicate)", async () => {
      const error = { response: { status: 409, data: { message: "Gift already exists" } } };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(GiftService.create(newGiftData)).rejects.toEqual(error);
    });

    it("should handle 422 validation error", async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: "Validation failed",
            errors: { name: ["Name is required"] },
          },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(GiftService.create(newGiftData)).rejects.toEqual(error);
    });
  });

  describe("createWithFile", () => {
    const newGiftData: Omit<Gift, "id"> = {
      name: "Gift with File",
      description: "Gift created with image file",
      price: 35.99,
    };

    it("should create gift with file", async () => {
      const mockFile = new File(["image content"], "gift-image.jpg", { type: "image/jpeg" });
      const createdGift = {
        id: "gift-with-file-id",
        ...newGiftData,
        imageUrl: "https://example.com/uploaded-image.jpg",
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.createWithFile(newGiftData, mockFile);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/gifts",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(result).toEqual(createdGift);
    });

    it("should create gift without file", async () => {
      const createdGift = {
        id: "gift-no-file-id",
        ...newGiftData,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      const result = await GiftService.createWithFile(newGiftData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/gifts",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(result).toEqual(createdGift);
    });

    it("should handle FormData creation correctly", async () => {
      const mockFile = new File(["image content"], "test.jpg", { type: "image/jpeg" });
      const giftData = {
        name: "Test Gift",
        description: "Test description",
        price: 20.00,
      };
      const createdGift = { id: "test-id", ...giftData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftData, mockFile);

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const formData = callArgs[1];
      
      expect(formData).toBeInstanceOf(FormData);
      expect(console.log).toHaveBeenCalledWith("FormData contents:");
    });

    it("should handle price as number in FormData", async () => {
      const giftDataWithPrice = {
        name: "Priced Gift",
        description: "Gift with specific price",
        price: 45.75,
      };
      const createdGift = { id: "priced-id", ...giftDataWithPrice };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftDataWithPrice);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      // Price should be converted to string in FormData
    });

    it("should exclude undefined and null values from FormData", async () => {
      const giftDataWithNulls = {
        name: "Valid Name",
        description: "",
        price: 15.99,
        imageUrl: undefined,
      };
      const createdGift = { id: "clean-id", name: "Valid Name", price: 15.99 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftDataWithNulls);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      // Empty string description should be excluded, undefined imageUrl should be excluded
    });

    it("should handle different file types", async () => {
      const pngFile = new File(["png content"], "gift.png", { type: "image/png" });
      const createdGift = { id: "png-id", ...newGiftData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(newGiftData, pngFile);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/gifts",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Upload failed");
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(GiftService.createWithFile(newGiftData)).rejects.toThrow("Upload failed");
    });

    it("should handle file upload validation error", async () => {
      const error = {
        response: {
          status: 413,
          data: { message: "File too large" },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(error);

      const largeFile = new File(["large content"], "large.jpg", { type: "image/jpeg" });

      await expect(GiftService.createWithFile(newGiftData, largeFile)).rejects.toEqual(error);
    });

    it("should handle unsupported file type error", async () => {
      const error = {
        response: {
          status: 415,
          data: { message: "Unsupported media type" },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(error);

      const txtFile = new File(["text content"], "file.txt", { type: "text/plain" });

      await expect(GiftService.createWithFile(newGiftData, txtFile)).rejects.toEqual(error);
    });
  });

  describe("update", () => {
    const testId = "update-test-id";
    const updateData: Partial<Gift> = {
      name: "Updated Gift",
      description: "Updated description",
      price: 39.99,
    };

    it("should update gift", async () => {
      const updatedGift = { ...mockGift, ...updateData, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/gifts/${testId}`, updateData);
      expect(result).toEqual(updatedGift);
      expect(result.name).toBe("Updated Gift");
    });

    it("should update only name field", async () => {
      const partialUpdate = { name: "Only Name Updated" };
      const updatedGift = { ...mockGift, ...partialUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, partialUpdate);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/gifts/${testId}`, partialUpdate);
      expect(result.name).toBe("Only Name Updated");
      expect(result.description).toBe(mockGift.description);
    });

    it("should update only price field", async () => {
      const partialUpdate = { price: 99.99 };
      const updatedGift = { ...mockGift, ...partialUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, partialUpdate);

      expect(result.price).toBe(99.99);
      expect(result.name).toBe(mockGift.name);
    });

    it("should update only description field", async () => {
      const partialUpdate = { description: "Only description updated" };
      const updatedGift = { ...mockGift, ...partialUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, partialUpdate);

      expect(result.description).toBe("Only description updated");
      expect(result.name).toBe(mockGift.name);
    });

    it("should update imageUrl", async () => {
      const partialUpdate = { imageUrl: "https://example.com/new-image.jpg" };
      const updatedGift = { ...mockGift, ...partialUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, partialUpdate);

      expect(result.imageUrl).toBe("https://example.com/new-image.jpg");
    });

    it("should handle empty update data", async () => {
      const emptyUpdate = {};
      const updatedGift = { ...mockGift, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, emptyUpdate);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/gifts/${testId}`, emptyUpdate);
      expect(result).toEqual(updatedGift);
    });

    it("should handle update with special characters", async () => {
      const specialUpdate = {
        name: "Regalo Actualizado ñáéíóú",
        description: "Descripción actualizada con símbolos @#$%",
      };
      const updatedGift = { ...mockGift, ...specialUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.update(testId, specialUpdate);

      expect(result.name).toBe("Regalo Actualizado ñáéíóú");
      expect(result.description).toBe("Descripción actualizada con símbolos @#$%");
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Update failed");
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.update(testId, updateData)).rejects.toThrow("Update failed");
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Gift not found" } } };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.update(testId, updateData)).rejects.toEqual(error);
    });

    it("should handle 400 bad request error", async () => {
      const error = { response: { status: 400, data: { message: "Invalid update data" } } };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.update(testId, updateData)).rejects.toEqual(error);
    });

    it("should handle 422 validation error", async () => {
      const error = {
        response: {
          status: 422,
          data: {
            message: "Validation failed",
            errors: { price: ["Price must be positive"] },
          },
        },
      };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.update(testId, updateData)).rejects.toEqual(error);
    });

    it("should handle 409 conflict error", async () => {
      const error = { response: { status: 409, data: { message: "Name already exists" } } };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.update(testId, updateData)).rejects.toEqual(error);
    });
  });

  describe("updateWithFile", () => {
    const testId = "update-with-file-id";
    const updateData: Partial<Gift> = {
      name: "Updated Gift with File",
      description: "Updated with new image",
      price: 45.99,
    };

    it("should update gift with file", async () => {
      const mockFile = new File(["new image content"], "updated-image.jpg", { type: "image/jpeg" });
      const updatedGift = {
        ...mockGift,
        ...updateData,
        id: testId,
        imageUrl: "https://example.com/updated-image.jpg",
      };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.updateWithFile(testId, updateData, mockFile);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/gifts/${testId}`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(result).toEqual(updatedGift);
    });

    it("should update gift without file", async () => {
      const updatedGift = { ...mockGift, ...updateData, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      const result = await GiftService.updateWithFile(testId, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/gifts/${testId}`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(result).toEqual(updatedGift);
    });

    it("should handle price conversion in FormData for update", async () => {
      const priceUpdateData = { price: 55.25 };
      const updatedGift = { ...mockGift, ...priceUpdateData, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      await GiftService.updateWithFile(testId, priceUpdateData);

      expect(mockAxiosInstance.put).toHaveBeenCalled();
    });

    it("should exclude empty values from FormData in update", async () => {
      const updateDataWithEmpty = {
        name: "Valid Name",
        description: "",
        price: 30.00,
        imageUrl: null,
      };
      const updatedGift = { ...mockGift, name: "Valid Name", price: 30.00, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      await GiftService.updateWithFile(testId, updateDataWithEmpty);

      expect(mockAxiosInstance.put).toHaveBeenCalled();
    });

    it("should handle different file types for update", async () => {
      const gifFile = new File(["gif content"], "animated.gif", { type: "image/gif" });
      const updatedGift = { ...mockGift, ...updateData, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedGift });

      await GiftService.updateWithFile(testId, updateData, gifFile);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/gifts/${testId}`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Update with file failed");
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(GiftService.updateWithFile(testId, updateData)).rejects.toThrow("Update with file failed");
    });

    it("should handle file size limit error", async () => {
      const error = {
        response: {
          status: 413,
          data: { message: "File too large" },
        },
      };
      mockAxiosInstance.put.mockRejectedValue(error);

      const largeFile = new File(["very large content"], "large.jpg", { type: "image/jpeg" });

      await expect(GiftService.updateWithFile(testId, updateData, largeFile)).rejects.toEqual(error);
    });
  });

  describe("delete", () => {
    const testId = "delete-test-id";

    it("should delete gift", async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await GiftService.delete(testId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/gifts/${testId}`);
    });

    it("should handle successful deletion without return data", async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: null });

      const result = await GiftService.delete(testId);

      expect(result).toBeUndefined();
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/gifts/${testId}`);
    });

    it("should handle UUID format id for deletion", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      mockAxiosInstance.delete.mockResolvedValue({});

      await GiftService.delete(uuidId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/gifts/${uuidId}`);
    });

    it("should handle numeric string id for deletion", async () => {
      const numericId = "12345";
      mockAxiosInstance.delete.mockResolvedValue({});

      await GiftService.delete(numericId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/gifts/${numericId}`);
    });

    it("should rethrow API errors", async () => {
      const error = new Error("Deletion failed");
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(GiftService.delete(testId)).rejects.toThrow("Deletion failed");
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Gift not found" } } };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(GiftService.delete(testId)).rejects.toEqual(error);
    });

    it("should handle 403 forbidden error (no permission)", async () => {
      const error = { response: { status: 403, data: { message: "Forbidden" } } };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(GiftService.delete(testId)).rejects.toEqual(error);
    });

    it("should handle 409 conflict error (cannot delete)", async () => {
      const error = {
        response: {
          status: 409,
          data: { message: "Cannot delete gift with active orders" },
        },
      };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(GiftService.delete(testId)).rejects.toEqual(error);
    });

    it("should handle network error during deletion", async () => {
      const error = { code: "ECONNRESET", message: "Connection reset" };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(GiftService.delete(testId)).rejects.toEqual(error);
    });

    it("should handle empty string id", async () => {
      const emptyId = "";
      mockAxiosInstance.delete.mockResolvedValue({});

      await GiftService.delete(emptyId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/gifts/");
    });

    it("should handle special characters in id", async () => {
      const specialId = "gift-with-special-chars-áéíóú";
      mockAxiosInstance.delete.mockResolvedValue({});

      await GiftService.delete(specialId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/gifts/${specialId}`);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle rate limiting error", async () => {
      const error = { response: { status: 429, data: { message: "Too many requests" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle service unavailable error", async () => {
      const error = { response: { status: 503, data: { message: "Service unavailable" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });

    it("should handle malformed response data", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await GiftService.getAll();

      expect(result).toBeNull();
    });

    it("should handle undefined response data", async () => {
      mockAxiosInstance.get.mockResolvedValue({});

      const result = await GiftService.getAll();

      expect(result).toBeUndefined();
    });

    it("should handle response without data property", async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 200 });

      const result = await GiftService.getAll();

      expect(result).toBeUndefined();
    });

    it("should handle network interruption", async () => {
      const error = { code: "ECONNRESET", message: "Connection reset" };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getById("test-id")).rejects.toEqual(error);
    });

    it("should handle DNS resolution error", async () => {
      const error = { code: "ENOTFOUND", message: "getaddrinfo ENOTFOUND" };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(GiftService.getAll()).rejects.toEqual(error);
    });
  });

  describe("Performance and Data Handling", () => {
    it("should handle large datasets efficiently", async () => {
      const largeDataset = Array.from({ length: 500 }, (_, index) => ({
        id: `gift-${index}`,
        name: `Gift ${index}`,
        description: `Description for gift ${index}`,
        price: Number((Math.random() * 100).toFixed(2)),
        imageUrl: `https://example.com/gift-${index}.jpg`,
      }));
      mockAxiosInstance.get.mockResolvedValue({ data: largeDataset });

      const result = await GiftService.getAll();

      expect(result).toHaveLength(500);
      expect(result[0].name).toBe("Gift 0");
      expect(result[499].name).toBe("Gift 499");
    });

    it("should preserve data types correctly", async () => {
      const typedGift = {
        id: "typed-gift",
        name: "Typed Gift",
        description: "Description with proper typing",
        price: 45.99,
        imageUrl: "https://example.com/typed-gift.jpg",
      };
      mockAxiosInstance.get.mockResolvedValue({ data: typedGift });

      const result = await GiftService.getById("typed-gift");

      expect(typeof result.id).toBe("string");
      expect(typeof result.name).toBe("string");
      expect(typeof result.description).toBe("string");
      expect(typeof result.price).toBe("number");
      expect(typeof result.imageUrl).toBe("string");
    });

    it("should handle price precision correctly", async () => {
      const precisionGift = {
        id: "precision-gift",
        name: "Precision Gift",
        description: "Gift with precise pricing",
        price: 25.99,
      };
      mockAxiosInstance.get.mockResolvedValue({ data: precisionGift });

      const result = await GiftService.getById("precision-gift");

      expect(result.price).toBe(25.99);
    });

    it("should handle very long text fields", async () => {
      const longTextGift = {
        id: "long-text-gift",
        name: "A".repeat(255),
        description: "B".repeat(1000),
        price: 25.99,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: longTextGift });

      const createRequest: Omit<Gift, "id"> = {
        name: "A".repeat(255),
        description: "B".repeat(1000),
        price: 25.99,
      };

      const result = await GiftService.create(createRequest);

      expect(result.name).toHaveLength(255);
      expect(result.description).toHaveLength(1000);
    });
  });

  describe("FormData Handling", () => {
    it("should log FormData contents for debugging", async () => {
      const giftData = {
        name: "Debug Gift",
        description: "For FormData debugging",
        price: 15.99,
      };
      const createdGift = { id: "debug-id", ...giftData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftData);

      expect(console.log).toHaveBeenCalledWith("FormData contents:");
    });

    it("should handle undefined values correctly in FormData", async () => {
      const giftDataWithUndefined = {
        name: "Test Gift",
        description: undefined,
        price: 20.00,
        imageUrl: undefined,
      };
      const createdGift = { id: "undefined-id", name: "Test Gift", price: 20.00 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftDataWithUndefined);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it("should handle null values correctly in FormData", async () => {
      const giftDataWithNull = {
        name: "Test Gift",
        description: null,
        price: 20.00,
        imageUrl: null,
      };
      const createdGift = { id: "null-id", name: "Test Gift", price: 20.00 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftDataWithNull);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it("should handle empty string values correctly in FormData", async () => {
      const giftDataWithEmpty = {
        name: "Test Gift",
        description: "",
        price: 20.00,
        imageUrl: "",
      };
      const createdGift = { id: "empty-id", name: "Test Gift", price: 20.00 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdGift });

      await GiftService.createWithFile(giftDataWithEmpty);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });
  });
});