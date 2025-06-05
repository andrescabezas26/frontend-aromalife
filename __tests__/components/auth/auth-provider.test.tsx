import { render, screen } from '@testing-library/react';

// Happy path: renders children
import { AuthProvider } from '@/components/auth/auth-provider';

describe('AuthProvider', () => {
  it('renders children (happy path)', () => {
    render(
      <AuthProvider>
        <div>Contenido protegido</div>
      </AuthProvider>
    );
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
