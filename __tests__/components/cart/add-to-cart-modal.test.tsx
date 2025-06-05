// Tests para AddToCartModal
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AddToCartModal } from '@/components/cart/add-to-cart-modal';

const mockCandle = {
  id: '1',
  name: 'Vela de prueba',
  description: 'Una vela para testing',
  price: 25.99,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  container: { id: '1', name: 'Container', price: 10, imageUrl: '' },
  aroma: { id: '1', name: 'Aroma', price: 5, color: '#fff', imageUrl: '' },
};

describe('AddToCartModal', () => {


  it('llama a onConfirm al hacer click en añadir (happy path)', async () => {
    const onConfirm = jest.fn();
    render(
      <AddToCartModal
        open={true}
        onOpenChange={() => {}}
        candle={mockCandle}
        onConfirm={onConfirm}
      />
    );
    const addBtn = screen.getByRole('button', { name: /añadir al carrito/i });
    await userEvent.click(addBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('no renderiza nada cuando candle es null (not happy path)', () => {
    const { container } = render(
      <AddToCartModal
        open={true}
        onOpenChange={() => {}}
        candle={null}
        onConfirm={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
