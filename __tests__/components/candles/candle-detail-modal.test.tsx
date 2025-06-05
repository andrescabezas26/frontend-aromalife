import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
// MOCK 3D VIEWER to avoid three.js issues in Jest
describe('CandleDetailModal', () => {}); // placeholder to keep describe at top
jest.mock('@/components/3d/candle-viewer', () => ({
  CandleViewer: () => <div data-testid="mock-candle-viewer" />
}));
import { AdminCandleDetailModal } from '@/components/candles/admin-candle-detail-modal';
import * as CandleServiceModule from '@/services/candles/candle.service';
import { CandleDetailModal } from '@/components/candles/candle-detail-modal';

const mockCandle = {
  id: '1',
  name: 'Vela Admin',
  description: 'Vela para pruebas admin',
  price: 15000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  aroma: { id: 'a1', name: 'Canela', color: '#FFD700', price: 1200, description: 'Aroma dulce', imageUrl: '/aroma.png' },
  container: { id: 'c1', name: 'Taza', price: 2500, imageUrl: '/taza.png', description: 'Taza de cerámica' },
  label: { id: 'l1', name: 'Etiqueta Admin', imageUrl: '/etiqueta-admin.png', description: 'Etiqueta admin', text: '¡Admin!' },
  message: 'Mensaje admin',
  audioUrl: '',
  qrUrl: '/qr-admin.png',
  user: { id: 'u1', name: 'Admin', email: 'admin@email.com' },
};

describe('CandleDetailModal', () => {
  async function renderAndWait() {
    await act(async () => {
      render(
        <CandleDetailModal candle={mockCandle} open={true} onOpenChange={() => {}} />
      );
    });
    // Espera a que desaparezca el loading
    await waitFor(() => {
      expect(screen.queryByText('Cargando información de la vela...')).not.toBeInTheDocument();
    }, {timeout: 2000});
  }

  beforeAll(() => {
    jest.spyOn(CandleServiceModule.CandleService, 'getById').mockImplementation(async () => mockCandle);
  });

  it('renderiza correctamente con datos válidos (happy path)', async () => {
    await renderAndWait();
    expect(screen.getByText((content) => content.includes('Mensaje Personalizado'))).toBeInTheDocument();
    expect(screen.getByText('Canela')).toBeInTheDocument();
    expect(screen.getByText('Taza')).toBeInTheDocument();
    expect(screen.getByText('Etiqueta Admin')).toBeInTheDocument();
  });

  it('no renderiza nada si candle es null (not happy path)', () => {
    const { container } = render(
      <CandleDetailModal candle={null} open={true} onOpenChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el mensaje personalizado si existe', async () => {
    await renderAndWait();
    // Busca el texto dentro del bloque de mensaje personalizado
    expect(screen.getByText((content, node) => {
      // El mensaje puede estar entre comillas o con estilos
      return content.includes('Etiqueta personalizada') || content.includes('Mensaje admin');
    })).toBeInTheDocument();
  });
});
