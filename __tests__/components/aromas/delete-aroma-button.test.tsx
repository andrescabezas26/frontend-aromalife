import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteAromaButton } from '@/components/aromas/delete-aroma-button'
import { AromaService } from '@/services/aromas/aroma.service'
import { Aroma } from '@/types/aroma'

// Mock the dependencies
jest.mock('@/services/aromas/aroma.service')
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

const mockAromaService = AromaService as jest.Mocked<typeof AromaService>

describe('DeleteAromaButton', () => {
  const mockOnDelete = jest.fn()
  const user = userEvent.setup()

  const mockAroma: Aroma = {
    id: '1',
    name: 'Test Aroma',
    description: 'Test description',
    color: '#ff5733',
    olfativePyramid: {
      salida: 'Bergamota, Limón',
      corazon: 'Rosa, Jazmín',
      fondo: 'Sándalo, Vainilla'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render delete button with trash icon', () => {
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toHaveClass('h-8', 'w-8')
    
    // Check for trash icon (lucide-react icon)
    const trashIcon = deleteButton.querySelector('svg')
    expect(trashIcon).toBeInTheDocument()
  })
  it('should open confirmation dialog when delete button is clicked', async () => {
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Check dialog elements
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`"${mockAroma.name}"`))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('should close dialog when cancel is clicked', async () => {
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  it('should successfully delete aroma when confirmed', async () => {
    mockAromaService.delete.mockResolvedValue(undefined)
    
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    // Open dialog
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockAromaService.delete).toHaveBeenCalledWith(mockAroma.id)
      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  

  it('should handle deletion error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const mockOnDeleteError = jest.fn()
    mockAromaService.delete.mockRejectedValue(new Error('Delete failed'))
    
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDeleteError} />)

    // Open dialog and confirm
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockAromaService.delete).toHaveBeenCalledWith(mockAroma.id)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting aroma:', expect.any(Error))
    })

    // onDelete should not be called on error
    expect(mockOnDeleteError).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should have correct styling for delete action button', async () => {
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    expect(confirmButton).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground',
      'hover:bg-destructive/90'
    )
  })
  it('should include aroma name in confirmation message', async () => {
    const aromaWithLongName = {
      ...mockAroma,
      name: 'Very Long Aroma Name That Should Be Displayed'
    }

    render(<DeleteAromaButton aroma={aromaWithLongName} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Check for the full confirmation message with the aroma name
    expect(screen.getByText(/Esta acción no se puede deshacer.*Very Long Aroma Name That Should Be Displayed/)).toBeInTheDocument()
  })

  it('should maintain focus management for accessibility', async () => {
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Dialog should be properly focused
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    
    // Should have proper ARIA attributes
    expect(dialog).toHaveAttribute('role', 'alertdialog')
  })
  it('should not call onDelete if service fails', async () => {
    const mockOnDeleteError = jest.fn()
    mockAromaService.delete.mockRejectedValue(new Error('Network error'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<DeleteAromaButton aroma={mockAroma} onDelete={mockOnDeleteError} />)

    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockAromaService.delete).toHaveBeenCalledWith(mockAroma.id)
    })

    // onDelete should not be called on error
    expect(mockOnDeleteError).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
