import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeletePlaceButton } from '@/components/places/delete-place-button'
import { PlaceService } from '@/services/places/place.service'
import { useToast } from '@/hooks/use-toast'
import { Place } from '@/types/place'

// Mock dependencies
jest.mock('@/services/places/place.service', () => ({
  PlaceService: {
    delete: jest.fn(),
  },
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}))

const mockPlaceService = PlaceService as jest.Mocked<typeof PlaceService>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('DeletePlaceButton', () => {
  const user = userEvent.setup()
  const mockOnDelete = jest.fn()
  const mockToast = jest.fn()
  
  const mockPlace: Place = {
    id: '1',
    name: 'Sala de estar',
    icon: '🛋️',
    description: 'Lugar para relajarse y recibir visitas',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    })
  })

  it('renders delete button with trash icon', () => {
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveClass('h-8', 'w-8')
    
    // Check for trash icon (lucide-react icon)
    const trashIcon = deleteButton.querySelector('svg')
    expect(trashIcon).toBeInTheDocument()
  })

  it('opens confirmation dialog when delete button is clicked', async () => {
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDelete} />)
    
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Check dialog elements
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`"${mockPlace.name}"`))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('closes dialog when cancel is clicked', async () => {
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  it('successfully deletes place when confirmed', async () => {
    mockPlaceService.delete.mockResolvedValue(undefined)
    
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDelete} />)

    // Open dialog
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockPlaceService.delete).toHaveBeenCalledWith(mockPlace.id)
      expect(mockToast).toHaveBeenCalledWith({
        title: "Lugar eliminado",
        description: "El lugar ha sido eliminado correctamente",
      })
      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  it('handles deletion error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const mockOnDeleteError = jest.fn()
    mockPlaceService.delete.mockRejectedValue(new Error('Delete failed'))
    
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDeleteError} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockPlaceService.delete).toHaveBeenCalledWith(mockPlace.id)
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "No se pudo eliminar el lugar",
        variant: "destructive",
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting place:', expect.any(Error))
    })

    // onDelete should not be called on error
    expect(mockOnDeleteError).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  

  it('handles place without name gracefully', async () => {
    const placeWithoutName = { ...mockPlace, name: '' }
    
    render(<DeletePlaceButton place={placeWithoutName} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Should still show confirmation dialog
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()
  })

  it('maintains proper dialog accessibility', async () => {
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Dialog should be properly focused
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    
    // Should have proper ARIA attributes
    expect(dialog).toHaveAttribute('role', 'alertdialog')
  })

  it('does not call onDelete if service fails', async () => {
    const mockOnDeleteError = jest.fn()
    mockPlaceService.delete.mockRejectedValue(new Error('Network error'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<DeletePlaceButton place={mockPlace} onDelete={mockOnDeleteError} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockPlaceService.delete).toHaveBeenCalledWith(mockPlace.id)
    })

    // onDelete should not be called on error
    expect(mockOnDeleteError).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
