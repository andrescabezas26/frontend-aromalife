import { render, screen, fireEvent } from '@testing-library/react'
import { NavItems } from '@/components/nav/nav-items'
import { useAuthStore } from '@/stores/auth-store'
import { usePathname } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock CartIcon component
jest.mock('@/components/nav/cart-icon', () => ({
  CartIcon: ({ className }: { className?: string }) => (
    <div data-testid="cart-icon" className={className}>Cart</div>
  ),
}))

// Mock stores
jest.mock('@/stores/auth-store')

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('NavItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/home')
  })

  it('should render login and register buttons when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const loginElements = screen.getAllByText('Iniciar Sesión')
    expect(loginElements.length).toBeGreaterThan(0)
    const registerElements = screen.getAllByText('Registrarse')
    expect(registerElements.length).toBeGreaterThan(0)
  })

  it('should render navigation links when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const homeElements = screen.getAllByText('Inicio')
    expect(homeElements.length).toBeGreaterThan(0)
    const createCandleElements = screen.getAllByText('Crear Vela')
    expect(createCandleElements.length).toBeGreaterThan(0)
    const myCandlesElements = screen.getAllByText('Mis Velas')
    expect(myCandlesElements.length).toBeGreaterThan(0)
    const myOrdersElements = screen.getAllByText('Mis Órdenes')
    expect(myOrdersElements.length).toBeGreaterThan(0)
  })

  it('should highlight active navigation item based on pathname', () => {
    mockUsePathname.mockReturnValue('/mis-velas')
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const links = screen.getAllByRole('link')
    const myCandlesLink = links.find(link => link.getAttribute('href') === '/mis-velas')
    expect(myCandlesLink?.firstChild).toHaveClass('bg-muted')
  })

  it('should show admin link for admin users', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User', email: 'admin@example.com', roles: ['admin'] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const adminElements = screen.getAllByText('Admin')
    expect(adminElements.length).toBeGreaterThan(0)
  })

  it('should show admin link for manager users', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Manager User', email: 'manager@example.com', roles: ['manager'] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const adminElements = screen.getAllByText('Admin')
    expect(adminElements.length).toBeGreaterThan(0)
  })

  it('should not show admin link for regular users', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Regular User', email: 'user@example.com', roles: ['user'] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('should render user avatar with proper fallback', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    const userMenu = screen.getByTestId('user-menu')
    expect(userMenu).toBeInTheDocument()
    
    const avatarFallback = screen.getByText('T')
    expect(avatarFallback).toBeInTheDocument()
  })


  it('should render cart icon component', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', roles: [] },
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    })

    render(<NavItems />)
    
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument()
  })
})
