import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteUserButton } from '@/components/users/delete-user-button'
import { useAdminUsersStore } from '@/stores/users-store'
import { useToast } from '@/hooks/use-toast'

// Mock the stores and hooks
jest.mock('@/stores/users-store', () => ({
  useAdminUsersStore: jest.fn(),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}))

describe('DeleteUserButton', () => {
  const mockDeleteUser = jest.fn()
  const mockToast = jest.fn()
  const mockDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAdminUsersStore as jest.Mock).mockReturnValue({
      deleteUser: mockDeleteUser,
      loading: false,
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
      dismiss: mockDismiss,
      toasts: [],
    })
  })

  it('renders the delete button', () => {
    render(<DeleteUserButton userId="1" userName="John Doe" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('opens the confirmation dialog when clicking the delete button', () => {
    render(<DeleteUserButton userId="1" userName="John Doe" />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows cancel and delete buttons in the dialog', () => {
    render(<DeleteUserButton userId="1" userName="John Doe" />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('deletes the user when confirming', async () => {
    render(<DeleteUserButton userId="1" userName="John Doe" />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1')
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente',
        variant: 'default',
      })
    })
  })

  it('handles errors during deletion', async () => {
    const error = new Error('Delete failed')
    mockDeleteUser.mockRejectedValueOnce(error)

    render(<DeleteUserButton userId="1" userName="John Doe" />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al eliminar',
        description: 'Delete failed',
        variant: 'destructive',
      })
    })
  })

  it('disables the delete button while loading', () => {
    ;(useAdminUsersStore as jest.Mock).mockReturnValue({
      deleteUser: mockDeleteUser,
      loading: true,
    })

    render(<DeleteUserButton userId="1" userName="John Doe" />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Eliminando...')).toBeDisabled()
  })

  it('closes the dialog when clicking cancel', () => {
    render(<DeleteUserButton userId="1" userName="John Doe" />)
    
    // Open dialog
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancelar'))
    
    // Dialog should be closed
    expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
  })
})
