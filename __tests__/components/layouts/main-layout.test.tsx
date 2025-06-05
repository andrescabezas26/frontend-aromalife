import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { MainLayout } from '@/components/layouts/main-layout'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { UserService } from '@/services/users/user.service'

// Mock de Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock de Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} data-testid="next-image" />
  ),
}))

// Mock de Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">{children}</a>
  ),
}))

// Mock de NavItems
jest.mock('@/components/nav/nav-items', () => ({
  NavItems: () => <div data-testid="nav-items">Nav Items</div>,
}))

// Mock de BackButton
jest.mock('@/components/ui/back-button', () => ({
  BackButton: () => <div data-testid="back-button">Back Button</div>,
}))

// Mock de Instagram Icon
jest.mock('@/components/ui/instagram-icon', () => ({
  InstagramIcon: ({ size }: { size: number }) => (
    <svg data-testid="instagram-icon" width={size} height={size}>
      <title>Instagram</title>
    </svg>
  ),
}))

// Mock de WhatsApp Icon
jest.mock('@/components/ui/whatsapp-icon', () => ({
  WhatsAppIcon: ({ size }: { size: number }) => (
    <svg data-testid="whatsapp-icon" width={size} height={size}>
      <title>WhatsApp</title>
    </svg>
  ),
}))

// Mock de Button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="ui-button">{children}</button>
  ),
}))

// Mock de stores
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@/stores/cart-store', () => ({
  useCartStore: jest.fn(),
}))

// Mock de UserService
jest.mock('@/services/users/user.service', () => ({
  UserService: {
    getAdminPhone: jest.fn(),
  },
}))

// Mock de Lucide icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <svg data-testid="shopping-cart-icon"><title>Shopping Cart</title></svg>,
  Package: () => <svg data-testid="package-icon"><title>Package</title></svg>,
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>
const mockUserService = UserService as jest.Mocked<typeof UserService>

describe('MainLayout', () => {
  const mockChildren = <div data-testid="main-children">Main Content</div>

  const defaultAuthStore = {
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    setUser: jest.fn(),
  }

  const defaultCartStore = {
    cart: null,
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Default mock implementations
    mockUsePathname.mockReturnValue('/some-page')
    mockUseAuthStore.mockReturnValue(defaultAuthStore)
    mockUseCartStore.mockReturnValue(defaultCartStore)
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render correctly with all main elements', () => {
    render(<MainLayout>{mockChildren}</MainLayout>)

    // Check main structure
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    // Check header elements
    expect(screen.getByTestId('next-image')).toBeInTheDocument()
    expect(screen.getByText('AROMALIFE')).toBeInTheDocument()
    expect(screen.getByText('VELAS DECORATIVAS')).toBeInTheDocument()
    expect(screen.getByTestId('nav-items')).toBeInTheDocument()

    // Check main content
    expect(screen.getByTestId('main-children')).toBeInTheDocument()

    // Check footer elements
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
    expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
  })

  it('should render logo with correct properties', () => {
    render(<MainLayout>{mockChildren}</MainLayout>)

    const logoImage = screen.getByTestId('next-image')
    expect(logoImage).toHaveAttribute('src', 'https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png')
    expect(logoImage).toHaveAttribute('alt', 'Aromalife Logo')
    expect(logoImage).toHaveAttribute('width', '40')
    expect(logoImage).toHaveAttribute('height', '40')
  })

  it('should load admin WhatsApp link successfully', async () => {
    const mockPhoneData = {
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    }
    mockUserService.getAdminPhone.mockResolvedValue(mockPhoneData)

    render(<MainLayout>{mockChildren}</MainLayout>)

    await waitFor(() => {
      expect(mockUserService.getAdminPhone).toHaveBeenCalled()
    })

    // Check that WhatsApp link is updated with admin phone
    await waitFor(() => {
      const whatsappLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href')?.includes('wa.me/573001234567'))
      expect(whatsappLink).toBeInTheDocument()
    })
  })

  it('should handle admin phone loading error and use fallback', async () => {
    const mockError = new Error('Failed to load admin phone')
    mockUserService.getAdminPhone.mockRejectedValue(mockError)

    render(<MainLayout>{mockChildren}</MainLayout>)

    await waitFor(() => {
      expect(mockUserService.getAdminPhone).toHaveBeenCalled()
    })

    // Should log error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading admin WhatsApp:', mockError)
    })

    // Should use fallback link
    await waitFor(() => {
      const fallbackLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href') === 'https://api.whatsapp.com/message/BEKRCLLN2IM7F1')
      expect(fallbackLink).toBeInTheDocument()
    })
  })

  it('should render social media links with correct attributes', async () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    render(<MainLayout>{mockChildren}</MainLayout>)

    // Check Instagram link
    const instagramLink = screen.getAllByTestId('next-link')
      .find(link => link.getAttribute('href') === 'https://www.instagram.com/velasaromalife')
    expect(instagramLink).toBeInTheDocument()

    // Wait for WhatsApp link to load
    await waitFor(() => {
      const whatsappLinks = screen.getAllByTestId('next-link')
        .filter(link => link.getAttribute('href')?.includes('wa.me') || 
                       link.getAttribute('href')?.includes('whatsapp'))
      
      expect(whatsappLinks.length).toBeGreaterThan(0)
    })
  })

  it('should handle different pathname values', () => {
    // Test home page
    mockUsePathname.mockReturnValue('/home')
    const { rerender } = render(<MainLayout>{mockChildren}</MainLayout>)
    expect(screen.getByTestId('main-children')).toBeInTheDocument()

    // Test welcome page
    mockUsePathname.mockReturnValue('/')
    rerender(<MainLayout>{mockChildren}</MainLayout>)
    expect(screen.getByTestId('main-children')).toBeInTheDocument()

    // Test other page
    mockUsePathname.mockReturnValue('/about')
    rerender(<MainLayout>{mockChildren}</MainLayout>)
    expect(screen.getByTestId('main-children')).toBeInTheDocument()
  })

  it('should handle authenticated user state', () => {
    mockUseAuthStore.mockReturnValue({
      ...defaultAuthStore,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['client']
      }
    })

    render(<MainLayout>{mockChildren}</MainLayout>)

    expect(screen.getByTestId('nav-items')).toBeInTheDocument()
    expect(screen.getByTestId('main-children')).toBeInTheDocument()
  })

  it('should handle cart state', () => {
    mockUseCartStore.mockReturnValue({
      ...defaultCartStore,
      cart: {
        id: 'cart-1',
        items: [
          { id: 'item-1', name: 'Candle 1', price: 10.99, quantity: 2 }
        ]
      }
    })

    render(<MainLayout>{mockChildren}</MainLayout>)

    expect(screen.getByTestId('nav-items')).toBeInTheDocument()
    expect(screen.getByTestId('main-children')).toBeInTheDocument()
  })

  it('should render with proper layout structure and CSS classes', () => {
    render(<MainLayout>{mockChildren}</MainLayout>)

    // Check main container
    const container = screen.getByRole('banner').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen')

    // Check header
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b')

    // Check main
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1')

    // Check footer
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('border-t', 'py-6', 'md:py-0')
  })

  it('should render children content correctly', () => {
    const customChildren = (
      <div data-testid="custom-content">
        <h1>Welcome</h1>
        <p>This is custom content</p>
      </div>
    )

    render(<MainLayout>{customChildren}</MainLayout>)

    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('This is custom content')).toBeInTheDocument()
  })

  it('should call UserService.getAdminPhone only once on mount', async () => {
    const { rerender } = render(<MainLayout>{mockChildren}</MainLayout>)

    await waitFor(() => {
      expect(mockUserService.getAdminPhone).toHaveBeenCalledTimes(1)
    })

    // Rerender component
    rerender(<MainLayout><div>Updated Content</div></MainLayout>)

    // Service should not be called again
    expect(mockUserService.getAdminPhone).toHaveBeenCalledTimes(1)
  })

  it('should maintain WhatsApp state through rerenders', async () => {
    const mockPhoneData = {
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    }
    mockUserService.getAdminPhone.mockResolvedValue(mockPhoneData)

    const { rerender } = render(<MainLayout>{mockChildren}</MainLayout>)

    await waitFor(() => {
      const whatsappLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href')?.includes('wa.me/573001234567'))
      expect(whatsappLink).toBeInTheDocument()
    })

    // Rerender with different children
    rerender(<MainLayout><div data-testid="new-content">New Content</div></MainLayout>)

    // WhatsApp link should still be correct
    await waitFor(() => {
      const whatsappLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href')?.includes('wa.me/573001234567'))
      expect(whatsappLink).toBeInTheDocument()
    })

    expect(screen.getByTestId('new-content')).toBeInTheDocument()
  })

  it('should handle component unmounting gracefully', () => {
    const { unmount } = render(<MainLayout>{mockChildren}</MainLayout>)
    
    // Should not throw error when unmounting
    expect(() => unmount()).not.toThrow()
  })
})
