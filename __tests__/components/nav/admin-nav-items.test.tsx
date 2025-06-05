import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminNavItems } from '@/components/nav/admin-nav-items'
import { useAuthStore } from '@/stores/auth-store'
import { usePathname } from 'next/navigation'

// Mock dependencies
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('AdminNavItems', () => {
  const user = userEvent.setup()
  const mockLogout = jest.fn()
  
  const mockUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@aromalife.com',
    profilePicture: 'https://example.com/avatar.jpg',
    roles: ['admin']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/admin/dashboard')
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      loading: false,
      error: null,
      clearError: jest.fn(),
    })
  })

  it('renders dashboard and store navigation links', () => {
    render(<AdminNavItems />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Ir a Tienda')).toBeInTheDocument()
    
    // Check links are correct
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const storeLink = screen.getByText('Ir a Tienda').closest('a')
    
    expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard')
    expect(storeLink).toHaveAttribute('href', '/home')
  })

  it('highlights active dashboard link when on dashboard page', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    render(<AdminNavItems />)

    const dashboardButton = screen.getByText('Dashboard')
    expect(dashboardButton).toHaveClass('bg-muted')
  })

  it('does not highlight dashboard link when on other admin pages', () => {
    mockUsePathname.mockReturnValue('/admin/users')
    render(<AdminNavItems />)

    const dashboardButton = screen.getByText('Dashboard')
    expect(dashboardButton).not.toHaveClass('bg-muted')
  })

  it('renders user avatar fallback when no profile picture', () => {
    mockUseAuthStore.mockReturnValue({
      user: { ...mockUser, profilePicture: '' },
      logout: mockLogout,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      loading: false,
      error: null,
      clearError: jest.fn(),
    })

    render(<AdminNavItems />)

    // Should show first letter of name as fallback
    expect(screen.getByText('A')).toBeInTheDocument()
  })


})
