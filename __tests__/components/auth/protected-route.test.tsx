import { render, screen } from '@testing-library/react';

jest.mock('@/stores/auth-store');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const useAuthStore = require('@/stores/auth-store').useAuthStore;
const useRouter = require('next/navigation').useRouter;
const ProtectedRoute = require('@/components/auth/protected-route').default;

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children if authenticated (happy path)', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('shows loading if isLoading (happy path)', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(
      <ProtectedRoute>
        <div>Should not render</div>
      </ProtectedRoute>
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('redirects if not authenticated (not happy path)', () => {
    const replace = jest.fn();
    useAuthStore.mockReturnValue({ isAuthenticated: false, isLoading: false });
    useRouter.mockReturnValue({ replace });
    render(
      <ProtectedRoute>
        <div>Should not render</div>
      </ProtectedRoute>
    );
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
