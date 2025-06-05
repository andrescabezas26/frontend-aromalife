import { render, screen } from '@testing-library/react'
import { CartIcon } from '@/components/nav/cart-icon'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'

// Mock Next.js navigation
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// Mock stores
jest.mock('@/stores/cart-store')
jest.mock('@/stores/auth-store')

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

describe('CartIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should render cart icon with link when authenticated', () => {    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/cart')
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show text when showText prop is true', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon showText={true} />)
    
    const textElements = screen.getAllByText('Carrito')
    expect(textElements.length).toBeGreaterThan(0)
  })

  it('should not show badge when cart is empty', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('should show badge with item count when cart has items', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(3),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    const badgeElements = screen.getAllByText('3')
    expect(badgeElements.length).toBeGreaterThan(0)
  })

  it('should show "99+" when item count exceeds 99', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(150),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    const badgeElements = screen.getAllByText('99+')
    expect(badgeElements.length).toBeGreaterThan(0)
  })

  it('should apply custom className when provided', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon className="custom-class" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should use different button variants correctly', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(0),
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    const { rerender } = render(<CartIcon variant="outline" />)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<CartIcon variant="default" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle edge case with exactly 99 items', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })
    mockUseCartStore.mockReturnValue({
      getItemCount: jest.fn().mockReturnValue(99),
      items: [],
      addItem: jest.fn(),      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    })

    render(<CartIcon />)
    
    const badgeElements = screen.getAllByText('99')
    expect(badgeElements.length).toBeGreaterThan(0)
    expect(screen.queryByText('99+')).not.toBeInTheDocument()
  })
})
