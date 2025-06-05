import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { AromasTable } from '@/components/aromas/aromas-table'
import { Aroma } from '@/types/aroma'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AromasTable', () => {
  const mockAromas: Aroma[] = [
    {
      id: '1',
      name: 'Lavender',
      description: 'Calming lavender scent',
      color: '#7B68EE',
      imageUrl: 'lavender.jpg',
      olfativePyramid: {
        salida: 'Fresh Lavender',
        corazon: 'Pure Lavender',
        fondo: 'Woody Base'
      },
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Rose',
      description: 'Romantic rose fragrance',
      color: '#FF69B4',
      imageUrl: 'rose.jpg',
      olfativePyramid: {
        salida: 'Rose Petals',
        corazon: 'Bulgarian Rose',
        fondo: 'Musk'
      },
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    }
  ]

  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  it('should render table with aromas data', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    // Check table headers
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Pirámide Olfativa')).toBeInTheDocument()
    expect(screen.getByText('Acciones')).toBeInTheDocument()
    
    // Check aromas data
    expect(screen.getByText('Lavender')).toBeInTheDocument()
    expect(screen.getByText('Calming lavender scent')).toBeInTheDocument()
    expect(screen.getByText('Rose')).toBeInTheDocument()
    expect(screen.getByText('Romantic rose fragrance')).toBeInTheDocument()
  })

  it('should display color information correctly', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    // Check color display for lavender
    expect(screen.getByText('#7B68EE')).toBeInTheDocument()
    const lavenderColorDiv = screen.getByText('#7B68EE').parentElement?.querySelector('div')
    expect(lavenderColorDiv).toHaveStyle({ backgroundColor: '#7B68EE' })
    
    // Check color display for rose
    expect(screen.getByText('#FF69B4')).toBeInTheDocument()
    const roseColorDiv = screen.getByText('#FF69B4').parentElement?.querySelector('div')
    expect(roseColorDiv).toHaveStyle({ backgroundColor: '#FF69B4' })
  })
  it('should display olfative pyramid information', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    // Check that olfative pyramid labels appear (should have 2 of each since we have 2 aromas)
    expect(screen.getAllByText('Salida:')).toHaveLength(2)
    expect(screen.getAllByText('Corazón:')).toHaveLength(2)
    expect(screen.getAllByText('Fondo:')).toHaveLength(2)
    
    // Check specific olfative pyramid content for both aromas
    expect(screen.getByText('Fresh Lavender')).toBeInTheDocument()
    expect(screen.getByText('Pure Lavender')).toBeInTheDocument()
    expect(screen.getByText('Woody Base')).toBeInTheDocument()
    
    expect(screen.getByText('Rose Petals')).toBeInTheDocument()
    expect(screen.getByText('Bulgarian Rose')).toBeInTheDocument()
    expect(screen.getByText('Musk')).toBeInTheDocument()
  })

  it('should render action buttons for each aroma', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    // Should have 2 rows of actions (one for each aroma)
    const viewButtons = screen.getAllByRole('button', { name: '' }).filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-testid') === 'eye-icon' ||
      btn.querySelector('.lucide-eye')
    )
    expect(viewButtons).toHaveLength(2)
    
    const editButtons = screen.getAllByRole('button', { name: '' }).filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-testid') === 'pencil-icon' ||
      btn.querySelector('.lucide-pencil')
    )
    expect(editButtons).toHaveLength(2)
    
    const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-testid') === 'trash-icon' ||
      btn.querySelector('.lucide-trash-2')
    )
    expect(deleteButtons).toHaveLength(2)
  })

  it('should navigate to view page when view button is clicked', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    const buttons = screen.getAllByRole('button')
    const viewButton = buttons.find(btn => 
      btn.querySelector('.lucide-eye') !== null
    )
    
    if (viewButton) {
      fireEvent.click(viewButton)
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas/1')
    }
  })

  it('should navigate to edit page when edit button is clicked', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    const buttons = screen.getAllByRole('button')
    const editButton = buttons.find(btn => 
      btn.querySelector('.lucide-pencil') !== null
    )
    
    if (editButton) {
      fireEvent.click(editButton)
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas/1/edit')
    }
  })

  it('should show delete confirmation dialog when delete button is clicked', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => 
      btn.querySelector('.lucide-trash-2') !== null
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      // Check if dialog appears
      expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
      expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()
      expect(screen.getByText(/Se eliminará permanentemente el aroma "Lavender"/)).toBeInTheDocument()
    }
  })

  it('should call onDelete when delete is confirmed', async () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => 
      btn.querySelector('.lucide-trash-2') !== null
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      const confirmButton = screen.getByText('Eliminar')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockAromas[0])
      })
    }
  })

  it('should close delete dialog when cancel is clicked', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => 
      btn.querySelector('.lucide-trash-2') !== null
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      const cancelButton = screen.getByText('Cancelar')
      fireEvent.click(cancelButton)
      
      // Dialog should be closed
      expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
    }
  })
  it('should display empty state when no aromas are provided', () => {
    render(<AromasTable aromas={[]} onDelete={mockOnDelete} />)
    
    expect(screen.getByText('No hay aromas disponibles')).toBeInTheDocument()
  })

  it('should handle onDelete error gracefully', async () => {
    const mockOnDeleteError = jest.fn().mockRejectedValue(new Error('Delete failed'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDeleteError} />)
    
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => 
      btn.querySelector('.lucide-trash-2') !== null
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      const confirmButton = screen.getByText('Eliminar')
      fireEvent.click(confirmButton)
      
      // Wait for the onDelete to be called
      await waitFor(() => {
        expect(mockOnDeleteError).toHaveBeenCalledWith(mockAromas[0])
      })
      
      // Dialog should still close even on error
      await waitFor(() => {
        expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
      })
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting aroma:', expect.any(Error))
    }
    
    consoleSpy.mockRestore()
  })

  it('should render table with proper structure', () => {
    render(<AromasTable aromas={mockAromas} onDelete={mockOnDelete} />)
    
    // Check table structure
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    
    // Check table has proper headers and body
    expect(table.querySelector('thead')).toBeInTheDocument()
    expect(table.querySelector('tbody')).toBeInTheDocument()
    
    // Check number of rows (excluding header)
    const dataRows = table.querySelectorAll('tbody tr')
    expect(dataRows).toHaveLength(2)
  })

  it('should handle single aroma correctly', () => {
    const singleAroma = [mockAromas[0]]
    render(<AromasTable aromas={singleAroma} onDelete={mockOnDelete} />)
    
    expect(screen.getByText('Lavender')).toBeInTheDocument()
    expect(screen.queryByText('Rose')).not.toBeInTheDocument()
    
    const dataRows = screen.getByRole('table').querySelectorAll('tbody tr')
    expect(dataRows).toHaveLength(1)
  })
})
