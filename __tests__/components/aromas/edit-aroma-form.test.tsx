import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { EditAromaForm } from '@/components/aromas/edit-aroma-form'
import { AromaService } from '@/services/aromas/aroma.service'
import { Aroma } from '@/types/aroma'

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/services/aromas/aroma.service')

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/components/aromas/aroma-form', () => ({
  AromaForm: ({ aroma, onSubmit, isLoading }: any) => (
    <div data-testid="aroma-form">
      <div>Aroma Name: {aroma?.name}</div>
      <button 
        onClick={() => onSubmit({ name: 'Updated Aroma', description: 'Updated' })}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}))

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockAromaService = AromaService as jest.Mocked<typeof AromaService>

describe('EditAromaForm', () => {
  const user = userEvent.setup()
  const aromaId = '123'

  const mockAroma: Aroma = {
    id: aromaId,
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
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: jest.fn(),
      refresh: jest.fn(),    replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  it('should show loading state initially', () => {
    mockAromaService.getById.mockImplementation(() => new Promise(() => {}))
    
    render(<EditAromaForm aromaId={aromaId} />)

    expect(screen.getByText('Cargando aroma...')).toBeInTheDocument()
    // The loading state should be visible and form should not be rendered yet
    expect(screen.queryByText('Editar Aroma')).not.toBeInTheDocument()
  })

  it('should load and display aroma data successfully', async () => {
    mockAromaService.getById.mockResolvedValue(mockAroma)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByText('Editar Aroma')).toBeInTheDocument()
      expect(screen.getByText('Modifica la información del aroma')).toBeInTheDocument()
      expect(screen.getByTestId('aroma-form')).toBeInTheDocument()
      expect(screen.getByText(`Aroma Name: ${mockAroma.name}`)).toBeInTheDocument()
    })

    expect(mockAromaService.getById).toHaveBeenCalledWith(aromaId)
  })

  it('should handle loading error and redirect', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockAromaService.getById.mockRejectedValue(new Error('Aroma not found'))
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading aroma:', expect.any(Error))
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas')
    })

    consoleErrorSpy.mockRestore()
  })

  it('should handle loading error with API error message', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const apiError = { message: 'Aroma not found in database' }
    mockAromaService.getById.mockRejectedValue(apiError)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading aroma:', apiError)
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas')
    })

    consoleErrorSpy.mockRestore()
  })

  it('should render back button and handle navigation', async () => {
    mockAromaService.getById.mockResolvedValue(mockAroma)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByText('Editar Aroma')).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: '' }) // ArrowLeft icon button
    expect(backButton).toHaveClass('h-8', 'w-8')
    
    await user.click(backButton)
    expect(mockBack).toHaveBeenCalled()
  })

  it('should handle successful form submission', async () => {
    mockAromaService.getById.mockResolvedValue(mockAroma)
    mockAromaService.update.mockResolvedValue(undefined)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByTestId('aroma-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockAromaService.update).toHaveBeenCalledWith(aromaId, {
        name: 'Updated Aroma',
        description: 'Updated'
      })
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas')
    })
  })

  it('should handle form submission error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockAromaService.getById.mockResolvedValue(mockAroma)
    mockAromaService.update.mockRejectedValue(new Error('Update failed'))
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByTestId('aroma-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating aroma:', expect.any(Error))
      expect(mockPush).not.toHaveBeenCalled() // Should not navigate on error
    })

    consoleErrorSpy.mockRestore()
  })

  it('should handle API error response with specific message', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockAromaService.getById.mockResolvedValue(mockAroma)
    
    const apiError = {
      response: {
        data: {
          message: 'Validation failed: Name already exists'
        }
      }
    }
    mockAromaService.update.mockRejectedValue(apiError)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByTestId('aroma-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating aroma:', apiError)
    })

    consoleErrorSpy.mockRestore()
  })

  it('should not render form if aroma loading failed', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockAromaService.getById.mockRejectedValue(new Error('Not found'))
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/management/aromas')
    })

    // Should not render the form
    expect(screen.queryByTestId('aroma-form')).not.toBeInTheDocument()
    expect(screen.queryByText('Editar Aroma')).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('should handle missing aromaId gracefully', () => {
    render(<EditAromaForm aromaId="" />)

    // Should not make API call with empty aromaId
    expect(mockAromaService.getById).not.toHaveBeenCalled()
  })

  it('should have proper page structure and styling', async () => {
    mockAromaService.getById.mockResolvedValue(mockAroma)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByText('Editar Aroma')).toBeInTheDocument()
    })

    // Check main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Editar Aroma')
    expect(heading).toHaveClass('text-3xl', 'font-bold')

    // Check description
    const description = screen.getByText('Modifica la información del aroma')
    expect(description).toHaveClass('text-muted-foreground', 'mt-2')
  })

  it('should pass correct props to AromaForm', async () => {
    mockAromaService.getById.mockResolvedValue(mockAroma)
    
    render(<EditAromaForm aromaId={aromaId} />)

    await waitFor(() => {
      expect(screen.getByTestId('aroma-form')).toBeInTheDocument()
      expect(screen.getByText(`Aroma Name: ${mockAroma.name}`)).toBeInTheDocument()
    })

    // Form should initially not be in loading state
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })
})
