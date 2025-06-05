import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteContainerButton } from '@/components/containers/delete-container-button';
import '@testing-library/jest-dom';
import { ContainerService } from '@/services/containers/container.service';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/services/containers/container.service');
jest.mock('@/hooks/use-toast');

describe('DeleteContainerButton', () => {
  const container = {
    id: '123',
    name: 'Contenedor de prueba',
    basePrice: 1000,
  };

  const onDeleteMock = jest.fn();
  const toastMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: toastMock });
  });

  it('renders delete button with trash icon', () => {
    render(<DeleteContainerButton container={container} onDelete={onDeleteMock} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('h-8', 'w-8');
    // Icon is rendered as svg inside button, check by role img or svg element
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('opens confirmation dialog when delete button clicked', () => {
    render(<DeleteContainerButton container={container} onDelete={onDeleteMock} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText(`Esta acción no se puede deshacer. Esto eliminará permanentemente el contenedor "${container.name}".`)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('cancels delete when cancel button clicked', () => {
    render(<DeleteContainerButton container={container} onDelete={onDeleteMock} />);
    fireEvent.click(screen.getByRole('button'));

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Diálogo debe cerrarse (el texto de título ya no aparece)
    expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
  });
});
