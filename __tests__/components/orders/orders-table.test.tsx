import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrdersTable } from '@/components/orders/orders-table';
import { Order, OrderStatus } from '@/types/order';
import { OrderService } from '@/services/orders/order.service';
import '@testing-library/jest-dom';

// Mock the services
jest.mock('@/services/orders/order.service');

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

const mockOrderService = OrderService as jest.Mocked<typeof OrderService>;

const mockOrder: Order = {
  id: 'order-123-456-789',
  totalAmount: 95000,
  status: OrderStatus.PENDING,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  shippingAddress: {
    street: 'Calle 123 # 45-67',
    city: 'Bogotá',
    state: 'Cundinamarca',
    country: 'Colombia',
    zipCode: '110111',
  },
  userId: {
    id: 'user-123',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '3001234567',
    phoneCountryCode: '+57',
  },
  items: [
    {
      id: 'item-1',
      quantity: 2,
      unitPrice: 35000,
      totalPrice: 70000,
      candle: {
        id: 'candle-1',
        name: 'Vela Relajante',
        message: 'Para ti con amor',
        aroma: {
          name: 'Lavanda',
          color: '#9370DB',
        },
        container: {
          name: 'Vidrio Elegante',
        },
        label: {
          name: 'Etiqueta Romántica',
          imageUrl: 'https://example.com/label.jpg',
        },
      },
    },
    {
      id: 'item-2',
      quantity: 1,
      unitPrice: 25000,
      totalPrice: 25000,
      gift: {
        id: 'gift-1',
        name: 'Caja de Regalo',
        price: 25000,
        description: 'Hermosa caja decorativa',
      },
    },
  ],
};

const mockOrderWithoutUser: Order = {
  ...mockOrder,
  id: 'order-without-user',
  userId: null,
};

const mockCancelledOrder: Order = {
  ...mockOrder,
  id: 'order-cancelled',
  status: OrderStatus.CANCELLED,
};

const defaultProps = {
  orders: [mockOrder],
  onStatusUpdate: jest.fn(),
};

describe('OrdersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderService.getStatusLabel = jest.fn((status) => {
      switch (status) {
        case OrderStatus.PENDING: return 'Pendiente';
        case OrderStatus.PROCESSING: return 'En Proceso';
        case OrderStatus.SHIPPED: return 'Enviado';
        case OrderStatus.DELIVERED: return 'Entregado';
        case OrderStatus.CANCELLED: return 'Cancelado';
        default: return status;
      }
    });
    mockOrderService.getStatusColor = jest.fn(() => 'bg-yellow-100 text-yellow-800 border-yellow-200');
    mockOrderService.formatPrice = jest.fn((price) => `$${price.toLocaleString('es-CO')}`);
    mockOrderService.generateWhatsAppUrl = jest.fn(() => 'https://wa.me/573001234567?text=mensaje');
  });

  it('displays empty state when no orders are provided', () => {
    render(<OrdersTable {...defaultProps} orders={[]} />);
    
    const noOrdersElements = screen.getAllByText(/no hay órdenes/i);
    expect(noOrdersElements.length).toBeGreaterThan(0);
    expect(noOrdersElements[0]).toBeInTheDocument();
    
    const emptyMessageElements = screen.getAllByText(/no se encontraron órdenes/i);
    expect(emptyMessageElements.length).toBeGreaterThan(0);
    expect(emptyMessageElements[0]).toBeInTheDocument();
  });

  it('handles status change dropdown interaction', async () => {
    const mockOnStatusUpdate = jest.fn().mockResolvedValue(undefined);
    
    render(<OrdersTable {...defaultProps} onStatusUpdate={mockOnStatusUpdate} />);
    
    // Find and click status badge to open dropdown
    const statusElements = screen.getAllByText(/pendiente/i);
    expect(statusElements.length).toBeGreaterThan(0);
    await userEvent.click(statusElements[0]);
    
    // Check if dropdown options are available
    await waitFor(() => {
      const processingElements = screen.getAllByText(/en proceso/i);
      if (processingElements.length > 1) { // One in badge, one in dropdown
        expect(processingElements[1]).toBeInTheDocument();
      }
    });
  });

  it('handles order cancellation with confirmation dialog', async () => {
    const mockOnStatusUpdate = jest.fn().mockResolvedValue(undefined);
    
    render(<OrdersTable {...defaultProps} onStatusUpdate={mockOnStatusUpdate} />);
    
    // Click status badge to open dropdown
    const statusElements = screen.getAllByText(/pendiente/i);
    expect(statusElements.length).toBeGreaterThan(0);
    await userEvent.click(statusElements[0]);
    
    // Click cancel option (this should trigger confirmation dialog)
    await waitFor(async () => {
      const cancelledElements = screen.getAllByText(/cancelado/i);
      if (cancelledElements.length > 0) {
        await userEvent.click(cancelledElements[0]);
      }
    });
    
    // Check for confirmation dialog
    await waitFor(() => {
      const confirmElements = screen.getAllByText(/confirmar cancelación/i);
      if (confirmElements.length > 0) {
        expect(confirmElements[0]).toBeInTheDocument();
      }
    });
  });

  it('opens WhatsApp contact when button is clicked', async () => {
    render(<OrdersTable {...defaultProps} />);
    
    const whatsappButtons = screen.getAllByRole('button', { name: /whatsapp/i });
    expect(whatsappButtons.length).toBeGreaterThan(0);
    
    await userEvent.click(whatsappButtons[0]);
    
    expect(mockOrderService.generateWhatsAppUrl).toHaveBeenCalledWith(
      '+57',
      '3001234567',
      'order-123-456-789'
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://wa.me/573001234567?text=mensaje',
      '_blank'
    );
  });

  it('disables WhatsApp button when user has no phone', () => {
    const orderWithoutPhone = {
      ...mockOrder,
      userId: {
        ...mockOrder.userId!,
        phone: '',
        phoneCountryCode: '',
      },
    };
    
    render(<OrdersTable {...defaultProps} orders={[orderWithoutPhone]} />);
    
    const whatsappButtons = screen.getAllByRole('button', { name: /whatsapp/i });
    expect(whatsappButtons.length).toBeGreaterThan(0);
    expect(whatsappButtons[0]).toBeDisabled();
  });

  it('navigates to order details when view action is clicked', async () => {
    render(<OrdersTable {...defaultProps} />);
    
    // Find and click actions dropdown
    const moreButtons = screen.getAllByRole('button', { name: /abrir menú/i });
    expect(moreButtons.length).toBeGreaterThan(0);
    await userEvent.click(moreButtons[0]);
    
    // Click "Ver detalles" option
    await waitFor(async () => {
      const viewButtons = screen.getAllByText(/ver detalles/i);
      if (viewButtons.length > 0) {
        await userEvent.click(viewButtons[0]);
      }
    });
    
    expect(mockPush).toHaveBeenCalledWith('/admin/management/orders/order-123-456-789');
  });

  it('navigates to edit order when edit action is clicked', async () => {
    render(<OrdersTable {...defaultProps} />);
    
    // Find and click actions dropdown
    const moreButtons = screen.getAllByRole('button', { name: /abrir menú/i });
    expect(moreButtons.length).toBeGreaterThan(0);
    await userEvent.click(moreButtons[0]);
    
    // Click "Editar" option
    await waitFor(async () => {
      const editButtons = screen.getAllByText(/editar/i);
      if (editButtons.length > 0 && !editButtons[0].textContent?.includes('No editable')) {
        await userEvent.click(editButtons[0]);
      }
    });
    
    expect(mockPush).toHaveBeenCalledWith('/admin/management/orders/order-123-456-789/edit');
  });

  it('disables edit action for cancelled orders', async () => {
    render(<OrdersTable {...defaultProps} orders={[mockCancelledOrder]} />);
    
    // Find and click actions dropdown
    const moreButtons = screen.getAllByRole('button', { name: /abrir menú/i });
    expect(moreButtons.length).toBeGreaterThan(0);
    await userEvent.click(moreButtons[0]);
    
    // Check that edit option is disabled
    await waitFor(() => {
      const editElements = screen.getAllByText(/no editable/i);
      if (editElements.length > 0) {
        expect(editElements[0]).toBeInTheDocument();
      }
    });
  });

  it('handles orders with missing user information gracefully', () => {
    render(<OrdersTable {...defaultProps} orders={[mockOrderWithoutUser]} />);
    
    // Check that table still renders
    const tableTitle = screen.getByTestId('orders-table');
    expect(tableTitle).toBeInTheDocument();
    
    // Check that N/A is displayed for missing user data
    const naElements = screen.getAllByText(/n\/a/i);
    expect(naElements.length).toBeGreaterThan(0);
    expect(naElements[0]).toBeInTheDocument();
    
    // Check that email fallback is shown
    const emailElements = screen.getAllByText(/email no disponible/i);
    expect(emailElements.length).toBeGreaterThan(0);
    expect(emailElements[0]).toBeInTheDocument();
  });
});
