import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContainerForm } from '@/components/containers/container-form'
import '@testing-library/jest-dom'

// Mock del toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

import { toast } from 'sonner'

const mockSubmit = jest.fn<Promise<void>, [any, File | undefined]>().mockResolvedValue(undefined)

describe('ContainerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('renders all required inputs and the submit button', () => {
    render(<ContainerForm onSubmit={mockSubmit} />)

    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Precio Base/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Alto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ancho/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear contenedor/i })).toBeInTheDocument()
  })

  it('submits valid form data correctly', async () => {
    render(<ContainerForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Box A' } })
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Large container' } })
    fireEvent.change(screen.getByLabelText(/Precio Base/i), { target: { value: '125.50' } })
    fireEvent.change(screen.getByLabelText(/Alto/i), { target: { value: '50' } })
    fireEvent.change(screen.getByLabelText(/Ancho/i), { target: { value: '70' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear contenedor/i }))

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Box A',
        description: 'Large container',
        basePrice: 125.5,
        dimensions: {
          height: 50,
          width: 70,
          depth: 70
        }
      }),
      undefined
    )
  })

  it('shows alert error if dimensions are missing', () => {
    render(<ContainerForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Box B' } })
    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'No dimensions' } })
    fireEvent.change(screen.getByLabelText(/Precio Base/i), { target: { value: '80' } })

    // Forzar inputs vacíos para alto y ancho
    fireEvent.change(screen.getByLabelText(/Alto/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/Ancho/i), { target: { value: '' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear contenedor/i }))
    expect(mockSubmit).not.toHaveBeenCalled()
  })
})
