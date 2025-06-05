import { AxiosError } from 'axios';
import apiClient from '@/lib/axios';
import { AiService, aiService, GenerateTextRequest, GenerateTextResponse, MessageContext } from '@/services/ai/ai.service';

// Mock del módulo axios
jest.mock('@/lib/axios', () => ({
  post: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation();
    service = new AiService();
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  // Mock data
  const mockGenerateTextResponse: GenerateTextResponse = {
    text: 'Hoy elijo crear mi propio espacio de paz'
  };

  const mockMessageContext: MessageContext = {
    aromaDescription: 'Una fragancia relajante con notas de lavanda',
    fragrance: 'lavender',
    aromaName: 'Lavanda Serena',
    emotion: 'calm',
    emotionName: 'Calma',
    mainOptionId: 'main-1',
    mainOptionName: 'Relajación',
    placeId: 'place-1',
    placeName: 'Dormitorio',
    container: 'ceramic',
    containerName: 'Contenedor Cerámico',
    waxColor: '#E6E6FA'
  };

  const mockEmptyContext: MessageContext = {};

  const mockPartialContext: MessageContext = {
    aromaName: 'Menta Fresca',
    emotionName: 'Energía',
    placeName: 'Oficina'
  };

  describe('Constructor and Instance', () => {
    it('should create an instance of AiService', () => {
      expect(service).toBeInstanceOf(AiService);
    });

    it('should export a singleton instance', () => {
      expect(aiService).toBeInstanceOf(AiService);
    });
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const prompt = 'Genera un mensaje inspirador';
      mockApiClient.post.mockResolvedValue({
        data: mockGenerateTextResponse
      });

      const result = await service.generateText(prompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt
      });
      expect(result).toBe(mockGenerateTextResponse.text);
    });

    it('should generate text with complex prompt', async () => {
      const complexPrompt = 'Genera un mensaje motivacional en primera persona que incluya elementos de lavanda, relajación y dormitorio';
      mockApiClient.post.mockResolvedValue({
        data: { text: 'Me rodeo de aromas que nutren mi alma y crean paz' }
      });

      const result = await service.generateText(complexPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: complexPrompt
      });
      expect(result).toBe('Me rodeo de aromas que nutren mi alma y crean paz');
    });

    it('should generate text with special characters in prompt', async () => {
      const promptWithSpecialChars = 'Genera un mensaje con "comillas" y símbolos: @#$%';
      mockApiClient.post.mockResolvedValue({
        data: { text: 'Mensaje con caracteres especiales generado' }
      });

      const result = await service.generateText(promptWithSpecialChars);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: promptWithSpecialChars
      });
      expect(result).toBe('Mensaje con caracteres especiales generado');
    });

    it('should handle empty prompt', async () => {
      const emptyPrompt = '';
      mockApiClient.post.mockResolvedValue({
        data: { text: 'Mensaje por defecto' }
      });

      const result = await service.generateText(emptyPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: emptyPrompt
      });
      expect(result).toBe('Mensaje por defecto');
    });

    it('should handle very long prompt', async () => {
      const longPrompt = 'A'.repeat(1000);
      mockApiClient.post.mockResolvedValue({
        data: { text: 'Respuesta a prompt largo' }
      });

      const result = await service.generateText(longPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: longPrompt
      });
      expect(result).toBe('Respuesta a prompt largo');
    });

    it('should throw error on 400 Bad Request', async () => {
      const prompt = 'Invalid prompt';
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { message: 'Invalid request format' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should throw error on 401 Unauthorized', async () => {
      const prompt = 'Test prompt';
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Unauthorized access' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should throw error on 404 Not Found', async () => {
      const prompt = 'Test prompt';
      const error = new AxiosError('Not Found');
      error.response = {
        status: 404,
        data: { message: 'Endpoint not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should throw error on 500 Internal Server Error', async () => {
      const prompt = 'Test prompt';
      const error = new AxiosError('Internal Server Error');
      error.response = {
        status: 500,
        data: { message: 'AI service unavailable' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should throw error on network error', async () => {
      const prompt = 'Test prompt';
      const error = new AxiosError('Network Error');
      error.code = 'NETWORK_ERROR';

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should throw error on timeout', async () => {
      const prompt = 'Test prompt';
      const error = new AxiosError('Timeout');
      error.code = 'ECONNABORTED';

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should handle unknown error', async () => {
      const prompt = 'Test prompt';
      const error = new Error('Unknown error');

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateText(prompt)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });
  });

  describe('generateInspirationalMessage', () => {
    const mockInspirationalText = 'Respiro profundo y me permito sentir calma';

    beforeEach(() => {
      mockApiClient.post.mockResolvedValue({
        data: { text: mockInspirationalText }
      });
    });

    it('should generate inspirational message with full context', async () => {
      const result = await service.generateInspirationalMessage(mockMessageContext);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining('Genera un mensaje inspirador y motivacional en primera persona')
      });
      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Lavanda Serena');
      expect(calledPrompt).toContain('Una fragancia relajante con notas de lavanda');
      expect(calledPrompt).toContain('calma');
      expect(calledPrompt).toContain('relajación');
      expect(calledPrompt).toContain('dormitorio');
      expect(calledPrompt).toContain('contenedor cerámico');
    });

    it('should generate inspirational message with empty context', async () => {
      const result = await service.generateInspirationalMessage(mockEmptyContext);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining('Genera un mensaje inspirador y motivacional en primera persona')
      });
      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('máximo 15 palabras');
      expect(calledPrompt).toContain('primera persona');
      expect(calledPrompt).toContain('positivo y motivacional');
    });

    it('should generate inspirational message with partial context', async () => {
      const result = await service.generateInspirationalMessage(mockPartialContext);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining('Genera un mensaje inspirador y motivacional en primera persona')
      });
      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Menta Fresca');
      expect(calledPrompt).toContain('energía');
      expect(calledPrompt).toContain('oficina');
    });

    it('should generate inspirational message with custom prompt', async () => {
      const customPrompt = 'Incluye elementos de gratitud y abundancia';
      const result = await service.generateInspirationalMessage(mockMessageContext, customPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining(customPrompt)
      });
      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Por favor, considera también lo siguiente:');
      expect(calledPrompt).toContain(customPrompt);
    });

    it('should generate inspirational message with only aromaName', async () => {
      const contextWithOnlyAroma: MessageContext = {
        aromaName: 'Rosa Divina'
      };

      const result = await service.generateInspirationalMessage(contextWithOnlyAroma);

      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Rosa Divina');
      expect(calledPrompt).not.toContain('undefined');
    });

    it('should handle context with special characters', async () => {
      const specialContext: MessageContext = {
        aromaName: 'Aroma "Especial" & Único',
        emotionName: 'Paz & Tranquilidad',
        placeName: 'Sala de Estar (Principal)'
      };

      const result = await service.generateInspirationalMessage(specialContext);

      expect(result).toBe(mockInspirationalText);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Aroma "Especial" & Único');
      expect(calledPrompt).toContain('paz & tranquilidad');
      expect(calledPrompt).toContain('sala de estar (principal)');
    });

    it('should handle error in inspirational message generation', async () => {
      const error = new AxiosError('AI Service Error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateInspirationalMessage(mockMessageContext)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });
  });

  describe('generateCandleNames', () => {
    const mockCandleNamesResponse = `1. Serenidad Lavanda
2. Refugio Dorado
3. Calma Nocturna
4. Paz Interior
5. Momento Zen
6. Dulce Tranquilidad`;

    beforeEach(() => {
      mockApiClient.post.mockResolvedValue({
        data: { text: mockCandleNamesResponse }
      });
    });

    it('should generate candle names with default count', async () => {
      const result = await service.generateCandleNames(mockMessageContext);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining('Genera 6 nombres creativos y únicos')
      });
      expect(result).toEqual([
        'Serenidad Lavanda',
        'Refugio Dorado',
        'Calma Nocturna',
        'Paz Interior',
        'Momento Zen',
        'Dulce Tranquilidad'
      ]);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Lavanda Serena');
      expect(calledPrompt).toContain('Calma');
      expect(calledPrompt).toContain('Relajación');
      expect(calledPrompt).toContain('Dormitorio');
    });

    it('should generate candle names with custom count', async () => {
      const customCount = 3;
      const customResponse = `1. Aroma Especial
2. Vela Única
3. Fragancia Mágica`;

      mockApiClient.post.mockResolvedValue({
        data: { text: customResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext, customCount);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining(`Genera ${customCount} nombres creativos y únicos`)
      });
      expect(result).toEqual([
        'Aroma Especial',
        'Vela Única',
        'Fragancia Mágica'
      ]);
    });

    it('should generate candle names with empty context', async () => {
      const result = await service.generateCandleNames(mockEmptyContext);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: expect.stringContaining('Genera 6 nombres creativos y únicos')
      });
      expect(result).toEqual([
        'Serenidad Lavanda',
        'Refugio Dorado',
        'Calma Nocturna',
        'Paz Interior',
        'Momento Zen',
        'Dulce Tranquilidad'
      ]);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('máximo 4 palabras');
      expect(calledPrompt).toContain('En español');
    });

    it('should handle response with different formatting', async () => {
      const differentFormatResponse = `- Vela Hermosa
- Luz Divina
- Aroma Celestial
4. Paz Profunda
5. Calma Total
6. Serenidad Pura`;

      mockApiClient.post.mockResolvedValue({
        data: { text: differentFormatResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext);

      expect(result).toEqual([
        'Vela Hermosa',
        'Luz Divina',
        'Aroma Celestial',
        'Paz Profunda',
        'Calma Total',
        'Serenidad Pura'
      ]);
    });

    it('should filter out empty lines and long names', async () => {
      const responseWithEmptyAndLong = `1. Vela Corta

2. Este es un nombre extremadamente largo que supera los 30 caracteres permitidos
3. Nombre OK
4. 

5. Otro Bueno
6. Otro nombre muy muy muy muy muy muy largo`;

      mockApiClient.post.mockResolvedValue({
        data: { text: responseWithEmptyAndLong }
      });

      const result = await service.generateCandleNames(mockMessageContext);

      expect(result).toEqual([
        'Vela Corta',
        'Nombre OK',
        'Otro Bueno'
      ]);
    });

    it('should handle response with extra whitespace', async () => {
      const responseWithWhitespace = `  1.   Vela Con Espacios   
   2. Otro Nombre    
3.    Tercer Nombre  `;

      mockApiClient.post.mockResolvedValue({
        data: { text: responseWithWhitespace }
      });

      const result = await service.generateCandleNames(mockMessageContext);

      expect(result).toEqual([
        "1.   Vela Con Espacios",
        "2. Otro Nombre",
        'Tercer Nombre'
      ]);
    });

    it('should limit results to requested count', async () => {
      const longResponse = `1. Nombre 1
2. Nombre 2
3. Nombre 3
4. Nombre 4
5. Nombre 5
6. Nombre 6
7. Nombre 7
8. Nombre 8`;

      mockApiClient.post.mockResolvedValue({
        data: { text: longResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext, 3);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        'Nombre 1',
        'Nombre 2',
        'Nombre 3'
      ]);
    });

    it('should handle error in candle names generation', async () => {
      const error = new AxiosError('AI Service Error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateCandleNames(mockMessageContext)).rejects.toThrow(
        'No se pudo generar el mensaje con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating text with AI:', error);
    });

    it('should handle partial context for candle names', async () => {
      const result = await service.generateCandleNames(mockPartialContext);

      expect(result).toEqual([
        'Serenidad Lavanda',
        'Refugio Dorado',
        'Calma Nocturna',
        'Paz Interior',
        'Momento Zen',
        'Dulce Tranquilidad'
      ]);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Menta Fresca');
      expect(calledPrompt).toContain('Energía');
      expect(calledPrompt).toContain('Oficina');
    });
  });

  describe('generateImage', () => {
    const mockImageUrl = 'https://example.com/generated-image.jpg';

    it('should generate image successfully', async () => {
      const prompt = 'Una vela aromática con lavanda';
      mockApiClient.post.mockResolvedValue({
        data: { imageUrl: mockImageUrl }
      });

      const result = await service.generateImage(prompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-image', {
        prompt
      });
      expect(result).toBe(mockImageUrl);
    });

    it('should generate image with complex prompt', async () => {
      const complexPrompt = 'Una vela en contenedor cerámico blanco, con aroma de lavanda, en un dormitorio minimalista, luz suave';
      mockApiClient.post.mockResolvedValue({
        data: { imageUrl: mockImageUrl }
      });

      const result = await service.generateImage(complexPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-image', {
        prompt: complexPrompt
      });
      expect(result).toBe(mockImageUrl);
    });

    it('should handle empty prompt for image generation', async () => {
      const emptyPrompt = '';
      mockApiClient.post.mockResolvedValue({
        data: { imageUrl: mockImageUrl }
      });

      const result = await service.generateImage(emptyPrompt);

      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-image', {
        prompt: emptyPrompt
      });
      expect(result).toBe(mockImageUrl);
    });

    it('should throw error on 400 Bad Request for image generation', async () => {
      const prompt = 'Invalid image prompt';
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { message: 'Invalid image prompt format' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateImage(prompt)).rejects.toThrow(
        'No se pudo generar la imagen con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating image with AI:', error);
    });

    it('should throw error on 401 Unauthorized for image generation', async () => {
      const prompt = 'Test image prompt';
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Unauthorized access to image generation' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateImage(prompt)).rejects.toThrow(
        'No se pudo generar la imagen con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating image with AI:', error);
    });

    it('should throw error on 500 Internal Server Error for image generation', async () => {
      const prompt = 'Test image prompt';
      const error = new AxiosError('Internal Server Error');
      error.response = {
        status: 500,
        data: { message: 'Image generation service unavailable' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateImage(prompt)).rejects.toThrow(
        'No se pudo generar la imagen con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating image with AI:', error);
    });

    it('should handle network error for image generation', async () => {
      const prompt = 'Test image prompt';
      const error = new AxiosError('Network Error');
      error.code = 'NETWORK_ERROR';

      mockApiClient.post.mockRejectedValue(error);

      await expect(service.generateImage(prompt)).rejects.toThrow(
        'No se pudo generar la imagen con IA. Intenta de nuevo.'
      );

      expect(console.error).toHaveBeenCalledWith('Error generating image with AI:', error);
    });
  });

  describe('Private Methods Integration', () => {
    it('should build contextual prompt correctly through generateInspirationalMessage', async () => {
      const mockText = 'Mensaje generado';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      await service.generateInspirationalMessage(mockMessageContext);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      
      // Verify prompt structure
      expect(calledPrompt).toContain('Genera un mensaje inspirador y motivacional en primera persona');
      expect(calledPrompt).toContain('máximo 15 palabras');
      expect(calledPrompt).toContain('positivo y relacionado con la experiencia de la vela');
      
      // Verify context inclusion
      expect(calledPrompt).toContain('La fragancia elegida es "Lavanda Serena"');
      expect(calledPrompt).toContain('Descripción de la fragancia: Una fragancia relajante con notas de lavanda');
      expect(calledPrompt).toContain('El usuario busca una experiencia de calma');
      expect(calledPrompt).toContain('Su objetivo principal es relajación');
      expect(calledPrompt).toContain('La vela será utilizada en dormitorio');
      expect(calledPrompt).toContain('Será presentada en contenedor cerámico');
      
      // Verify examples and requirements
      expect(calledPrompt).toContain('Ejemplos de mensajes inspiradores en primera persona:');
      expect(calledPrompt).toContain('Hoy elijo crear mi propio espacio de paz');
      expect(calledPrompt).toContain('Estar en primera persona');
      expect(calledPrompt).toContain('Ser positivo y motivacional');
    });

    it('should build candle name prompt correctly through generateCandleNames', async () => {
      const mockResponse = '1. Nombre 1\n2. Nombre 2\n3. Nombre 3';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockResponse }
      });

      await service.generateCandleNames(mockMessageContext, 3);

      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      
      // Verify prompt structure
      expect(calledPrompt).toContain('Genera 3 nombres creativos y únicos para una vela personalizada');
      expect(calledPrompt).toContain('Cortos y memorables (máximo 4 palabras)');
      expect(calledPrompt).toContain('Evocativos y emocionales');
      expect(calledPrompt).toContain('En español');
      expect(calledPrompt).toContain('Sin comillas');
      
      // Verify context inclusion
      expect(calledPrompt).toContain('Fragancia: Lavanda Serena');
      expect(calledPrompt).toContain('Descripción del aroma: Una fragancia relajante con notas de lavanda');
      expect(calledPrompt).toContain('Emoción buscada: Calma');
      expect(calledPrompt).toContain('Propósito: Relajación');
      expect(calledPrompt).toContain('Lugar de uso: Dormitorio');
      expect(calledPrompt).toContain('Tipo de contenedor: Contenedor Cerámico');
      
      // Verify examples
      expect(calledPrompt).toContain('Ejemplos de buenos nombres de velas:');
      expect(calledPrompt).toContain('Susurros de Lavanda');
      expect(calledPrompt).toContain('Momento Zen');
      expect(calledPrompt).toContain('Genera 3 nombres únicos, uno por línea, numerados del 1 al 3:');
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle context with all optional fields undefined', async () => {
      const undefinedContext: MessageContext = {
        aromaDescription: undefined,
        fragrance: undefined,
        aromaName: undefined,
        emotion: undefined,
        emotionName: undefined,
        mainOptionId: undefined,
        mainOptionName: undefined,
        placeId: undefined,
        placeName: undefined,
        container: undefined,
        containerName: undefined,
        waxColor: undefined
      };

      const mockText = 'Mensaje sin contexto';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      const result = await service.generateInspirationalMessage(undefinedContext);

      expect(result).toBe(mockText);
      
      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).not.toContain('undefined');
      expect(calledPrompt).not.toContain('null');
    });

    it('should handle very long context values', async () => {
      const longContext: MessageContext = {
        aromaDescription: 'A'.repeat(500),
        aromaName: 'B'.repeat(100),
        emotionName: 'C'.repeat(100),
        mainOptionName: 'D'.repeat(100),
        placeName: 'E'.repeat(100),
        containerName: 'F'.repeat(100)
      };

      const mockText = 'Mensaje con contexto largo';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      const result = await service.generateInspirationalMessage(longContext);

      expect(result).toBe(mockText);
      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it('should handle multilingual context', async () => {
      const multilingualContext: MessageContext = {
        aromaName: 'Lavender & Lavanda',
        emotionName: 'Peace & Paz',
        placeName: 'Bedroom & Dormitorio'
      };

      const mockText = 'Mensaje multiidioma';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      const result = await service.generateInspirationalMessage(multilingualContext);

      expect(result).toBe(mockText);
      
      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('Lavender & Lavanda');
      expect(calledPrompt).toContain('peace & paz');
      expect(calledPrompt).toContain('bedroom & dormitorio');
    });

    it('should handle custom prompt with special characters', async () => {
      const customPrompt = 'Incluye elementos de @gratitud #abundancia & "prosperidad"';
      const mockText = 'Mensaje con caracteres especiales';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      const result = await service.generateInspirationalMessage(mockMessageContext, customPrompt);

      expect(result).toBe(mockText);
      
      const calledPrompt = mockApiClient.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('@gratitud #abundancia & "prosperidad"');
    });

    it('should handle candle names with inconsistent formatting', async () => {
      const inconsistentResponse = `1.Primera Vela
2. Segunda Vela  
  3.  Tercera Vela
4 Cuarta Vela
- Quinta Vela
Sexta Vela`;

      mockApiClient.post.mockResolvedValue({
        data: { text: inconsistentResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext);

      expect(result).toEqual([
        'Primera Vela',
        'Segunda Vela',
        "3.  Tercera Vela",
        '4 Cuarta Vela',
        'Quinta Vela',
        'Sexta Vela'
      ]);
    });

    it('should handle zero count for candle names', async () => {
      const mockResponse = '';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext, 0);

      expect(result).toEqual([]);
    });

    it('should handle negative count for candle names', async () => {
      const mockResponse = '1. Vela Uno\n2. Vela Dos';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockResponse }
      });

      const result = await service.generateCandleNames(mockMessageContext, -1);

      expect(result).toEqual(["Vela Uno"]);
    });
  });

  describe('Service Integration', () => {
    it('should work with singleton instance', async () => {
      const mockText = 'Texto desde singleton';
      mockApiClient.post.mockResolvedValue({
        data: { text: mockText }
      });

      const result = await aiService.generateText('Test prompt');

      expect(result).toBe(mockText);
      expect(mockApiClient.post).toHaveBeenCalledWith('/ai/generate-text', {
        prompt: 'Test prompt'
      });
    });

    it('should maintain state across multiple calls', async () => {
      const mockText1 = 'Primera respuesta';
      const mockText2 = 'Segunda respuesta';

      mockApiClient.post
        .mockResolvedValueOnce({ data: { text: mockText1 } })
        .mockResolvedValueOnce({ data: { text: mockText2 } });

      const result1 = await service.generateText('Primer prompt');
      const result2 = await service.generateText('Segundo prompt');

      expect(result1).toBe(mockText1);
      expect(result2).toBe(mockText2);
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent requests', async () => {
      const mockTexts = ['Texto 1', 'Texto 2', 'Texto 3'];
      
      mockApiClient.post
        .mockResolvedValueOnce({ data: { text: mockTexts[0] } })
        .mockResolvedValueOnce({ data: { text: mockTexts[1] } })
        .mockResolvedValueOnce({ data: { text: mockTexts[2] } });

      const promises = [
        service.generateText('Prompt 1'),
        service.generateText('Prompt 2'),
        service.generateText('Prompt 3')
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(mockTexts);
      expect(mockApiClient.post).toHaveBeenCalledTimes(3);
    });
  });
});