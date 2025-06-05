import { render, screen } from '@testing-library/react';

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(),
}));

const { useAuthStore } = require('@/stores/auth-store');
const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/test-path',
}));

const { RoleGuard } = require('@/components/auth/role-guard');

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children if user has required role (happy path)', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { roles: ['admin'] } });
    render(
      <RoleGuard requiredRoles={['admin']}>
        <div>Contenido admin</div>
      </RoleGuard>
    );
    expect(screen.getByText('Contenido admin')).toBeInTheDocument();
  });

  it('renders children if no requiredRoles and authenticated (happy path)', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { roles: ['user'] } });
    render(
      <RoleGuard>
        <div>Contenido libre</div>
      </RoleGuard>
    );
    expect(screen.getByText('Contenido libre')).toBeInTheDocument();
  });

  it('redirects if user does not have required role (not happy path)', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { roles: ['user'] } });
    render(
      <RoleGuard requiredRoles={['admin']} hideContent={false}>
        <div>Should not render</div>
      </RoleGuard>
    );
    expect(replace).toHaveBeenCalled();
  });
});
