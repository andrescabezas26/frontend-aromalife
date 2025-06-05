// Tests para LabelForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LabelForm } from '@/components/labels/label-form';
import { Label } from '@/services/labels/labels.service';

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('LabelForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los campos del formulario correctamente (happy path)', () => {
    render(<LabelForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/nombre de la etiqueta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByText(/imagen de la etiqueta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
  });

  it('muestra errores de validación cuando faltan campos requeridos (not happy path)', async () => {
    render(<LabelForm onSubmit={mockOnSubmit} />);
    
    // Intentar enviar formulario vacío
    fireEvent.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la imagen es requerida/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pre-llena el formulario cuando se proporciona una etiqueta existente', () => {
    const existingLabel: Label = {
      id: 'label-1',
      name: 'Etiqueta Existente',
      description: 'Descripción existente',
      imageUrl: 'https://example.com/image.jpg',
      type: 'template',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    render(<LabelForm label={existingLabel} onSubmit={mockOnSubmit} />);
    
    expect((screen.getByLabelText(/nombre de la etiqueta/i) as HTMLInputElement).value).toBe('Etiqueta Existente');
    expect((screen.getByLabelText(/descripción/i) as HTMLTextAreaElement).value).toBe('Descripción existente');
    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument();
    
    // Verificar que se muestra la imagen existente
    expect(screen.getByAltText(/vista previa de la etiqueta/i)).toBeInTheDocument();
  });

});
