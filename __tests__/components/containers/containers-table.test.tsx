import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContainersTable } from '@/components/containers/containers-table'
import '@testing-library/jest-dom'
import { Container } from '@/types/container'

// Mock del router de Next.js
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('ContainersTable', () => {
  const containers: Container[] = [
    {
      id: '1',
      name: 'Contenedor 1',
      description: 'Descripción 1',
      basePrice: 10000,
      dimensions: { height: 50, width: 70 },
      imageUrl: 'https://example.com/image1.jpg',
    },
    {
      id: '2',
      name: 'Contenedor 2',
      description: 'Descripción 2',
      basePrice: 20000,
      dimensions: undefined,
      imageUrl: '',
    },
  ]

  const onDeleteMock = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows message when no containers', () => {
    render(<ContainersTable containers={[]} onDelete={onDeleteMock} />)
    expect(screen.getByText('No hay contenedores disponibles')).toBeInTheDocument()
  })

  it('navigates to edit page when Pencil button clicked', () => {
    render(<ContainersTable containers={containers} onDelete={onDeleteMock} />)

    // Segundo botón (Pencil) para primer contenedor
    const pencilButton = screen.getAllByRole('button')[1]
    fireEvent.click(pencilButton)

    expect(pushMock).toHaveBeenCalledWith('/admin/management/containers/1/edit')
  })

  it('opens delete confirmation dialog when Trash button clicked', () => {
    render(<ContainersTable containers={containers} onDelete={onDeleteMock} />)

    // Tercer botón (Trash) para primer contenedor
    const trashButton = screen.getAllByRole('button')[2]
    fireEvent.click(trashButton)

    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    expect(screen.getByText(/Se eliminará permanentemente el contenedor "Contenedor 1"./)).toBeInTheDocument()
  })

  it('cancels delete when cancel button clicked', () => {
    render(<ContainersTable containers={containers} onDelete={onDeleteMock} />)

    // Abrir diálogo de eliminar
    fireEvent.click(screen.getAllByRole('button')[2])

    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)

    // El diálogo debe desaparecer
    waitFor(() => {
      expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
    })
  })

  it('calls onDelete and closes dialog when delete confirmed', async () => {
    render(<ContainersTable containers={containers} onDelete={onDeleteMock} />)

    fireEvent.click(screen.getAllByRole('button')[2]) // abrir diálogo

    const deleteButton = screen.getByText('Eliminar')
    fireEvent.click(deleteButton)

    await waitFor(() => expect(onDeleteMock).toHaveBeenCalledWith(containers[0]))
    await waitFor(() => expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument())
  })
})
