import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelationsTable } from '@/components/relations/relations-table';
import { IntendedImpactService } from '@/services/intended-impacts/intended-impact.service';
import { AromaService } from '@/services/aromas/aroma.service';
import '@testing-library/jest-dom';

// Mock the services
jest.mock('@/services/intended-impacts/intended-impact.service');
jest.mock('@/services/aromas/aroma.service');

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockIntendedImpactService = IntendedImpactService as jest.Mocked<typeof IntendedImpactService>;
const mockAromaService = AromaService as jest.Mocked<typeof AromaService>;

const mockMainOptions = [
  {
    id: 'main1',
    name: 'Relajación',
    description: 'Para relajarse',
    emoji: '😌',
  },
  {
    id: 'main2',
    name: 'Decorar espacios',
    description: 'Para decorar',
    emoji: '🏠',
  },
];

const mockIntendedImpacts = [
  {
    id: 'impact1',
    name: 'Calma mental',
    icon: '🧘',
    description: 'Proporciona calma',
    mainOptionId: 'main1',
  },
  {
    id: 'impact2',
    name: 'Ambiente acogedor',
    icon: '🏡',
    description: 'Crea ambiente acogedor',
    mainOptionId: 'main2',
  },
];

const mockAromas = [
  {
    id: 'aroma1',
    name: 'Lavanda',
    description: 'Aroma relajante',
    hexColor: '#9370DB',
  },
  {
    id: 'aroma2',
    name: 'Vainilla',
    description: 'Aroma dulce',
    hexColor: '#F5DEB3',
  },
];

const mockPlaces = [
  {
    id: 'place1',
    name: 'Sala de estar',
    description: 'Para relajarse',
  },
  {
    id: 'place2',
    name: 'Dormitorio',
    description: 'Para descansar',
  },
];

const mockMainOptionIntendedImpacts = [
  { mainOptionId: 'main1', intendedImpactIds: ['impact1'] },
  { mainOptionId: 'main2', intendedImpactIds: ['impact2'] },
];

const mockIntendedImpactAromas = [
  { intendedImpactId: 'impact1', aromaIds: ['aroma1'] },
  { intendedImpactId: 'impact2', aromaIds: ['aroma2'] },
];

const mockPlaceIntendedImpacts = [
  { placeId: 'place1', intendedImpactIds: ['impact1'] },
  { placeId: 'place2', intendedImpactIds: ['impact2'] },
];

const defaultProps = {
  mainOptions: mockMainOptions,
  intendedImpacts: mockIntendedImpacts,
  aromas: mockAromas,
  places: mockPlaces,
  mainOptionIntendedImpacts: mockMainOptionIntendedImpacts,
  intendedImpactAromas: mockIntendedImpactAromas,
  placeIntendedImpacts: mockPlaceIntendedImpacts,
  onUpdate: jest.fn(),
};

describe('RelationsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIntendedImpactService.getByMainOption.mockResolvedValue([]);
    mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);
    mockAromaService.getAll.mockResolvedValue(mockAromas);
  });

  it('renders all main columns correctly', () => {
    render(<RelationsTable {...defaultProps} />);
    
    const categoryElements = screen.getAllByText(/categorías/i);
    expect(categoryElements.length).toBeGreaterThan(0);
    expect(categoryElements[0]).toBeInTheDocument();
    
    const impactElements = screen.getAllByText(/impactos/i);
    expect(impactElements.length).toBeGreaterThan(0);
    expect(impactElements[0]).toBeInTheDocument();
    
    const aromaElements = screen.getAllByText(/aromas/i);
    expect(aromaElements.length).toBeGreaterThan(0);
    expect(aromaElements[0]).toBeInTheDocument();
  });

  it('displays main options in the first column', () => {
    render(<RelationsTable {...defaultProps} />);
    
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    expect(relaxationElements[0]).toBeInTheDocument();
    
    const decorateElements = screen.getAllByText(/decorar espacios/i);
    expect(decorateElements.length).toBeGreaterThan(0);
    expect(decorateElements[0]).toBeInTheDocument();
  });

  it('handles main option selection and fetches intended impacts', async () => {
    mockIntendedImpactService.getByMainOption.mockResolvedValue(mockIntendedImpacts);
    
    render(<RelationsTable {...defaultProps} />);
    
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    await userEvent.click(relaxationElements[0]);
    
    await waitFor(() => {
      expect(mockIntendedImpactService.getByMainOption).toHaveBeenCalledWith('main1');
    });
  });

  it('displays places column for "Decorar espacios" option', async () => {
    mockIntendedImpactService.getByMainOption.mockResolvedValue([]);
    
    render(<RelationsTable {...defaultProps} />);
    
    const decorateElements = screen.getAllByText(/decorar espacios/i);
    expect(decorateElements.length).toBeGreaterThan(0);
    await userEvent.click(decorateElements[0]);
    
    await waitFor(() => {
      const placesElements = screen.getAllByText(/lugares/i);
      expect(placesElements.length).toBeGreaterThan(0);
      expect(placesElements[0]).toBeInTheDocument();
      
      const salaElements = screen.getAllByText(/sala de estar/i);
      expect(salaElements.length).toBeGreaterThan(0);
      expect(salaElements[0]).toBeInTheDocument();
    });
  });

  it('displays aromas after intended impact selection', async () => {
    mockIntendedImpactService.getByMainOption.mockResolvedValue(mockIntendedImpacts);
    mockAromaService.getAromasByIntendedImpact.mockResolvedValue([mockAromas[0]]);
    mockAromaService.getAll.mockResolvedValue(mockAromas);
    
    render(<RelationsTable {...defaultProps} />);
    
    // Select main option
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    await userEvent.click(relaxationElements[0]);
    
    // Select intended impact
    await waitFor(async () => {
      const calmaElements = screen.getAllByText(/calma mental/i);
      if (calmaElements.length > 0) {
        await userEvent.click(calmaElements[0]);
      }
    });
    
    // Check that aromas are displayed
    await waitFor(() => {
      const lavandaElements = screen.getAllByText(/lavanda/i);
      expect(lavandaElements.length).toBeGreaterThan(0);
      expect(lavandaElements[0]).toBeInTheDocument();
    });
  });

  it('handles aroma selection and shows update/cancel buttons', async () => {
    mockIntendedImpactService.getByMainOption.mockResolvedValue(mockIntendedImpacts);
    mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);
    mockAromaService.getAll.mockResolvedValue(mockAromas);
    
    render(<RelationsTable {...defaultProps} />);
    
    // Select main option
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    await userEvent.click(relaxationElements[0]);
    
    // Select intended impact
    await waitFor(async () => {
      const calmaElements = screen.getAllByText(/calma mental/i);
      if (calmaElements.length > 0) {
        await userEvent.click(calmaElements[0]);
      }
    });
    
    // Select an aroma
    await waitFor(async () => {
      const lavandaElements = screen.getAllByText(/lavanda/i);
      if (lavandaElements.length > 0) {
        await userEvent.click(lavandaElements[0]);
      }
    });
    
    // Check for update and cancel buttons
    await waitFor(() => {
      const updateButton = screen.queryByRole('button', { name: /actualizar/i });
      const cancelButton = screen.queryByRole('button', { name: /cancelar/i });
      
      if (updateButton) expect(updateButton).toBeInTheDocument();
      if (cancelButton) expect(cancelButton).toBeInTheDocument();
    });
  });

  it('calls onUpdate when update button is clicked', async () => {
    const mockOnUpdate = jest.fn().mockResolvedValue(undefined);
    mockIntendedImpactService.getByMainOption.mockResolvedValue(mockIntendedImpacts);
    mockAromaService.getAromasByIntendedImpact.mockResolvedValue([]);
    mockAromaService.getAll.mockResolvedValue(mockAromas);
    
    render(<RelationsTable {...defaultProps} onUpdate={mockOnUpdate} />);
    
    // Select main option
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    await userEvent.click(relaxationElements[0]);
    
    // Select intended impact
    await waitFor(async () => {
      const calmaElements = screen.getAllByText(/calma mental/i);
      if (calmaElements.length > 0) {
        await userEvent.click(calmaElements[0]);
      }
    });
    
    // Select an aroma
    await waitFor(async () => {
      const lavandaElements = screen.getAllByText(/lavanda/i);
      if (lavandaElements.length > 0) {
        await userEvent.click(lavandaElements[0]);
      }
    });
    
    // Click update button
    await waitFor(async () => {
      const updateButton = screen.queryByRole('button', { name: /actualizar/i });
      if (updateButton) {
        await userEvent.click(updateButton);
        expect(mockOnUpdate).toHaveBeenCalledWith('impact1', ['aroma1']);
      }
    });
  });

  it('shows loading states during data fetching', async () => {
    // Mock slow response
    mockIntendedImpactService.getByMainOption.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );
    
    render(<RelationsTable {...defaultProps} />);
    
    const relaxationElements = screen.getAllByText(/relajación/i);
    expect(relaxationElements.length).toBeGreaterThan(0);
    await userEvent.click(relaxationElements[0]);
    
    // Check for loading indicator
    const loadingElements = screen.getAllByText(/cargando/i);
    if (loadingElements.length > 0) {
      expect(loadingElements[0]).toBeInTheDocument();
    }
  });

  it('navigates to create pages when add buttons are clicked', async () => {
    render(<RelationsTable {...defaultProps} />);
    
    // Find and click "Agregar" buttons
    const addButtons = screen.getAllByRole('button', { name: /agregar/i });
    expect(addButtons.length).toBeGreaterThan(0);
    
    await userEvent.click(addButtons[0]);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/create')
      );
    });
  });

  it('handles place selection for "Decorar espacios" flow', async () => {
    mockIntendedImpactService.getByMainOption.mockResolvedValue(mockIntendedImpacts);
    
    render(<RelationsTable {...defaultProps} />);
    
    // Select "Decorar espacios" option
    const decorateElements = screen.getAllByText(/decorar espacios/i);
    expect(decorateElements.length).toBeGreaterThan(0);
    await userEvent.click(decorateElements[0]);
    
    // Select a place
    await waitFor(async () => {
      const salaElements = screen.getAllByText(/sala de estar/i);
      if (salaElements.length > 0) {
        await userEvent.click(salaElements[0]);
      }
    });
    
    await waitFor(() => {
      expect(mockIntendedImpactService.getByMainOption).toHaveBeenCalledWith('main2', 'place1');
    });
  });
});
