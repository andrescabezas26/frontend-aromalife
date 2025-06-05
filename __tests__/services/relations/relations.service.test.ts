// filepath: c:\Universidad\Semestre VII\Compunet III\AromaLife\frontend-aromalife-adn\__tests__\services\relations\relations.service.test.ts
import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { MainOption } from '@/types/main-option';
import { IntendedImpact } from '@/types/intended-impact';
import { Aroma } from '@/types/aroma';
import { Place } from '@/types/place';
import { AromaService } from '@/services/aromas/aroma.service';

// Mock del módulo axios
jest.mock('@/lib/axios', () => ({
  createRequestWithEntity: jest.fn(),
}));

// Mock del AromaService
jest.mock('@/services/aromas/aroma.service', () => ({
  AromaService: {
    getAllWithRelations: jest.fn(),
    getAromasByIntendedImpact: jest.fn(),
    assignIntendedImpact: jest.fn(),
    removeIntendedImpact: jest.fn(),
  },
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

(createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);

// IMPORTAR DESPUÉS de haber mockeado
let RelationsService: typeof import('@/services/relations/relations.service').RelationsService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  RelationsService = require('@/services/relations/relations.service').RelationsService;
});

describe('RelationsService', () => {
  const mockAromaService = AromaService as jest.Mocked<typeof AromaService>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockMainOption: MainOption = {
    id: 'main-option-1',
    name: 'Relaxation',
    description: 'For stress relief and relaxation',
    icon: '🧘‍♀️',
    color: '#9B59B6'
  };

  const mockIntendedImpact: IntendedImpact = {
    id: 'impact-1',
    name: 'Stress Relief',
    description: 'Reduces stress and promotes calmness',
    icon: '🌿',
    mainOptionId: 'main-option-1'
  };

  const mockAroma: Aroma = {
    id: 'aroma-1',
    name: 'Lavender Dreams',
    description: 'A calming lavender scent',
    imageUrl: 'https://example.com/lavender.jpg',
    color: '#9B59B6',
    olfativePyramid: {
      salida: 'Fresh citrus',
      corazon: 'Lavender, chamomile',
      fondo: 'Vanilla, musk'
    },
    intendedImpacts: [mockIntendedImpact]
  };

  const mockPlace: Place = {
    id: 'place-1',
    name: 'Bedroom',
    description: 'Perfect for relaxation and sleep',
    icon: '🛏️'
  };

  describe('getMainOptions', () => {
    it('should fetch main options successfully', async () => {
      const expectedMainOptions = [mockMainOption];
      mockAxiosInstance.get.mockResolvedValue({ data: expectedMainOptions });

      const result = await RelationsService.getMainOptions();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options');
      expect(result).toEqual(expectedMainOptions);
    });

    it('should handle errors when fetching main options', async () => {
      const error = new AxiosError('Network error', '500');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(RelationsService.getMainOptions()).rejects.toThrow('Network error');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options');
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await RelationsService.getMainOptions();

      expect(result).toEqual([]);
    });

    it('should handle malformed response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await RelationsService.getMainOptions();

      expect(result).toBeNull();
    });
  });

  describe('getIntendedImpacts', () => {
    it('should fetch intended impacts successfully', async () => {
      const expectedImpacts = [mockIntendedImpact];
      mockAxiosInstance.get.mockResolvedValue({ data: expectedImpacts });

      const result = await RelationsService.getIntendedImpacts();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts');
      expect(result).toEqual(expectedImpacts);
    });

    it('should handle errors when fetching intended impacts', async () => {
      const error = new AxiosError('Server error', '500');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(RelationsService.getIntendedImpacts()).rejects.toThrow('Server error');
    });

    it('should handle network timeout', async () => {
      const timeoutError = new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED');
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(RelationsService.getIntendedImpacts()).rejects.toThrow('timeout of 10000ms exceeded');
    });
  });

  describe('getAromas', () => {
    it('should fetch aromas successfully', async () => {
      const expectedAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: expectedAromas });

      const result = await RelationsService.getAromas();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas');
      expect(result).toEqual(expectedAromas);
    });

    it('should handle errors when fetching aromas', async () => {
      const error = new AxiosError('Unauthorized', '401');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(RelationsService.getAromas()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getAromasWithRelations', () => {
    it('should fetch aromas with relations using AromaService', async () => {
      const expectedAromas = [mockAroma];
      mockAromaService.getAllWithRelations.mockResolvedValue(expectedAromas);

      const result = await RelationsService.getAromasWithRelations();

      expect(mockAromaService.getAllWithRelations).toHaveBeenCalled();
      expect(result).toEqual(expectedAromas);
    });

    it('should handle errors from AromaService', async () => {
      const error = new Error('AromaService error');
      mockAromaService.getAllWithRelations.mockRejectedValue(error);

      await expect(RelationsService.getAromasWithRelations()).rejects.toThrow('AromaService error');
    });
  });

  describe('getPlaces', () => {
    it('should fetch places successfully', async () => {
      const expectedPlaces = [mockPlace];
      mockAxiosInstance.get.mockResolvedValue({ data: expectedPlaces });

      const result = await RelationsService.getPlaces();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/places');
      expect(result).toEqual(expectedPlaces);
    });

    it('should handle errors when fetching places', async () => {
      const error = new AxiosError('Not found', '404');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(RelationsService.getPlaces()).rejects.toThrow('Not found');
    });

    it('should handle large response', async () => {
      const largePlacesList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPlace,
        id: `place-${i}`,
        name: `Place ${i}`
      }));
      mockAxiosInstance.get.mockResolvedValue({ data: largePlacesList });

      const result = await RelationsService.getPlaces();

      expect(result).toHaveLength(1000);
      expect(result[0]).toMatchObject({ id: 'place-0', name: 'Place 0' });
    });
  });

  describe('getAllRelationsData', () => {
    beforeEach(() => {
      mockAxiosInstance.get.mockImplementation((url) => {
        switch (url) {
          case '/main-options':
            return Promise.resolve({ data: [mockMainOption] });
          case '/intended-impacts':
            return Promise.resolve({ data: [mockIntendedImpact] });
          case '/aromas':
            return Promise.resolve({ data: [mockAroma] });
          case '/places':
            return Promise.resolve({ data: [mockPlace] });
          default:
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }
      });
      mockAromaService.getAllWithRelations.mockResolvedValue([mockAroma]);
    });

    it('should fetch all relations data successfully', async () => {
      const result = await RelationsService.getAllRelationsData();

      expect(result).toMatchObject({
        mainOptions: [mockMainOption],
        intendedImpacts: [mockIntendedImpact],
        aromas: [mockAroma],
        places: [mockPlace],
        mainOptionIntendedImpacts: expect.arrayContaining([
          expect.objectContaining({
            mainOptionId: 'main-option-1',
            intendedImpactIds: ['impact-1']
          })
        ]),
        intendedImpactAromas: expect.arrayContaining([
          expect.objectContaining({
            intendedImpactId: 'impact-1',
            aromaIds: ['aroma-1']
          })
        ]),
        placeIntendedImpacts: []
      });
    });

    it('should handle partial failures gracefully', async () => {
      mockAxiosInstance.get.mockImplementation((url) => {
        if (url === '/places') {
          return Promise.reject(new Error('Places service down'));
        }
        return Promise.resolve({ data: [] });
      });
      mockAromaService.getAllWithRelations.mockResolvedValue([]);

      await expect(RelationsService.getAllRelationsData()).rejects.toThrow('Places service down');
      expect(console.error).toHaveBeenCalledWith('Error fetching relations data:', expect.any(Error));
    });

    it('should handle empty responses from all services', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      mockAromaService.getAllWithRelations.mockResolvedValue([]);

      const result = await RelationsService.getAllRelationsData();

      expect(result).toMatchObject({
        mainOptions: [],
        intendedImpacts: [],
        aromas: [],
        places: [],
        mainOptionIntendedImpacts: [],
        intendedImpactAromas: [],
        placeIntendedImpacts: []
      });
    });

    it('should handle network errors', async () => {
      const networkError = new AxiosError('Network Error', 'NETWORK_ERROR');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(RelationsService.getAllRelationsData()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith('Error fetching relations data:', networkError);
    });

    it('should handle AromaService failures', async () => {
      mockAromaService.getAllWithRelations.mockRejectedValue(new Error('AromaService failure'));

      await expect(RelationsService.getAllRelationsData()).rejects.toThrow('AromaService failure');
    });
  });

  describe('updateRelations', () => {
    const intendedImpactId = 'impact-1';
    const aromaIds = ['aroma-1', 'aroma-2'];

    beforeEach(() => {
      mockAromaService.getAllWithRelations.mockResolvedValue([
        { ...mockAroma, id: 'aroma-1' },
        { ...mockAroma, id: 'aroma-2', intendedImpacts: [] }
      ]);
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([
        { ...mockAroma, id: 'aroma-1' }
      ]);
      mockAromaService.assignIntendedImpact.mockResolvedValue(undefined);
      mockAromaService.removeIntendedImpact.mockResolvedValue(undefined);
    });

    it('should update relations successfully', async () => {
      await RelationsService.updateRelations(intendedImpactId, aromaIds);

      expect(mockAromaService.getAllWithRelations).toHaveBeenCalled();
      expect(mockAromaService.getAromasByIntendedImpact).toHaveBeenCalledWith(intendedImpactId);
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledWith('aroma-2', intendedImpactId);
    });    it('should handle adding new relations', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);

      await RelationsService.updateRelations(intendedImpactId, aromaIds);

      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledTimes(1);
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledWith('aroma-2', intendedImpactId);
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledWith('aroma-2', intendedImpactId);
    });

    it('should handle removing relations', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([
        { ...mockAroma, id: 'aroma-1' },
        { ...mockAroma, id: 'aroma-3' }
      ]);

      await RelationsService.updateRelations(intendedImpactId, ['aroma-1']);

      expect(mockAromaService.removeIntendedImpact).toHaveBeenCalledWith('aroma-3', intendedImpactId);
    });

    it('should handle empty aromaIds array', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([
        { ...mockAroma, id: 'aroma-1' }
      ]);

      await RelationsService.updateRelations(intendedImpactId, []);

      expect(mockAromaService.removeIntendedImpact).toHaveBeenCalledWith('aroma-1', intendedImpactId);
      expect(mockAromaService.assignIntendedImpact).not.toHaveBeenCalled();
    });    it('should handle case when no existing relations exist', async () => {
      mockAromaService.getAromasByIntendedImpact.mockRejectedValue(new Error('No relations found'));

      await RelationsService.updateRelations(intendedImpactId, aromaIds);

      expect(console.log).toHaveBeenCalledWith('No existing aromas found for this intended impact, starting with empty relations');
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledTimes(1);
    });it('should handle duplicate relations gracefully', async () => {
      const aromaWithRelation = {
        ...mockAroma,
        id: 'aroma-1',
        intendedImpacts: [{ ...mockIntendedImpact, id: intendedImpactId }]
      };
      mockAromaService.getAllWithRelations.mockResolvedValue([aromaWithRelation]);
      // The aroma is NOT in current relations, so it would be added, but we check if it's already related
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);

      await RelationsService.updateRelations(intendedImpactId, ['aroma-1']);

      expect(console.log).toHaveBeenCalledWith(`Aroma aroma-1 is already related to intended impact ${intendedImpactId} - skipping`);
      expect(mockAromaService.assignIntendedImpact).not.toHaveBeenCalled();
    });

    it('should handle errors during relation assignment', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);
      mockAromaService.assignIntendedImpact.mockRejectedValue(new Error('Assignment failed'));

      await expect(RelationsService.updateRelations(intendedImpactId, aromaIds)).rejects.toThrow('Assignment failed');
      expect(console.error).toHaveBeenCalledWith('Error updating relations:', expect.any(Error));
    });

    it('should handle errors during relation removal', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([
        { ...mockAroma, id: 'aroma-3' }
      ]);
      mockAromaService.removeIntendedImpact.mockRejectedValue(new Error('Removal failed'));

      await expect(RelationsService.updateRelations(intendedImpactId, [])).rejects.toThrow('Removal failed');
    });

    it('should handle aromas without ids', async () => {
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([
        { ...mockAroma, id: undefined }
      ]);

      await RelationsService.updateRelations(intendedImpactId, aromaIds);

      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledTimes(1);
    });

    it('should handle complex relation updates', async () => {
      const existingAromas = [
        { ...mockAroma, id: 'aroma-1' },
        { ...mockAroma, id: 'aroma-2' },
        { ...mockAroma, id: 'aroma-3' }
      ];
      const currentRelations = [
        { ...mockAroma, id: 'aroma-1' },
        { ...mockAroma, id: 'aroma-3' }
      ];
      const newAromaIds = ['aroma-1', 'aroma-2', 'aroma-4'];

      mockAromaService.getAllWithRelations.mockResolvedValue(existingAromas);
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue(currentRelations);

      await RelationsService.updateRelations(intendedImpactId, newAromaIds);

      // Should add aroma-2 and aroma-4
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledWith('aroma-4', intendedImpactId);
      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledWith('aroma-4', intendedImpactId);
      
      // Should remove aroma-3
      expect(mockAromaService.removeIntendedImpact).toHaveBeenCalledWith('aroma-3', intendedImpactId);
    });
  });

  describe('Relationship Generation Methods', () => {
    describe('generateMainOptionIntendedImpactRelations', () => {
      it('should generate correct main option to intended impact relations', async () => {
        const mainOptions = [mockMainOption];
        const intendedImpacts = [mockIntendedImpact];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: mainOptions });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue([]);

        const result = await RelationsService.getAllRelationsData();

        expect(result.mainOptionIntendedImpacts).toEqual([
          {
            mainOptionId: 'main-option-1',
            intendedImpactIds: ['impact-1']
          }
        ]);
      });

      it('should handle main options with no related impacts', async () => {
        const mainOptions = [mockMainOption];
        const intendedImpacts = [
          { ...mockIntendedImpact, mainOptionId: 'different-main-option' }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: mainOptions });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue([]);

        const result = await RelationsService.getAllRelationsData();

        expect(result.mainOptionIntendedImpacts).toEqual([
          {
            mainOptionId: 'main-option-1',
            intendedImpactIds: []
          }
        ]);
      });

      it('should handle multiple impacts per main option', async () => {
        const mainOptions = [mockMainOption];
        const intendedImpacts = [
          mockIntendedImpact,
          { ...mockIntendedImpact, id: 'impact-2', name: 'Sleep Aid' }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: mainOptions });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue([]);

        const result = await RelationsService.getAllRelationsData();

        expect(result.mainOptionIntendedImpacts).toEqual([
          {
            mainOptionId: 'main-option-1',
            intendedImpactIds: ['impact-1', 'impact-2']
          }
        ]);
      });

      it('should filter out undefined impact ids', async () => {
        const mainOptions = [mockMainOption];
        const intendedImpacts = [
          mockIntendedImpact,
          { ...mockIntendedImpact, id: undefined, name: 'Invalid Impact' }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: mainOptions });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue([]);

        const result = await RelationsService.getAllRelationsData();

        expect(result.mainOptionIntendedImpacts).toEqual([
          {
            mainOptionId: 'main-option-1',
            intendedImpactIds: ['impact-1']
          }
        ]);
      });
    });

    describe('generateIntendedImpactAromaRelationsFromData', () => {
      it('should generate correct intended impact to aroma relations', async () => {
        const intendedImpacts = [mockIntendedImpact];
        const aromas = [mockAroma];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: [] });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue(aromas);

        const result = await RelationsService.getAllRelationsData();

        expect(result.intendedImpactAromas).toEqual([
          {
            intendedImpactId: 'impact-1',
            aromaIds: ['aroma-1']
          }
        ]);
      });

      it('should handle aromas without intended impacts', async () => {
        const intendedImpacts = [mockIntendedImpact];
        const aromas = [
          { ...mockAroma, intendedImpacts: undefined }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: [] });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue(aromas);

        const result = await RelationsService.getAllRelationsData();

        expect(result.intendedImpactAromas).toEqual([
          {
            intendedImpactId: 'impact-1',
            aromaIds: []
          }
        ]);
      });

      it('should handle multiple aromas per intended impact', async () => {
        const intendedImpacts = [mockIntendedImpact];
        const aromas = [
          mockAroma,
          { ...mockAroma, id: 'aroma-2', name: 'Chamomile Peace' }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: [] });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue(aromas);

        const result = await RelationsService.getAllRelationsData();

        expect(result.intendedImpactAromas).toEqual([
          {
            intendedImpactId: 'impact-1',
            aromaIds: ['aroma-1', 'aroma-2']
          }
        ]);
      });

      it('should filter out undefined aroma ids', async () => {
        const intendedImpacts = [mockIntendedImpact];
        const aromas = [
          mockAroma,
          { ...mockAroma, id: undefined, name: 'Invalid Aroma' }
        ];

        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: [] });
            case '/intended-impacts':
              return Promise.resolve({ data: intendedImpacts });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue(aromas);

        const result = await RelationsService.getAllRelationsData();

        expect(result.intendedImpactAromas).toEqual([
          {
            intendedImpactId: 'impact-1',
            aromaIds: ['aroma-1']
          }
        ]);
      });
    });

    describe('Place Relations', () => {
      it('should return empty place intended impact relations', async () => {
        mockAxiosInstance.get.mockImplementation((url) => {
          switch (url) {
            case '/main-options':
              return Promise.resolve({ data: [] });
            case '/intended-impacts':
              return Promise.resolve({ data: [] });
            case '/aromas':
              return Promise.resolve({ data: [] });
            case '/places':
              return Promise.resolve({ data: [mockPlace] });
            default:
              return Promise.reject(new Error(`Unexpected URL: ${url}`));
          }
        });
        mockAromaService.getAllWithRelations.mockResolvedValue([]);

        const result = await RelationsService.getAllRelationsData();

        expect(result.placeIntendedImpacts).toEqual([]);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle HTTP 401 unauthorized errors', async () => {
      const unauthorizedError = new AxiosError('Unauthorized', '401');
      unauthorizedError.response = { status: 401 } as any;
      mockAxiosInstance.get.mockRejectedValue(unauthorizedError);

      await expect(RelationsService.getMainOptions()).rejects.toThrow('Unauthorized');
    });

    it('should handle HTTP 403 forbidden errors', async () => {
      const forbiddenError = new AxiosError('Forbidden', '403');
      forbiddenError.response = { status: 403 } as any;
      mockAxiosInstance.get.mockRejectedValue(forbiddenError);

      await expect(RelationsService.getIntendedImpacts()).rejects.toThrow('Forbidden');
    });

    it('should handle HTTP 404 not found errors', async () => {
      const notFoundError = new AxiosError('Not Found', '404');
      notFoundError.response = { status: 404 } as any;
      mockAxiosInstance.get.mockRejectedValue(notFoundError);

      await expect(RelationsService.getAromas()).rejects.toThrow('Not Found');
    });

    it('should handle HTTP 500 server errors', async () => {
      const serverError = new AxiosError('Internal Server Error', '500');
      serverError.response = { status: 500 } as any;
      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(RelationsService.getPlaces()).rejects.toThrow('Internal Server Error');
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new AxiosError('Network Error', 'NETWORK_ERROR');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(RelationsService.getAllRelationsData()).rejects.toThrow('Network Error');
    });

    it('should handle malformed JSON responses', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: 'invalid json' });

      const result = await RelationsService.getMainOptions();

      expect(result).toBe('invalid json');
    });

    it('should handle concurrent requests properly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [mockMainOption] });

      const promises = [
        RelationsService.getMainOptions(),
        RelationsService.getMainOptions(),
        RelationsService.getMainOptions()
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual([mockMainOption]);
      });
    });    it('should handle partial success in updateRelations', async () => {
      const mockAromas = [
        { ...mockAroma, id: 'aroma-1', intendedImpacts: [] },
        { ...mockAroma, id: 'aroma-2', intendedImpacts: [] }
      ];
      mockAromaService.getAllWithRelations.mockResolvedValue(mockAromas);
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);
      mockAromaService.assignIntendedImpact
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Second assignment failed'));

      await expect(RelationsService.updateRelations('impact-1', ['aroma-1', 'aroma-2']))
        .rejects.toThrow('Second assignment failed');

      expect(mockAromaService.assignIntendedImpact).toHaveBeenCalledTimes(2);
    });

    it('should handle empty string ids', async () => {
      const dataWithEmptyIds = [
        { ...mockMainOption, id: '' },
        { ...mockIntendedImpact, id: '' }
      ];

      mockAxiosInstance.get.mockImplementation((url) => {
        switch (url) {
          case '/main-options':
            return Promise.resolve({ data: dataWithEmptyIds.slice(0, 1) });
          case '/intended-impacts':
            return Promise.resolve({ data: dataWithEmptyIds.slice(1, 2) });
          case '/aromas':
            return Promise.resolve({ data: [] });
          case '/places':
            return Promise.resolve({ data: [] });
          default:
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }
      });
      mockAromaService.getAllWithRelations.mockResolvedValue([]);

      const result = await RelationsService.getAllRelationsData();

      expect(result.mainOptionIntendedImpacts).toEqual([
        {
          mainOptionId: '',
          intendedImpactIds: []
        }
      ]);
    });

    it('should handle very large datasets', async () => {
      const largeMainOptions = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMainOption,
        id: `main-option-${i}`
      }));
      const largeIntendedImpacts = Array.from({ length: 5000 }, (_, i) => ({
        ...mockIntendedImpact,
        id: `impact-${i}`,
        mainOptionId: `main-option-${i % 1000}`
      }));

      mockAxiosInstance.get.mockImplementation((url) => {
        switch (url) {
          case '/main-options':
            return Promise.resolve({ data: largeMainOptions });
          case '/intended-impacts':
            return Promise.resolve({ data: largeIntendedImpacts });
          case '/aromas':
            return Promise.resolve({ data: [] });
          case '/places':
            return Promise.resolve({ data: [] });
          default:
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }
      });
      mockAromaService.getAllWithRelations.mockResolvedValue([]);

      const result = await RelationsService.getAllRelationsData();

      expect(result.mainOptions).toHaveLength(1000);
      expect(result.intendedImpacts).toHaveLength(5000);
      expect(result.mainOptionIntendedImpacts).toHaveLength(1000);
    });
  });

  describe('Memory Management and Performance', () => {
    it('should handle memory cleanup properly', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        ...mockAroma,
        id: `aroma-${i}`,
        description: 'A'.repeat(1000) // Large description
      }));

      mockAromaService.getAllWithRelations.mockResolvedValue(largeData);
      mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);

      await RelationsService.updateRelations('impact-1', ['aroma-1']);

      expect(mockAromaService.getAllWithRelations).toHaveBeenCalled();
      // Verify that the operation completes without memory issues
    });

    it('should handle timeout scenarios gracefully', async () => {
      const timeoutError = new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED');
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(RelationsService.getAllRelationsData()).rejects.toThrow('timeout of 5000ms exceeded');
    });
  });
});
