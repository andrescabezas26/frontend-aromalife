// Tests para GiftSelector
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { GiftSelector } from '@/components/cart/gift-selector';

// Mock de GiftService
jest.mock('@/services/gifts/gift.service', () => ({
  GiftService: {
    getAll: jest.fn(),
  },
}));

// Mock de useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const { GiftService } = require('@/services/gifts/gift.service');

const mockGifts = [
  { id: '1', name: 'Regalo 1', description: 'Desc 1', price: 10, imageUrl: '' },
  { id: '2', name: 'Regalo 2', description: 'Desc 2', price: 20, imageUrl: '' },
];

describe('GiftSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título del componente (happy path)', () => {
    GiftService.getAll.mockResolvedValue(mockGifts);
    
    render(<GiftSelector onAddGift={jest.fn()} />);
    
    expect(screen.getByText('Agregar Regalo al Carrito')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay regalos disponibles (not happy path)', async () => {
    GiftService.getAll.mockResolvedValue([]);
    
    render(<GiftSelector onAddGift={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/no hay regalos disponibles/i)).toBeInTheDocument();
    });
  });
});
