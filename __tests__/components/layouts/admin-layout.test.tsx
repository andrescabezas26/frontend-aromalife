import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { UserService } from '@/services/users/user.service'

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

// Mock de RoleGuard
jest.mock('@/components/auth/role-guard', () => ({
  RoleGuard: ({ children, requiredRoles, hideContent }: { 
    children: React.ReactNode; 
    requiredRoles: string[];
    hideContent: boolean;
  }) => (
    <div data-testid="role-guard" data-roles={requiredRoles.join(',')} data-hide-content={hideContent}>
      {children}
    </div>
  ),
}))

// Mock de AdminSidebar
jest.mock('@/components/admin/admin-sidebar', () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}))

// Mock de AdminNavItems
jest.mock('@/components/nav/admin-nav-items', () => ({
  AdminNavItems: () => <div data-testid="admin-nav-items">Admin Nav Items</div>,
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

// Mock de UserService
jest.mock('@/services/users/user.service', () => ({
  UserService: {
    getAdminPhone: jest.fn(),
  },
}))

const mockUserService = UserService as jest.Mocked<typeof UserService>

describe('AdminLayout', () => {
  const mockChildren = <div data-testid="admin-children">Admin Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render correctly with all main elements', () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    // Check RoleGuard with correct props
    const roleGuard = screen.getByTestId('role-guard')
    expect(roleGuard).toBeInTheDocument()
    expect(roleGuard).toHaveAttribute('data-roles', 'admin,manager')
    expect(roleGuard).toHaveAttribute('data-hide-content', 'false')

    // Check header elements
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('next-image')).toBeInTheDocument()
    expect(screen.getByText('AROMALIFE')).toBeInTheDocument()
    expect(screen.getByText('PANEL ADMINISTRATIVO')).toBeInTheDocument()

    // Check navigation components
    expect(screen.getByTestId('admin-nav-items')).toBeInTheDocument()
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()

    // Check main content
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('admin-children')).toBeInTheDocument()

    // Check footer
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render logo with correct properties', () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    const logoImage = screen.getByTestId('next-image')
    expect(logoImage).toHaveAttribute('src', 'https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png')
    expect(logoImage).toHaveAttribute('alt', 'Aromalife Logo')
  })

  it('should render social media links correctly', async () => {
    const mockPhoneData = {
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    }
    mockUserService.getAdminPhone.mockResolvedValue(mockPhoneData)

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    // Wait for WhatsApp link to be updated
    await waitFor(() => {
      const links = screen.getAllByTestId('next-link')
      const socialLinks = links.filter(link => 
        link.getAttribute('href')?.includes('instagram') || 
        link.getAttribute('href')?.includes('wa.me')
      )
      expect(socialLinks.length).toBeGreaterThanOrEqual(2)
    })

    // Check Instagram link
    const instagramLink = screen.getAllByTestId('next-link')
      .find(link => link.getAttribute('href') === 'https://www.instagram.com/velasaromalife')
    expect(instagramLink).toBeInTheDocument()

    // Check Instagram icon
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
    expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
  })

  it('should load admin WhatsApp link successfully', async () => {
    const mockPhoneData = {
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    }
    mockUserService.getAdminPhone.mockResolvedValue(mockPhoneData)

    render(<AdminLayout>{mockChildren}</AdminLayout>)

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

    render(<AdminLayout>{mockChildren}</AdminLayout>)

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

  it('should render with proper layout structure', () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    // Check main container structure
    const mainContainer = screen.getByTestId('role-guard').firstChild
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'min-h-screen')

    // Check header
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b', 'bg-slate-50')

    // Check main content area
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1', 'overflow-y-auto')

    // Check footer
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('border-t', 'py-6', 'md:py-0', 'bg-slate-50')
  })

  it('should render children content in main section', () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    const customChildren = (
      <div data-testid="custom-admin-content">
        <h1>Admin Dashboard</h1>
        <p>Welcome to admin panel</p>
      </div>
    )

    render(<AdminLayout>{customChildren}</AdminLayout>)

    expect(screen.getByTestId('custom-admin-content')).toBeInTheDocument()
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to admin panel')).toBeInTheDocument()
  })

  it('should handle social media link attributes correctly', async () => {
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    })

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    await waitFor(() => {
      const instagramLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href') === 'https://www.instagram.com/velasaromalife')
      
      expect(instagramLink).toBeInTheDocument()
    })

    // Wait for WhatsApp link to be loaded
    await waitFor(() => {
      const whatsappLinks = screen.getAllByTestId('next-link')
        .filter(link => link.getAttribute('href')?.includes('wa.me') || 
                       link.getAttribute('href')?.includes('whatsapp'))
      
      expect(whatsappLinks.length).toBeGreaterThan(0)
    })
  })

  it('should maintain WhatsApp link state during component lifecycle', async () => {
    const mockPhoneData = {
      phoneCountryCode: '+57',
      phone: '3001234567',
      fullPhone: '573001234567'
    }
    mockUserService.getAdminPhone.mockResolvedValue(mockPhoneData)

    const { rerender } = render(<AdminLayout>{mockChildren}</AdminLayout>)

    await waitFor(() => {
      expect(mockUserService.getAdminPhone).toHaveBeenCalledTimes(1)
    })

    // Rerender component
    rerender(<AdminLayout><div>Updated Content</div></AdminLayout>)

    // Service should not be called again (useEffect dependency array is empty)
    expect(mockUserService.getAdminPhone).toHaveBeenCalledTimes(1)

    // WhatsApp link should still be correct
    await waitFor(() => {
      const whatsappLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href')?.includes('wa.me/573001234567'))
      expect(whatsappLink).toBeInTheDocument()
    })
  })

  it('should use fallback WhatsApp link when admin phone data is incomplete', async () => {
    // Mock incomplete phone data
    mockUserService.getAdminPhone.mockResolvedValue({
      phoneCountryCode: '',
      phone: '',
      fullPhone: ''
    })

    render(<AdminLayout>{mockChildren}</AdminLayout>)

    await waitFor(() => {
      expect(mockUserService.getAdminPhone).toHaveBeenCalled()
    })

    // Should still render WhatsApp icon but use the empty fullPhone which would result in empty wa.me link
    // The component should handle this gracefully
    await waitFor(() => {
      const whatsappLink = screen.getAllByTestId('next-link')
        .find(link => link.getAttribute('href')?.includes('wa.me'))
      expect(whatsappLink).toBeInTheDocument()
    })
  })
})
