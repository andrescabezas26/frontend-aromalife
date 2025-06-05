// Tests para GiftForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GiftForm } from '@/components/gifts/gift-form';

// Mock del componente GiftImageUpload
jest.mock('@/components/ui/gift-image-upload', () => ({
  GiftImageUpload: ({ value, onChange, onRemove, disabled }: any) => (
    <div>
      <input
        data-testid="gift-image-upload"
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        disabled={disabled}
      />
      <button
        data-testid="remove-image"
        onClick={onRemove}
        type="button"
      >
        Quitar imagen
      </button>
      {value && <div data-testid="current-image">{typeof value === 'string' ? value : 'File selected'}</div>}
    </div>
  ),
}));

describe('GiftForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los campos del formulario correctamente (happy path)', () => {
    render(<GiftForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio base/i)).toBeInTheDocument();
    expect(screen.getByTestId('gift-image-upload')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
  });

  it('envía datos válidos del formulario (happy path)', async () => {
    render(<GiftForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Regalo Test' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Descripción del regalo' } });
    fireEvent.change(screen.getByLabelText(/precio base/i), { target: { value: '25.99' } });
    
    fireEvent.click(screen.getByRole('button', { name: /crear/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Regalo Test',
          description: 'Descripción del regalo',
          price: 25.99,
        }),
        undefined
      );
    });
  });

});
