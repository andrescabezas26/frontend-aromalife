import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AromaForm } from '@/components/aromas/aroma-form'
import { Aroma } from '@/types/aroma'

// Mock the hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('AromaForm', () => {
  const mockOnSubmit = jest.fn()
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

  it('should render form fields correctly', () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    // Basic information section
    expect(screen.getByText('Información Básica')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByLabelText('Color')).toBeInTheDocument()

    // Olfative pyramid section
    expect(screen.getByText('Pirámide Olfativa')).toBeInTheDocument()
    expect(screen.getByLabelText('Notas de Salida')).toBeInTheDocument()
    expect(screen.getByLabelText('Notas de Corazón')).toBeInTheDocument()
    expect(screen.getByLabelText('Notas de Fondo')).toBeInTheDocument()

    // Submit button
    expect(screen.getByRole('button', { name: 'Crear aroma' })).toBeInTheDocument()
  })
  it('should populate form with existing aroma data', () => {
    render(<AromaForm aroma={mockAroma} onSubmit={mockOnSubmit} />)

    expect(screen.getByDisplayValue('Test Aroma')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    
    // Check color inputs - there are two inputs with the same value
    const colorInputs = screen.getAllByDisplayValue('#ff5733')
    expect(colorInputs).toHaveLength(2) // color picker and text input
    
    expect(screen.getByDisplayValue('Bergamota, Limón')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rosa, Jazmín')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sándalo, Vainilla')).toBeInTheDocument()

    // Submit button should show edit text
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('should handle basic information input changes', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText('Nombre')
    const descriptionInput = screen.getByLabelText('Descripción')

    await user.type(nameInput, 'New Aroma Name')
    await user.type(descriptionInput, 'New aroma description')

    expect(nameInput).toHaveValue('New Aroma Name')
    expect(descriptionInput).toHaveValue('New aroma description')
  })
  it('should handle color input changes', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    // Target the text input specifically (not the color picker)
    const colorTextInput = screen.getByPlaceholderText('#000000')
    await user.clear(colorTextInput)
    await user.type(colorTextInput, '#ff0000')

    expect(colorTextInput).toHaveValue('#ff0000')
  })

  it('should handle olfative pyramid input changes', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    const salidaInput = screen.getByLabelText('Notas de Salida')
    const corazonInput = screen.getByLabelText('Notas de Corazón')
    const fondoInput = screen.getByLabelText('Notas de Fondo')

    await user.type(salidaInput, 'Bergamota')
    await user.type(corazonInput, 'Rosa')
    await user.type(fondoInput, 'Sándalo')

    expect(salidaInput).toHaveValue('Bergamota')
    expect(corazonInput).toHaveValue('Rosa')
    expect(fondoInput).toHaveValue('Sándalo')
  })
  it('should submit form with correct data', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    // Fill form
    await user.type(screen.getByLabelText('Nombre'), 'Test Aroma')
    await user.type(screen.getByLabelText('Descripción'), 'Test description')
    
    // Target the text input specifically (not the color picker)
    const colorTextInput = screen.getByPlaceholderText('#000000')
    await user.clear(colorTextInput)
    await user.type(colorTextInput, '#ff5733')
    
    await user.type(screen.getByLabelText('Notas de Salida'), 'Bergamota')
    await user.type(screen.getByLabelText('Notas de Corazón'), 'Rosa')
    await user.type(screen.getByLabelText('Notas de Fondo'), 'Sándalo')

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Crear aroma' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Aroma',
        description: 'Test description',
        color: '#ff5733',
        olfativePyramid: {
          salida: 'Bergamota',
          corazon: 'Rosa',
          fondo: 'Sándalo'
        }
      })
    })
  })

  it('should handle form submission error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'))

    render(<AromaForm onSubmit={mockOnSubmit} />)

    // Fill required fields
    await user.type(screen.getByLabelText('Nombre'), 'Test Aroma')
    await user.type(screen.getByLabelText('Descripción'), 'Test description')
    await user.type(screen.getByLabelText('Notas de Salida'), 'Bergamota')
    await user.type(screen.getByLabelText('Notas de Corazón'), 'Rosa')
    await user.type(screen.getByLabelText('Notas de Fondo'), 'Sándalo')

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Crear aroma' }))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting form:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should show loading state when isLoading is true', () => {
    render(<AromaForm onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: 'Guardando...' })
    expect(submitButton).toBeDisabled()
  })

  it('should validate required fields', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText('Nombre')
    const descriptionInput = screen.getByLabelText('Descripción')
    const salidaInput = screen.getByLabelText('Notas de Salida')
    const corazonInput = screen.getByLabelText('Notas de Corazón')
    const fondoInput = screen.getByLabelText('Notas de Fondo')

    expect(nameInput).toBeRequired()
    expect(descriptionInput).toBeRequired()
    expect(salidaInput).toBeRequired()
    expect(corazonInput).toBeRequired()
    expect(fondoInput).toBeRequired()
  })

  it('should have correct placeholders for olfative pyramid fields', () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    expect(screen.getByPlaceholderText('Ej: Bergamota, Limón, Pomelo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: Rosa, Jazmín, Lavanda')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: Sándalo, Vainilla, Almizcle')).toBeInTheDocument()
  })
  it('should handle color validation pattern', () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    const colorTextInput = screen.getByPlaceholderText('#000000')
    expect(colorTextInput).toHaveAttribute('pattern', '^#[0-9A-Fa-f]{6}$')
  })

  it('should call onSubmit when form is submitted', async () => {
    render(<AromaForm onSubmit={mockOnSubmit} />)

    // Fill required fields
    await user.type(screen.getByLabelText('Nombre'), 'Test Aroma')
    await user.type(screen.getByLabelText('Descripción'), 'Test description')
    await user.type(screen.getByLabelText('Notas de Salida'), 'Bergamota')
    await user.type(screen.getByLabelText('Notas de Corazón'), 'Rosa')
    await user.type(screen.getByLabelText('Notas de Fondo'), 'Sándalo')

    // Submit form by clicking the button
    await user.click(screen.getByRole('button', { name: 'Crear aroma' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
