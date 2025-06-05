import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import { CandleService } from '@/services/candles/candle.service';
import { Candle, CreateCandleRequest, CreateCandleWithFilesRequest, UpdateCandleRequest } from '@/types/candle';
import { Container } from '@/types/container';
import { Gift } from '@/types/gift';

// Mock axios
jest.mock('@/lib/axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CandleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockCandle: Candle = {
    id: '1',
    name: 'Lavender Candle',
    description: 'A calming lavender scented candle',
    price: 25.99,
    audioUrl: 'https://example.com/audio.mp3',
    modelUrl: 'https://example.com/model.glb',
    message: 'Relax and unwind',
    qrUrl: 'https://example.com/qr.png',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    container: {
      id: 'container1',
      name: 'Glass Container',
      price: 10,
      description: 'Beautiful glass container',
      imageUrl: 'https://example.com/container.jpg'
    },
    aroma: {
      color: '#9B59B6',
      id: 'aroma1',
      name: 'Lavender',
      price: 15,
      description: 'Calming lavender scent',
      imageUrl: 'https://example.com/aroma.jpg'
    },
    label: {
      id: 'label1',
      name: 'Elegant Label',
      description: 'Beautiful label design',
      imageUrl: 'https://example.com/label.jpg',
      text: 'Lavender Dreams'
    },
    user: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    }
  };

  const mockContainer: Container = {
    id: 'container1',
    name: 'Glass Container',
    description: 'Beautiful glass container',
    basePrice: 8,
    dimensions: {
      width: 10,
      height: 12,
      depth: 10
    },
    imageUrl: 'https://example.com/container.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockGift: Gift = {
    id: 'gift1',
    name: 'Gift Box',
    description: 'Beautiful gift packaging',
    price: 5,
    imageUrl: 'https://example.com/gift.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('getAll', () => {
    it('should fetch all candles successfully', async () => {
      const mockCandles = [mockCandle];
      mockedAxios.get.mockResolvedValue({ data: mockCandles });

      const result = await CandleService.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/candles');
      expect(result).toEqual(mockCandles);
    });

    it('should handle API error and translate message', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getAll()).rejects.toThrow('Error interno del servidor. Intenta de nuevo más tarde');
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';
      
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(CandleService.getAll()).rejects.toThrow('Error de conexión inesperado');
    });
  });

  describe('getById', () => {
    it('should fetch candle by ID successfully', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockCandle });

      const result = await CandleService.getById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/candles/1');
      expect(result).toEqual(mockCandle);
    });

    it('should handle candle not found error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Candle not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getById('999')).rejects.toThrow('La vela no fue encontrada');
    });
  });

  describe('getByUser', () => {
    it('should fetch candles by user ID successfully', async () => {
      const mockCandles = [mockCandle];
      mockedAxios.get.mockResolvedValue({ data: mockCandles });

      const result = await CandleService.getByUser('user1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/candles/user/user1');
      expect(result).toEqual(mockCandles);
    });

    it('should handle unauthorized access error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getByUser('user1')).rejects.toThrow('No tienes autorización para realizar esta acción');
    });
  });

  describe('create', () => {
    it('should create candle successfully', async () => {
      const createRequest: CreateCandleRequest = {
        name: 'New Candle',
        description: 'A new candle',
        price: 20,
        message: 'Test message',
        containerId: 'container1',
        aromaId: 'aroma1',
        userId: 'user1',
        isActive: true
      };

      mockedAxios.post.mockResolvedValue({ data: mockCandle });

      const result = await CandleService.create(createRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith('/candles', createRequest);
      expect(result).toEqual(mockCandle);
    });

    it('should handle validation error for invalid name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Name is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.post.mockRejectedValue(axiosError);

      const createRequest: CreateCandleRequest = {
        name: '',
        price: 20,
        containerId: 'container1',
        aromaId: 'aroma1'
      };

      await expect(CandleService.create(createRequest)).rejects.toThrow('El nombre no es válido');
    });

    it('should handle validation error for invalid price', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Price must be a positive number' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.post.mockRejectedValue(axiosError);

      const createRequest: CreateCandleRequest = {
        name: 'Test Candle',
        price: -5,
        containerId: 'container1',
        aromaId: 'aroma1'
      };

      await expect(CandleService.create(createRequest)).rejects.toThrow('El precio no es válido');
    });
  });

  describe('createWithFiles', () => {
    it('should create candle with files successfully', async () => {
      const audioFile = new File(['audio'], 'audio.mp3', { type: 'audio/mpeg' });
      const labelFile = new File(['label'], 'label.jpg', { type: 'image/jpeg' });
      const modelFile = new File(['model'], 'model.glb', { type: 'model/gltf-binary' });

      const createRequest: CreateCandleWithFilesRequest = {
        name: 'New Candle',
        description: 'A new candle with files',
        price: 25,
        message: 'Test message',
        containerId: 'container1',
        aromaId: 'aroma1',
        userId: 'user1',
        audioFile,
        labelFile,
        modelFile,
        labelName: 'Custom Label',
        labelDescription: 'Custom label description',
        labelType: 'AI_GENERATED',
        labelAiPrompt: 'Generate a beautiful label'
      };

      mockedAxios.post.mockResolvedValue({ data: mockCandle });

      const result = await CandleService.createWithFiles(createRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/candles/with-files',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockCandle);
    });

    it('should create candle with files without optional files', async () => {
      const createRequest: CreateCandleWithFilesRequest = {
        name: 'New Candle',
        price: 25,
        containerId: 'container1',
        aromaId: 'aroma1'
      };

      mockedAxios.post.mockResolvedValue({ data: mockCandle });

      const result = await CandleService.createWithFiles(createRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/candles/with-files',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockCandle);
    });

    it('should handle file upload error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 413,
        data: { message: 'File too large' },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.post.mockRejectedValue(axiosError);

      const createRequest: CreateCandleWithFilesRequest = {
        name: 'New Candle',
        price: 25,
        containerId: 'container1',
        aromaId: 'aroma1',
        audioFile: new File(['large audio'], 'audio.mp3', { type: 'audio/mpeg' })
      };

      await expect(CandleService.createWithFiles(createRequest)).rejects.toThrow('File too large');
    });
  });

  describe('update', () => {
    it('should update candle successfully', async () => {
      const updateRequest: UpdateCandleRequest = {
        name: 'Updated Candle',
        description: 'Updated description',
        price: 30,
        isActive: false
      };

      const updatedCandle = { ...mockCandle, ...updateRequest };
      mockedAxios.put.mockResolvedValue({ data: updatedCandle });

      const result = await CandleService.update('1', updateRequest);

      expect(mockedAxios.put).toHaveBeenCalledWith('/candles/1', updateRequest);
      expect(result).toEqual(updatedCandle);
    });

    it('should handle update validation error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Required fields missing' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.put.mockRejectedValue(axiosError);

      const updateRequest: UpdateCandleRequest = {
        name: ''
      };

      await expect(CandleService.update('1', updateRequest)).rejects.toThrow('Faltan campos obligatorios por completar');
    });
  });

  describe('delete', () => {
    it('should delete candle successfully', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await CandleService.delete('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/candles/1');
    });

    it('should handle delete error for purchased candle', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Cannot delete candle with existing orders' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.delete.mockRejectedValue(axiosError);

      await expect(CandleService.delete('1')).rejects.toThrow('No se puede eliminar esta vela porque ya ha sido comprada');
    });

    it('should handle forbidden delete error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 403,
        data: { message: 'Forbidden' },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.delete.mockRejectedValue(axiosError);

      await expect(CandleService.delete('1')).rejects.toThrow('No tienes permisos para acceder a este recurso');
    });
  });

  describe('assignAroma', () => {
    it('should assign aroma to candle successfully', async () => {
      const updatedCandle = { ...mockCandle, aroma: { ...mockCandle.aroma, id: 'aroma2' } };
      mockedAxios.patch.mockResolvedValue({ data: updatedCandle });

      const result = await CandleService.assignAroma('1', 'aroma2');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/candles/1/assign-aroma/aroma2');
      expect(result).toEqual(updatedCandle);
    });

    it('should handle invalid aroma assignment', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid aroma ID' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.patch.mockRejectedValue(axiosError);

      await expect(CandleService.assignAroma('1', 'invalid')).rejects.toThrow('El aroma seleccionado no es válido');
    });
  });

  describe('assignContainer', () => {
    it('should assign container to candle successfully', async () => {
      const updatedCandle = { ...mockCandle, container: { ...mockCandle.container, id: 'container2' } };
      mockedAxios.patch.mockResolvedValue({ data: updatedCandle });

      const result = await CandleService.assignContainer('1', 'container2');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/candles/1/assign-container/container2');
      expect(result).toEqual(updatedCandle);
    });

    it('should handle invalid container assignment', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid container ID' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.patch.mockRejectedValue(axiosError);

      await expect(CandleService.assignContainer('1', 'invalid')).rejects.toThrow('El contenedor seleccionado no es válido');
    });
  });

  describe('assignUser', () => {
    it('should assign user to candle successfully', async () => {
      const updatedCandle = { ...mockCandle, user: { id: 'user2', name: 'Jane Doe', email: 'jane@example.com' } };
      mockedAxios.patch.mockResolvedValue({ data: updatedCandle });

      const result = await CandleService.assignUser('1', 'user2');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/candles/1/assign-user/user2');
      expect(result).toEqual(updatedCandle);
    });

    it('should handle user assignment error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'User not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.patch.mockRejectedValue(axiosError);

      await expect(CandleService.assignUser('1', 'invalid')).rejects.toThrow('La vela no fue encontrada');
    });
  });

  describe('getContainers', () => {
    it('should fetch containers successfully', async () => {
      const mockContainers = [mockContainer];
      mockedAxios.get.mockResolvedValue({ data: mockContainers });

      const result = await CandleService.getContainers();

      expect(mockedAxios.get).toHaveBeenCalledWith('/candles/containers');
      expect(result).toEqual(mockContainers);
    });

    it('should handle error fetching containers', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getContainers()).rejects.toThrow('Error interno del servidor. Intenta de nuevo más tarde');
    });
  });

  describe('getGifts', () => {
    it('should fetch gifts successfully', async () => {
      const mockGifts = [mockGift];
      mockedAxios.get.mockResolvedValue({ data: mockGifts });

      const result = await CandleService.getGifts();

      expect(mockedAxios.get).toHaveBeenCalledWith('/candles/gifts');
      expect(result).toEqual(mockGifts);
    });

    it('should handle error fetching gifts', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getGifts()).rejects.toThrow('El servidor no está disponible temporalmente');
    });
  });

  describe('Error Translation', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';
      
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(CandleService.getAll()).rejects.toThrow('La conexión ha tardado demasiado. Intenta de nuevo');
    });

    it('should handle connection refused error', async () => {
      const connectionError = new AxiosError('Request failed');
      connectionError.code = 'ENOTFOUND';
      
      mockedAxios.get.mockRejectedValue(connectionError);

      await expect(CandleService.getAll()).rejects.toThrow('No se pudo conectar al servidor. Verifica tu conexión');
    });

    it('should handle gateway timeout error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 504,
        data: { message: 'Gateway timeout' },
        statusText: 'Gateway Timeout',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getAll()).rejects.toThrow('El servidor tardó demasiado en responder. Intenta de nuevo');
    });

    it('should handle bad gateway error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 502,
        data: { message: 'Bad gateway' },
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getAll()).rejects.toThrow('Problema de conectividad con el servidor');
    });

    it('should handle unknown server error with custom message', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 422,
        data: { message: 'Custom validation error' },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as any
      };
      
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CandleService.getAll()).rejects.toThrow('Custom validation error');
    });

    it('should handle non-AxiosError exceptions', async () => {
      const genericError = new Error('Generic error');
      
      mockedAxios.get.mockRejectedValue(genericError);

      await expect(CandleService.getAll()).rejects.toThrow('Error de conexión inesperado');
    });
  });
});
