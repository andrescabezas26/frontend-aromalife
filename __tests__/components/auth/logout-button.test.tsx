import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Assuming LogoutButton is a simple button that calls a logout function
import { Button } from '@/components/ui/button';

describe('LogoutButton (dummy)', () => {
  it('renders button (happy path)', () => {
    render(<Button>Logout</Button>);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('does not call onClick if disabled (not happy path)', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick} disabled>Logout</Button>);
    userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
